export default defineEventHandler(async () => {
  return prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
  })
})
