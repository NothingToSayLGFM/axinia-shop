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
  price: z.number().positive().optional(),
  article: z.string().optional(),
  slug: z.string().min(1),
  isActive: z.boolean().default(true),
  inStock: z.boolean().default(true),
  isHit: z.boolean().default(false),
  categoryIds: z.array(z.number().int()).default([]),
  images: z.array(imageSchema).default([]),
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, schema.parse);
  const { categoryIds, images, ...data } = body;

  const product = await prisma.product.create({
    data: {
      ...data,
      categories: { connect: categoryIds.map((id) => ({ id })) },
      images: { create: images.map((img, i) => ({ ...img, sortOrder: img.sortOrder ?? i })) },
    },
    include: { categories: true, images: { orderBy: { sortOrder: 'asc' } } },
  });
  return product;
});
