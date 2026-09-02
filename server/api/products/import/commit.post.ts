import { z } from 'zod'
import { requireAuth } from '../../../utils/auth'

const imageSchema = z.object({
  url: z.string().min(1),
  isMain: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
})

const rowSchema = z.object({
  existingId: z.number().int().nullable(),
  article: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  price: z.number().positive().nullable(),
  inStock: z.boolean(),
  description: z.string().optional(),
  longDescription: z.string().nullable().optional(),
  categoryId: z.number().int().nullable(),
  images: z.array(imageSchema),
  imagesTouched: z.boolean(),
})

const schema = z.object({ rows: z.array(rowSchema).min(1) })

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const { rows } = await readValidatedBody(event, schema.parse)

  const results = await Promise.allSettled(
    rows.map((row) => {
      const categoryIds = row.categoryId !== null ? [row.categoryId] : []
      const images = row.images.map((img, i) => ({ ...img, sortOrder: img.sortOrder ?? i }))

      const data = {
        name: row.name,
        slug: row.slug,
        article: row.article,
        price: row.price,
        inStock: row.inStock,
        description: row.description,
        longDescription: row.longDescription,
      }

      if (row.existingId) {
        return prisma.product.update({
          where: { id: row.existingId },
          data: {
            ...data,
            categories: { set: categoryIds.map((id) => ({ id })) },
            // Галерею при оновленні чіпаємо тільки якщо її свідомо змінили в прев'ю —
            // інакше ризикуємо затерти вже наявні фото товару щоразу, як переімпортовуємо ціни.
            ...(row.imagesTouched && {
              images: { deleteMany: {}, create: images },
            }),
          },
        })
      }

      return prisma.product.create({
        data: {
          ...data,
          isActive: true,
          isHit: false,
          categories: { connect: categoryIds.map((id) => ({ id })) },
          images: { create: images },
        },
      })
    })
  )

  let created = 0
  let updated = 0
  const failed: { article: string; error: string }[] = []

  results.forEach((result, i) => {
    const row = rows[i]!
    if (result.status === 'fulfilled') {
      if (row.existingId) updated += 1
      else created += 1
    } else {
      const message = result.reason instanceof Error ? result.reason.message : 'Невідома помилка'
      failed.push({ article: row.article, error: message })
    }
  })

  return { created, updated, failed }
})
