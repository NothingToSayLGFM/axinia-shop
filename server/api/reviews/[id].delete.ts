import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))
  await prisma.review.delete({ where: { id } })
  return { ok: true }
})
