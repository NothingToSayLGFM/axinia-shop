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
const categorySlug = route.params.category as string
const slug = route.params.slug as string

const { data: product, error } = await useFetch(`/api/products/slug/${slug}`)

if (error.value) {
  throw createError({ statusCode: 404, message: 'Товар не знайдено' })
}

const { data: category } = await useFetch(`/api/categories/slug/${categorySlug}`)

const images = computed(() => (product.value as any)?.images ?? [])
const hasMultipleImages = computed(() => images.value.length > 1)
const mainImage = computed(() => images.value.find((i: any) => i.isMain)?.url ?? images.value[0]?.url ?? null)

const productCategorySlug = computed(() => (product.value as any)?.categories?.[0]?.slug ?? null)
const productId = computed(() => (product.value as any)?.id ?? null)
const categoryName = computed(() => (category.value as any)?.name ?? null)

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
    categorySlug: categorySlug ?? null,
    name: p.name ?? 'Без назви',
    price: p.price ? Number(p.price) : null,
    image: mainImage.value,
  })
  toast.success('Додано до кошика', { description: p.name ?? 'Товар' })
  cart.isOpen = true
}

useSeoMeta({
  title: computed(() => {
    const name = (product.value as any)?.name
    return name ? `${name} — купити` : ''
  }),
  description: computed(() => {
    const p = product.value as any
    if (p?.description) return p.description
    const name = p?.name ?? ''
    const price = p?.price ? `за ціною ${Number(p.price).toLocaleString('uk-UA')} грн` : ''
    return `Купити ${name} ${price}. Безкоштовна доставка по Україні. ПП Аксінья-Маркет — засоби індивідуального захисту.`.replace(/\s+/g, ' ').trim()
  }),
  ogType: 'website',
  ogImage: computed(() => mainImage.value ?? '/images/logo.webp'),
  twitterCard: 'summary_large_image',
})

useSchemaOrg([
  defineProduct({
    name: () => (product.value as any)?.name ?? '',
    description: () => (product.value as any)?.description ?? undefined,
    image: () => images.value.map((img: any) => img.url),
    sku: () => (product.value as any)?.article ?? undefined,
    offers: defineOffer({
      price: () => (product.value as any)?.price ? Number((product.value as any).price) : 0,
      priceCurrency: 'UAH',
      availability: () => (product.value as any)?.inStock ? 'InStock' : undefined,
    }),
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: 'Головна', item: '/' },
      { name: 'Товари', item: '/shop' },
      { name: () => categoryName.value ?? '', item: () => `/shop/${categorySlug}` },
      { name: () => (product.value as any)?.name ?? '', item: () => `/shop/${categorySlug}/${slug}` },
    ],
  }),
])
</script>

<template>
  <CommonContainer class="py-8">
    <!-- Breadcrumbs -->
    <nav class="mb-6 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Хлібні крихти">
      <NuxtLink to="/" class="hover:text-foreground transition-colors">Головна</NuxtLink>
      <span>›</span>
      <NuxtLink to="/shop" class="hover:text-foreground transition-colors">Товари</NuxtLink>
      <span v-if="categoryName">›</span>
      <NuxtLink
        v-if="categoryName"
        :to="`/shop/${categorySlug}`"
        class="hover:text-foreground transition-colors"
      >{{ categoryName }}</NuxtLink>
      <span>›</span>
      <span class="text-foreground">{{ (product as any)?.name }}</span>
    </nav>

    <div v-if="product" class="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
      <!-- Левая колонка: изображение / слайдер -->
      <div>
        <Carousel v-if="hasMultipleImages" class="w-full">
          <CarouselContent>
            <CarouselItem v-for="img in images" :key="img.id">
              <div class="aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                <img
                  v-if="img.url?.startsWith('/uploads/')"
                  :src="img.url"
                  :alt="(product as any).name ?? ''"
                  class="h-full w-full object-contain"
                />
                <NuxtImg
                  v-else
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

        <div v-else-if="images.length === 1" class="aspect-[4/3] overflow-hidden rounded-xl bg-muted">
          <img
            v-if="images[0].url?.startsWith('/uploads/')"
            :src="images[0].url"
            :alt="(product as any).name ?? ''"
            class="h-full w-full object-contain"
          />
          <NuxtImg
            v-else
            :src="images[0].url"
            :alt="(product as any).name ?? ''"
            class="h-full w-full object-contain"
          />
        </div>

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
          <Badge v-if="(product as any).inStock" class="bg-green-700 text-white hover:bg-green-800">В наявності</Badge>
          <Badge v-else variant="secondary" class="text-muted-foreground">Немає в наявності</Badge>
          <Badge class="bg-green-700 text-white hover:bg-green-800">Безкоштовна доставка</Badge>
        </div>

        <p v-if="(product as any).description" class="text-muted-foreground leading-relaxed">
          {{ (product as any).description }}
        </p>

        <div class="flex items-center gap-4">
          <p v-if="(product as any).price" class="text-2xl font-bold">
            {{ formatPrice((product as any).price) }}
          </p>
          <p v-else class="text-muted-foreground">Ціна на запит</p>
          <Button size="lg" class="cursor-pointer gap-2 bg-foreground text-background hover:bg-foreground/90" @click="addToCart">
            <Icon name="lucide:shopping-cart" class="h-5 w-5" />
            Купити
          </Button>
          <Button v-if="!(product as any).price" size="lg" class="gap-2 bg-foreground text-background hover:bg-foreground/90" as-child>
            <a href="tel:+380675303930">
              <Icon name="lucide:phone" class="h-5 w-5" />
              Запит
            </a>
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
      v-if="productCategorySlug && productId"
      :category-slug="productCategorySlug"
      :exclude-id="productId"
    />
  </CommonContainer>
</template>
