import { XMLParser } from 'fast-xml-parser'
import { requireAuth } from '../../../utils/auth'
import { generateUniqueSlug } from '../../../utils/slug'
import { parsePriceWithCurrency, extractShortDescriptionFromHtml, sanitizeDescriptionHtml, appendSpecsHtml } from '../../../utils/productImport'

// Формат фіда: Google Merchant RSS <rss><channel><item g:id="..."><g:title>...
interface GoogleRssItem {
  id?: string
  title?: string
  description?: string
  image_link?: string
  additional_image_link?: string | string[]
  price?: string
  availability?: string
  product_detail?: { product_name?: string; product_value?: string } | { product_name?: string; product_value?: string }[]
}

interface NormalizedItem {
  article: string
  name: string
  price: number | null
  inStock: boolean
  shortDescription: string
  longDescriptionHtml: string
  images: string[] // впорядковані URL, перший — головний
}

export interface ImportPreviewRow {
  article: string
  name: string
  slug: string
  price: number | null
  inStock: boolean
  description: string
  longDescription: string
  images: { url: string; isMain: boolean; sortOrder: number }[]
  categoryId: number | null
  existingId: number | null
}

function isHttpUrl(value: unknown): value is string {
  return typeof value === 'string' && /^https?:\/\//i.test(value.trim())
}

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

function normalizeItems(parsed: { rss?: { channel?: { item?: GoogleRssItem | GoogleRssItem[] } } }): NormalizedItem[] {
  return toArray(parsed.rss?.channel?.item)
    .map((item): NormalizedItem | null => {
      const article = String(item.id ?? '').trim()
      if (!article) return null

      const rawHtml = (item.description ?? '').trim()
      const details = toArray(item.product_detail)
      const htmlWithSpecs = appendSpecsHtml(rawHtml, details)
      const images = [item.image_link, ...toArray(item.additional_image_link)].filter(isHttpUrl)
      const availability = String(item.availability ?? '').trim().toLowerCase()

      return {
        article,
        name: (item.title ?? '').trim() || article,
        price: parsePriceWithCurrency(item.price),
        inStock: availability === 'in stock',
        shortDescription: extractShortDescriptionFromHtml(rawHtml),
        longDescriptionHtml: sanitizeDescriptionHtml(htmlWithSpecs),
        images,
      }
    })
    .filter((item): item is NormalizedItem => item !== null)
}

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const files = await readMultipartFormData(event)
  const file = files?.[0]
  if (!file?.data) throw createError({ statusCode: 400, message: 'Файл не передано' })

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    removeNSPrefix: true,
    // За замовчуванням fast-xml-parser перетворює текст, що виглядає як число, на JS number
    // (напр. <g:product_value>10</g:product_value> → 10) — вимикаємо, бо це ламає рядкові .replace() нижче.
    parseTagValue: false,
    parseAttributeValue: false,
    isArray: (name) => ['item', 'additional_image_link', 'product_detail'].includes(name),
  })

  let parsed: { rss?: { channel?: { item?: GoogleRssItem | GoogleRssItem[] } } }
  try {
    parsed = parser.parse(file.data.toString('utf-8'))
  } catch {
    throw createError({ statusCode: 400, message: 'Не вдалося розпарсити XML' })
  }

  if (!parsed.rss?.channel) {
    throw createError({ statusCode: 400, message: 'Невідомий формат фіда — очікується Google Merchant RSS (<rss><channel><item>)' })
  }

  const normalized = normalizeItems(parsed)
  if (!normalized.length) {
    throw createError({ statusCode: 400, message: 'У файлі не знайдено товарів' })
  }

  // Дублікати за артикулом (g:id) в межах самого файлу — лишаємо найдешевший
  const byArticle = new Map<string, NormalizedItem>()
  let duplicatesSkipped = 0
  for (const item of normalized) {
    const existing = byArticle.get(item.article)
    if (!existing) {
      byArticle.set(item.article, item)
      continue
    }

    duplicatesSkipped += 1
    if (item.price !== null && (existing.price === null || item.price < existing.price)) {
      byArticle.set(item.article, item)
    }
  }

  const articles = [...byArticle.keys()]
  const existingProducts = await prisma.product.findMany({
    where: { article: { in: articles } },
    include: { categories: { take: 1 }, images: { orderBy: { sortOrder: 'asc' } } },
  })
  const existingByArticle = new Map(existingProducts.filter((p) => p.article).map((p) => [p.article as string, p]))

  const takenSlugs = new Set((await prisma.product.findMany({ select: { slug: true } })).map((p) => p.slug))

  const rows: ImportPreviewRow[] = articles.map((article) => {
    const item = byArticle.get(article)!
    const existing = existingByArticle.get(article) ?? null

    // Для товару, що вже є в базі — показуємо його поточну галерею (щоб не загубити фото при оновленні ціни/опису).
    // Для нового товару — підставляємо картинки з фіда.
    const images = existing
      ? existing.images.map((img) => ({ url: img.url, isMain: img.isMain, sortOrder: img.sortOrder }))
      : item.images.map((url, i) => ({ url, isMain: i === 0, sortOrder: i }))

    return {
      article,
      name: item.name,
      slug: existing?.slug ?? generateUniqueSlug(item.name, takenSlugs),
      price: item.price,
      inStock: item.inStock,
      description: item.shortDescription,
      longDescription: item.longDescriptionHtml,
      images,
      categoryId: existing?.categories[0]?.id ?? null,
      existingId: existing?.id ?? null,
    }
  })

  return {
    rows,
    stats: {
      total: rows.length,
      new: rows.filter((r) => !r.existingId).length,
      updating: rows.filter((r) => r.existingId).length,
      duplicatesSkipped,
    },
  }
})
