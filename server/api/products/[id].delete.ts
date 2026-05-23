import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const id = getRouterParam(event, "id");
  await prisma.product.delete({ where: { id: Number(id) } });
  return { success: true };
});
