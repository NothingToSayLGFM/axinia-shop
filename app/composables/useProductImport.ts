export interface ProductImportImage {
  url: string
  isMain: boolean
  sortOrder: number
}

export interface ProductImportRow {
  article: string
  name: string
  slug: string
  price: number | null
  inStock: boolean
  description: string
  longDescription: string
  images: ProductImportImage[]
  categoryId: number | null
  existingId: number | null
  imagesTouched: boolean
}

export interface ProductImportStats {
  total: number
  new: number
  updating: number
  duplicatesSkipped: number
}

export interface ProductImportState {
  rows: ProductImportRow[]
  stats: ProductImportStats
}

export const useProductImportState = () => useState<ProductImportState | null>('product-import', () => null)
