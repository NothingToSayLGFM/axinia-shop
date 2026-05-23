import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  return prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
  })
})
