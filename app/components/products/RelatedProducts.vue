<script setup lang="ts">
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

const props = defineProps<{
  categorySlug: string
  excludeId: number
}>()

const { data: result } = await useFetch('/api/products', {
  query: computed(() => ({
    category: props.categorySlug,
    limit: 10,
  })),
})

const products = computed(() => {
  const raw = result.value as any
  const items = Array.isArray(raw) ? raw : (raw?.items ?? [])
  return items.filter((p: any) => p.id !== props.excludeId).slice(0, 9)
})

const carouselEl = ref()
let autoplayTimer: ReturnType<typeof setInterval> | null = null

function startAutoplay() {
  stopAutoplay()
  autoplayTimer = setInterval(() => {
    carouselEl.value?.scrollNext()
  }, 3000)
}

function stopAutoplay() {
  if (autoplayTimer !== null) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

onMounted(() => startAutoplay())
onUnmounted(() => stopAutoplay())
</script>

<template>
  <div v-if="products.length" class="mt-16">
    <h2 class="mb-6 text-2xl font-bold">Схожі товари</h2>
    <Carousel
      ref="carouselEl"
      :opts="{ loop: true, slidesToScroll: 1 }"
      class="w-full"
      @mouseenter="stopAutoplay"
      @mouseleave="startAutoplay"
    >
      <CarouselContent class="-ml-4">
        <CarouselItem
          v-for="p in products"
          :key="p.id"
          class="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
        >
          <CommonProductCard
            :id="p.id"
            :slug="p.slug"
            :category-slug="p.categories?.[0]?.slug ?? null"
            :images="p.images"
            :name="p.name"
            :description="p.description"
            :price="p.price"
            :in-stock="p.inStock"
          />
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious class="-left-4" />
      <CarouselNext class="-right-4" />
    </Carousel>
  </div>
</template>
