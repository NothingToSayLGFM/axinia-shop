export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const sort = query.sort as string | undefined

  const orderBy =
    sort === 'rating_desc' ? { rating: 'desc' as const } :
    sort === 'oldest' ? { createdAt: 'asc' as const } :
    { createdAt: 'desc' as const }

  const [reviews, total, ratingAgg] = await Promise.all([
    prisma.review.findMany({
      where: { isPublished: true },
      orderBy,
    }),
    prisma.review.count({ where: { isPublished: true } }),
    prisma.review.aggregate({
      where: { isPublished: true },
      _avg: { rating: true },
    }),
  ])

  return {
    reviews,
    total,
    avgRating: ratingAgg._avg.rating ? Math.round(ratingAgg._avg.rating * 10) / 10 : 0,
  }
})
