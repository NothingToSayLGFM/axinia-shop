import { join } from 'path'

// Має збігатись з монтуванням volume `axinia_uploads` в docker-compose.prod.yml
// (`/app/output/public/uploads`, БЕЗ крапки) — це той самий каталог, звідки
// @nuxt/image резолвить fs.dir для IPX (відносно реального розташування
// server/index.mjs в контейнері), тож розбіжність тут ламає оптимізацію картинок.
export function getUploadsDir(): string {
  const isProd = process.env.NODE_ENV === 'production'
  return isProd
    ? join(process.cwd(), 'output', 'public', 'uploads')
    : join(process.cwd(), 'public', 'uploads')
}
