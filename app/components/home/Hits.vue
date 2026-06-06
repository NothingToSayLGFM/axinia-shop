<script setup lang="ts">
import { Button } from '@/components/ui/button'

interface ProductImage { url: string; isMain: boolean }
interface Product {
  id: number
  slug: string
  name: string | null
  description: string | null
  price: string | number | null
  images: ProductImage[]
  categories: { slug: string }[]
}

const { data: rawProducts, status } = await useFetch('/api/products', { query: { isHit: 'true' } })
const pending = computed(() => status.value === 'pending')
const products = computed(() => rawProducts.value as unknown as Product[])
</script>

<template>
  <CommonContainer>
    <h2 class="mb-8 text-2xl font-bold text-foreground sm:text-3xl">Хіт продаж</h2>

    <div v-if="pending" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="i in 4" :key="i" class="rounded-xl overflow-hidden bg-muted animate-pulse">
        <div class="aspect-[4/3] bg-muted-foreground/10" />
        <div class="p-4 space-y-2">
          <div class="h-4 bg-muted-foreground/10 rounded w-3/4" />
          <div class="h-3 bg-muted-foreground/10 rounded w-1/2" />
          <div class="h-5 bg-muted-foreground/10 rounded w-1/3 mt-2" />
        </div>
      </div>
    </div>

    <div v-else-if="products?.length" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <CommonProductCard
        v-for="product in products"
        :key="product.id"
        :id="product.id"
        :slug="product.slug"
        :category-slug="product.categories?.[0]?.slug ?? null"
        :images="product.images"
        :name="product.name"
        :description="product.description"
        :price="product.price"
        :in-stock="product.inStock"
      />
    </div>

    <div v-else class="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
      <Icon name="lucide:package-open" class="h-12 w-12 mb-4 opacity-30" />
      <p class="text-lg font-medium">Хіти продаж скоро з'являться</p>
      <p class="text-sm mt-1">Поки що тут порожньо — зайдіть пізніше</p>
    </div>

    <div v-if="products?.length" class="mt-10 flex justify-center">
      <Button variant="outline" size="lg" class="w-full cursor-pointer sm:w-auto" as-child>
        <NuxtLink to="/shop">Переглянути всі</NuxtLink>
      </Button>
    </div>
  </CommonContainer>
</template>
