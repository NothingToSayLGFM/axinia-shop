export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const name = (body.name as string)?.trim()
  const email = (body.email as string)?.trim() || null
  const text = (body.text as string)?.trim()
  const rating = Number(body.rating)

  if (!name || !text || !rating || rating < 1 || rating > 5) {
    throw createError({ statusCode: 400, message: 'Невірні дані' })
  }

  const review = await prisma.review.create({
    data: { name, email, text, rating, isPublished: false },
  })

  return review
})
