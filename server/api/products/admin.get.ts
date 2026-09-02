import { requireAuth } from '../../utils/auth'

// Пагінований список товарів для адмінки — на відміну від публічного GET /api/products
// не фільтрує isActive (адмін має бачити і приховані товари) і завжди приймає статус явно.
export default defineEventHandler(async (event) => {
  requireAuth(event)
  const query = getQuery(event)

  const search = (query.search as string)?.trim() || undefined
  const categoryId = query.categoryId ? Number(query.categoryId) : undefined
  const status = query.status as string | undefined // 'active' | 'hidden' | undefined (усі)
  const page = query.page ? Math.max(1, Number(query.page)) : 1
  const limit = query.limit ? Number(query.limit) : 20

  const where = {
    ...(categoryId && { categories: { some: { id: categoryId } } }),
    ...(status === 'active' && { isActive: true }),
    ...(status === 'hidden' && { isActive: false }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { article: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

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
})
