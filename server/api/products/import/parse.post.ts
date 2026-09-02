import { requireAuth } from '../../../utils/auth'
import { generateUniqueSlug } from '../../../utils/slug'
import { parsePriceWithCurrency, extractShortDescriptionFromHtml, sanitizeDescriptionHtml, appendSpecsHtml } from '../../../utils/productImport'
import { streamRssItems } from '../../../utils/xmlItemStream'

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

interface BestArticle {
  price: number | null
  keeperOccurrence: number
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim())
}

// Відповідь стрімиться по одному рядку NDJSON на товар (перший рядок — статистика) замість
// одного великого JSON-обʼєкта з усіма 3000+ товарами одразу — на дроплеті з 1GB RAM
// повна DOM-збірка такого фіда валила Node в heap out of memory.
export default defineEventHandler(async (event) => {
  requireAuth(event)

  const files = await readMultipartFormData(event)
  const file = files?.[0]
  if (!file?.data) throw createError({ statusCode: 400, message: 'Файл не передано' })

  const xml = file.data.toString('utf-8')

  // Прохід 1: лише артикул (g:id) + ціна — щоб дешево (без HTML/картинок у памʼяті)
  // визначити дублікати за артикулом у межах файлу й лишити найдешевший варіант.
  const bestByArticle = new Map<string, BestArticle>()
  const occurrenceCountPass1 = new Map<string, number>()
  let totalItems = 0

  try {
    streamRssItems(xml, (raw) => {
      totalItems += 1
      const article = raw.id.trim()
      if (!article) return

      const occurrence = (occurrenceCountPass1.get(article) ?? 0) + 1
      occurrenceCountPass1.set(article, occurrence)

      const price = parsePriceWithCurrency(raw.price)
      const best = bestByArticle.get(article)
      if (!best) {
        bestByArticle.set(article, { price, keeperOccurrence: occurrence })
      } else if (price !== null && (best.price === null || price < best.price)) {
        bestByArticle.set(article, { price, keeperOccurrence: occurrence })
      }
    })
  } catch {
    throw createError({ statusCode: 400, message: 'Не вдалося розпарсити XML' })
  }

  if (!totalItems) {
    throw createError({
      statusCode: 400,
      message: 'У файлі не знайдено товарів — очікується Google Merchant RSS (<rss><channel><item>)',
    })
  }

  const articles = [...bestByArticle.keys()]
  const duplicatesSkipped = totalItems - articles.length

  const existingProducts = await prisma.product.findMany({
    where: { article: { in: articles } },
    include: { categories: { take: 1 }, images: { orderBy: { sortOrder: 'asc' } } },
  })
  const existingByArticle = new Map(existingProducts.filter((p) => p.article).map((p) => [p.article as string, p]))
  const takenSlugs = new Set((await prisma.product.findMany({ select: { slug: true } })).map((p) => p.slug))

  setResponseHeader(event, 'Content-Type', 'application/x-ndjson; charset=utf-8')
  event.node.res.write(`${JSON.stringify({
    type: 'stats',
    stats: {
      total: articles.length,
      new: articles.filter((a) => !existingByArticle.has(a)).length,
      updating: articles.filter((a) => existingByArticle.has(a)).length,
      duplicatesSkipped,
    },
  })}\n`)

  // Прохід 2: повна обробка (санітизація опису, картинки, slug) — по одному товару за раз,
  // одразу пишемо в потік відповіді й переходимо до наступного, не накопичуючи масив із 3000+ рядків.
  const occurrenceCountPass2 = new Map<string, number>()

  streamRssItems(xml, (raw) => {
    const article = raw.id.trim()
    if (!article) return

    const occurrence = (occurrenceCountPass2.get(article) ?? 0) + 1
    occurrenceCountPass2.set(article, occurrence)

    const best = bestByArticle.get(article)
    if (!best || best.keeperOccurrence !== occurrence) return // програв дублікат — пропускаємо

    const existing = existingByArticle.get(article) ?? null
    const rawHtml = raw.description.trim()
    const htmlWithSpecs = appendSpecsHtml(
      rawHtml,
      raw.productDetails.map((d) => ({ product_name: d.name, product_value: d.value })),
    )
    const images = [raw.imageLink, ...raw.additionalImageLinks].filter(isHttpUrl)

    const row: ImportPreviewRow = {
      article,
      name: raw.title.trim() || article,
      slug: existing?.slug ?? generateUniqueSlug(raw.title.trim() || article, takenSlugs),
      price: best.price,
      inStock: raw.availability.trim().toLowerCase() === 'in stock',
      description: extractShortDescriptionFromHtml(rawHtml),
      longDescription: sanitizeDescriptionHtml(htmlWithSpecs),
      images: existing
        ? existing.images.map((img) => ({ url: img.url, isMain: img.isMain, sortOrder: img.sortOrder }))
        : images.map((url, i) => ({ url, isMain: i === 0, sortOrder: i })),
      categoryId: existing?.categories[0]?.id ?? null,
      existingId: existing?.id ?? null,
    }

    event.node.res.write(`${JSON.stringify({ type: 'row', row })}\n`)
  })

  event.node.res.end()
})
