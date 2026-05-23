import { requireAuth } from '../utils/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

function isImageBuffer(buf: Buffer): boolean {
  if (buf.length < 12) return false
  // JPEG: FF D8 FF
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return true
  // PNG: 89 50 4E 47
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return true
  // WebP: RIFF....WEBP
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return true
  // AVIF/HEIF: ftyp box at offset 4
  if (buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) return true
  return false
}

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const files = await readMultipartFormData(event)
  if (!files?.length) throw createError({ statusCode: 400, message: 'No file provided' })

  const file = files[0]
  if (!file?.filename || !file?.data) throw createError({ statusCode: 400, message: 'Invalid file' })

  if (file.data.length > MAX_FILE_SIZE) {
    throw createError({ statusCode: 400, message: 'File too large (max 10MB)' })
  }

  if (!isImageBuffer(file.data)) {
    throw createError({ statusCode: 400, message: 'Only images allowed' })
  }

  const isProd = process.env.NODE_ENV === 'production'
  const uploadsDir = isProd
    ? join(process.cwd(), '.output', 'public', 'uploads')
    : join(process.cwd(), 'public', 'uploads')

  await mkdir(uploadsDir, { recursive: true })

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`
  const webpData = await sharp(file.data)
    .resize({ width: 600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer()

  await writeFile(join(uploadsDir, filename), webpData)

  return { url: `/uploads/${filename}` }
})
