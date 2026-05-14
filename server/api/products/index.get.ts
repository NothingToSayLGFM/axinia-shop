export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const categorySlugs = (query.category as string)?.split(',').filter(Boolean) ?? []
  const categoryId = query.categoryId ? Number(query.categoryId) : undefined
  const isHit = query.isHit === 'true' ? true : undefined
  const search = (query.search as string)?.trim() || undefined
  const minPrice = query.minPrice ? Number(query.minPrice) : undefined
  const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined
  const page = query.page ? Number(query.page) : undefined
  const limit = 10

  let resolvedCategoryIds: number[] = categoryId ? [categoryId] : []
  if (categorySlugs.length > 0 && resolvedCategoryIds.length === 0) {
    const cats = await prisma.category.findMany({
      where: { slug: { in: categorySlugs } },
      select: { id: true },
    })
    resolvedCategoryIds = cats.map(c => c.id)
  }

  const where = {
    isActive: true,
    ...(isHit !== undefined && { isHit }),
    ...(resolvedCategoryIds.length > 0 && { categories: { some: { id: { in: resolvedCategoryIds } } } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { article: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      price: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    }),
  }

  if (page) {
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { categories: true, images: { orderBy: { sortOrder: 'asc' } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])
    return { items, total }
  }

  return prisma.product.findMany({
    where,
    include: { categories: true, images: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  })
})
