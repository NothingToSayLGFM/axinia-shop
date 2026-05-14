export default defineEventHandler(async () => {
  return prisma.staticPage.findMany()
})
