export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!
  const page = await prisma.staticPage.findUnique({ where: { slug } })
  return page ?? { slug, content: '' }
})
