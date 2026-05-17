export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const review = await prisma.review.update({
    where: { id },
    data: { isPublished: body.isPublished },
  })

  return review
})
