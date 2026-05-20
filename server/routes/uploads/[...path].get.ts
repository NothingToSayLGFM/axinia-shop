import { readFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path')
  if (!path) throw createError({ statusCode: 404 })

  const isProd = process.env.NODE_ENV === 'production'
  const uploadsDir = isProd
    ? join(process.cwd(), '.output', 'public', 'uploads')
    : join(process.cwd(), 'public', 'uploads')

  try {
    const data = await readFile(join(uploadsDir, path))
    const ext = path.split('.').pop()?.toLowerCase() ?? ''
    const mime: Record<string, string> = {
      png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
      webp: 'image/webp', avif: 'image/avif',
    }
    setHeader(event, 'Content-Type', mime[ext] ?? 'application/octet-stream')
    setHeader(event, 'Cache-Control', 'public, max-age=604800, immutable')
    return data
  } catch {
    throw createError({ statusCode: 404, message: 'File not found' })
  }
})
