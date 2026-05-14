export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  await prisma.category.delete({ where: { id: Number(id) } });
  return { success: true };
});
