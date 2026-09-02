export interface ProductImage {
  id: number
  url: string
  isMain: boolean
  sortOrder: number
}

export interface ProductCategory {
  id: number
  name: string
  slug: string
}

export interface Product {
  id: number
  name: string | null
  slug: string
  description: string | null
  longDescription: string | null
  price: string | number | null
  article: string | null
  inStock: boolean
  images: ProductImage[]
  categories: ProductCategory[]
}

export interface Category {
  id: number
  name: string
  slug: string
  image?: string | null
}
