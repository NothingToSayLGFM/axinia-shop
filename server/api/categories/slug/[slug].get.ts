export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!

  const category = await prisma.category.findUnique({
    where: { slug },
  })

  if (!category) {
    throw createError({ statusCode: 404, message: 'Категорію не знайдено' })
  }

  return category
})
