<script setup lang="ts">
const route = useRoute()
const categorySlug = route.params.category as string
const slug = route.params.slug as string

// Без явного generic — Nuxt сам виводить точний тип відповіді з обробника /api/products/slug/[slug].get.ts
const { data: product, error } = await useFetch(`/api/products/slug/${slug}`)
if (error.value) {
  throw createError({ statusCode: 404, message: 'Товар не знайдено' })
}

const { data: category } = await useFetch(`/api/categories/slug/${categorySlug}`)
const categoryName = computed(() => category.value?.name ?? null)
</script>

<template>
  <ProductsDetail :product="product ?? null" :category-slug="categorySlug" :category-name="categoryName" />
</template>
