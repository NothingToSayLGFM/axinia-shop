export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { categories: true, images: { orderBy: { sortOrder: 'asc' } } },
  })
  if (!product) throw createError({ statusCode: 404, message: 'Product not found' })
  return product
})
