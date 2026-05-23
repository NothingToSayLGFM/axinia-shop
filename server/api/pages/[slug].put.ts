import { requireAuth } from '../../utils/auth'

const MAX_CONTENT_SIZE = 500 * 1024 // 500KB

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const slug = getRouterParam(event, 'slug')!
  const { content } = await readBody<{ content: string }>(event)

  if (typeof content !== 'string') {
    throw createError({ statusCode: 400, message: 'Invalid content' })
  }
  if (content.length > MAX_CONTENT_SIZE) {
    throw createError({ statusCode: 400, message: 'Content too large (max 500KB)' })
  }

  return prisma.staticPage.upsert({
    where: { slug },
    update: { content },
    create: { slug, content },
  })
})
