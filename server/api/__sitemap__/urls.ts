export default defineEventHandler(async () => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  })

  return products.map((p) => ({
    loc: `/shop/${p.slug}`,
    lastmod: p.updatedAt.toISOString(),
    changefreq: 'weekly',
    priority: 0.8,
  }))
})
