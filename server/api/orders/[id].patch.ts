import { z } from 'zod'

const schema = z.object({
  status: z.enum(['new', 'processing', 'shipped', 'delivered', 'cancelled']),
})

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid id' })

  const body = await readValidatedBody(event, schema.parse)

  return prisma.order.update({
    where: { id },
    data: { status: body.status },
    include: { items: true },
  })
})
