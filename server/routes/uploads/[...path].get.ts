import { readFile } from 'fs/promises'
import { join, normalize } from 'path'

export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path')
  if (!path || normalize(path).startsWith('..')) throw createError({ statusCode: 404 })

  const uploadsDir = getUploadsDir()

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
