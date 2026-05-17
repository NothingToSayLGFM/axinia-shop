export default defineEventHandler(async () => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      slug: true,
      updatedAt: true,
      categories: { select: { slug: true }, orderBy: { sortOrder: 'asc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return products.map((p) => {
    const categorySlug = p.categories[0]?.slug
    return {
      loc: categorySlug ? `/shop/${categorySlug}/${p.slug}` : `/shop/${p.slug}`,
      lastmod: p.updatedAt.toISOString(),
      changefreq: 'weekly',
      priority: 0.8,
    }
  })
})
