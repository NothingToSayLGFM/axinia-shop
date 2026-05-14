export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!
  const { content } = await readBody<{ content: string }>(event)

  return prisma.staticPage.upsert({
    where: { slug },
    update: { content },
    create: { slug, content },
  })
})
