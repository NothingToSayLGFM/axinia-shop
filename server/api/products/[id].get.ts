export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: { categories: true, images: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!product) throw createError({ statusCode: 404, message: "Product not found" });
  return product;
});
