import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  image: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readValidatedBody(event, schema.parse);
  const category = await prisma.category.update({
    where: { id: Number(id) },
    data: body,
  });
  return category;
});
