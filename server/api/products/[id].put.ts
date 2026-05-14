import { z } from "zod";

const imageSchema = z.object({
  url: z.string().min(1),
  isMain: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

const schema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  longDescription: z.string().nullable().optional(),
  price: z.number().positive().nullable().optional(),
  article: z.string().nullable().optional(),
  slug: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  inStock: z.boolean().optional(),
  isHit: z.boolean().optional(),
  categoryIds: z.array(z.number().int()).optional(),
  images: z.array(imageSchema).optional(),
});

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  const body = await readValidatedBody(event, schema.parse);
  const { categoryIds, images, ...data } = body;

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...data,
      ...(categoryIds !== undefined && {
        categories: { set: categoryIds.map((id) => ({ id })) },
      }),
      ...(images !== undefined && {
        images: {
          deleteMany: {},
          create: images.map((img, i) => ({ ...img, sortOrder: img.sortOrder ?? i })),
        },
      }),
    },
    include: { categories: true, images: { orderBy: { sortOrder: 'asc' } } },
  });
  return product;
});
