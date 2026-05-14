import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  image: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, schema.parse);
  const category = await prisma.category.create({ data: body });
  return category;
});
