<script setup lang="ts">
const props = defineProps<{
  categorySlug: string
  excludeId: number
}>()

const { data: result } = await useFetch('/api/products', {
  query: computed(() => ({
    category: props.categorySlug,
    limit: 6,
  })),
})

const products = computed(() => {
  const raw = result.value as any
  const items = Array.isArray(raw) ? raw : (raw?.items ?? [])
  return items.filter((p: any) => p.id !== props.excludeId).slice(0, 5)
})
</script>

<template>
  <div v-if="products.length" class="mt-16">
    <h2 class="mb-6 text-2xl font-bold">Схожі товари</h2>
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      <CommonProductCard
        v-for="p in products"
        :key="p.id"
        :id="p.id"
        :slug="p.slug"
        :category-slug="p.categories?.[0]?.slug ?? null"
        :images="p.images"
        :name="p.name"
        :description="p.description"
        :price="p.price"
      />
    </div>
  </div>
</template>
