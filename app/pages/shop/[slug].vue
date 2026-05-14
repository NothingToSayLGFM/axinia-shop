<script setup lang="ts">
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'vue-sonner'

const route = useRoute()
const slug = route.params.slug as string

const { data: product, error } = await useFetch(`/api/products/slug/${slug}`)

if (error.value) {
  throw createError({ statusCode: 404, message: 'Товар не знайдено' })
}

const images = computed(() => (product.value as any)?.images ?? [])
const hasMultipleImages = computed(() => images.value.length > 1)
const mainImage = computed(() => images.value.find((i: any) => i.isMain)?.url ?? images.value[0]?.url ?? null)

const categorySlug = computed(() => (product.value as any)?.categories?.[0]?.slug ?? null)
const productId = computed(() => (product.value as any)?.id ?? null)

const cart = useCartStore()

function formatPrice(price: string | number | null | undefined) {
  if (!price) return null
  return `${Number(price).toLocaleString('uk-UA')} грн`
}

function addToCart() {
  const p = product.value as any
  cart.addItem({
    id: p.id,
    slug: p.slug ?? null,
    name: p.name ?? 'Без назви',
    price: Number(p.price ?? 0),
    image: mainImage.value,
  })
  toast.success('Додано до кошика', { description: p.name ?? 'Товар' })
  cart.isOpen = true
}
</script>

<template>
  <CommonContainer class="py-8">
    <div v-if="product" class="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
      <!-- Левая колонка: изображение / слайдер -->
      <div>
        <!-- Слайдер если картинок больше одной -->
        <Carousel v-if="hasMultipleImages" class="w-full">
          <CarouselContent>
            <CarouselItem v-for="img in images" :key="img.id">
              <div class="aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                <NuxtImg
                  :src="img.url"
                  :alt="(product as any).name ?? ''"
                  class="h-full w-full object-contain"
                />
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious class="left-3" />
          <CarouselNext class="right-3" />
        </Carousel>

        <!-- Одна картинка -->
        <div v-else-if="images.length === 1" class="aspect-[4/3] overflow-hidden rounded-xl bg-muted">
          <NuxtImg
            :src="images[0].url"
            :alt="(product as any).name ?? ''"
            class="h-full w-full object-contain"
          />
        </div>

        <!-- Нет картинок -->
        <div v-else class="aspect-[4/3] rounded-xl bg-muted flex items-center justify-center">
          <Icon name="lucide:package" class="h-24 w-24 text-muted-foreground/20" />
        </div>
      </div>

      <!-- Правая колонка: название + описание -->
      <div class="flex flex-col gap-4">
        <h1 class="text-2xl font-bold leading-snug sm:text-3xl">
          {{ (product as any).name ?? 'Без назви' }}
        </h1>

        <div class="flex items-center gap-2">
          <Badge v-if="(product as any).inStock" class="bg-green-600 text-white hover:bg-green-700">В наявності</Badge>
          <Badge v-else variant="secondary" class="text-muted-foreground">Немає в наявності</Badge>
          <Badge class="bg-green-600 text-white hover:bg-green-700">Безкоштовна доставка</Badge>
        </div>

        <p v-if="(product as any).description" class="text-muted-foreground leading-relaxed">
          {{ (product as any).description }}
        </p>

        <div class="flex items-center gap-4">
          <p v-if="(product as any).price" class="text-2xl font-bold">
            {{ formatPrice((product as any).price) }}
          </p>
          <p v-else class="text-muted-foreground">Ціна на запит</p>
          <Button size="lg" class="cursor-pointer gap-2" @click="addToCart">
            <Icon name="lucide:shopping-cart" class="h-5 w-5" />
            Купити
          </Button>
        </div>
      </div>
    </div>

    <!-- Детальное описание -->
    <div
      v-if="(product as any)?.longDescription"
      class="mt-12 prose prose-neutral max-w-none"
      v-html="(product as any).longDescription"
    />

    <!-- Схожі товари -->
    <ProductsRelatedProducts
      v-if="categorySlug && productId"
      :category-slug="categorySlug"
      :exclude-id="productId"
    />
  </CommonContainer>
</template>
