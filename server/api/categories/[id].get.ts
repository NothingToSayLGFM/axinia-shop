export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const category = await prisma.category.findUnique({
    where: { id: Number(id) },
    include: { products: true },
  });
  if (!category) throw createError({ statusCode: 404, message: "Category not found" });
  return category;
});
