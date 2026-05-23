import { z } from 'zod'
import { rateLimit } from '../../utils/rateLimit'

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.email().max(200).optional().or(z.literal('')),
  text: z.string().min(1).max(2000),
  rating: z.number().int().min(1).max(5),
})

export default defineEventHandler(async (event) => {
  rateLimit(event, { max: 3, windowMs: 60 * 60 * 1000 })
  const body = await readValidatedBody(event, schema.parse)

  const review = await prisma.review.create({
    data: {
      name: body.name,
      email: body.email || null,
      text: body.text,
      rating: body.rating,
      isPublished: false,
    },
  })

  return review
})
