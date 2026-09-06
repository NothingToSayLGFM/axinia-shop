export default defineEventHandler(async () => {
  // Тільки товари з категорією: сторінка товару живе виключно за /shop/:category/:slug,
  // короткий URL без категорії тепер 301-иться або віддає 404 — такі посилання в sitemap не місце.
  const products = await prisma.product.findMany({
    where: { isActive: true, categories: { some: {} } },
    select: {
      slug: true,
      updatedAt: true,
      categories: { select: { slug: true }, orderBy: { sortOrder: 'asc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return products.flatMap((p) => {
    const categorySlug = p.categories[0]?.slug
    if (!categorySlug) return []
    return [{
      loc: `/shop/${categorySlug}/${p.slug}`,
      lastmod: p.updatedAt.toISOString(),
      changefreq: 'weekly',
      priority: 0.8,
    }]
  })
})
