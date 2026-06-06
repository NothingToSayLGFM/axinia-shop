<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const categorySlug = route.params.category as string

const { data: category, error: categoryError } = await useFetch(`/api/categories/slug/${categorySlug}`)
if (categoryError.value) {
  throw createError({ statusCode: 404, message: 'Категорію не знайдено' })
}

const searchInput = ref((route.query.search as string) || '')
const sort = ref((route.query.sort as string) || '')
const page = ref(route.query.page ? Number(route.query.page) : 1)

let debounceTimer: ReturnType<typeof setTimeout>
const search = ref(searchInput.value)

watch(searchInput, (val) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    search.value = val
    page.value = 1
  }, 400)
})

watch(sort, () => { page.value = 1 })

const productsQuery = computed(() => ({
  category: categorySlug,
  page: page.value,
  ...(search.value && { search: search.value }),
  ...(sort.value && { sort: sort.value }),
}))

const { data: result, status, error: productsError } = await useFetch('/api/products', {
  query: productsQuery,
})

watch(productsError, (err) => {
  if (!err) return
  if (err.status === 429) {
    toast.error('Забагато запитів', { description: 'Зачекайте хвилину і спробуйте знову.' })
  } else {
    toast.error('Помилка завантаження', { description: 'Не вдалося завантажити товари.' })
  }
})

const products = computed(() => (result.value as any)?.items ?? [])
const total = computed(() => (result.value as any)?.total ?? 0)
const totalPages = computed(() => Math.ceil(total.value / 10))

const minPrice = computed(() => {
  const prices = products.value
    .map((p: any) => p.price ? Number(p.price) : null)
    .filter((p: number | null): p is number => p !== null && p > 0)
  return prices.length ? Math.min(...prices) : null
})
const pending = computed(() => status.value === 'pending')

watch([search, sort, page], () => {
  router.replace({
    query: {
      ...(search.value && { search: search.value }),
      ...(sort.value && { sort: sort.value }),
      ...(page.value > 1 && { page: String(page.value) }),
    },
  })
}, { deep: true })

watch(page, () => {
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
})

function resetSearch() {
  searchInput.value = ''
  search.value = ''
  sort.value = ''
  page.value = 1
}

const visiblePages = computed(() => {
  const t = totalPages.value
  const c = page.value
  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1)
  if (c <= 4) return [1, 2, 3, 4, 5, '...', t]
  if (c >= t - 3) return [1, '...', t - 4, t - 3, t - 2, t - 1, t]
  return [1, '...', c - 1, c, c + 1, '...', t]
})

const categoryName = computed(() => (category.value as any)?.name ?? '')

useSchemaOrg([
  defineBreadcrumb({
    itemListElement: [
      { name: 'Головна', item: '/' },
      { name: 'Товари', item: '/shop' },
      { name: () => categoryName.value, item: () => `/shop/${categorySlug}` },
    ],
  }),
])

useSeoMeta({
  title: computed(() => `${categoryName.value} — купити`),
  description: computed(() => {
    const name = categoryName.value.toLowerCase()
    const count = total.value
    const countStr = count > 0 ? ` ✅ ${count} ${count === 1 ? 'товар' : count < 5 ? 'товари' : 'товарів'} в наявності.` : ''
    const priceStr = minPrice.value ? ` Ціни від ${minPrice.value.toLocaleString('uk-UA')} грн.` : ''
    return `Купити ${name} в Аксінья-Маркет.${countStr}${priceStr} Доставка по Україні.`
  }),
  ogType: 'website',
  ogImage: computed(() => (category.value as any)?.image ?? '/images/logo.webp'),
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <CommonContainer class="py-8">
    <!-- Breadcrumbs -->
    <nav class="mb-6 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Хлібні крихти">
      <NuxtLink to="/" class="hover:text-foreground transition-colors">Головна</NuxtLink>
      <span>›</span>
      <NuxtLink to="/shop" class="hover:text-foreground transition-colors">Товари</NuxtLink>
      <span>›</span>
      <span class="text-foreground">{{ (category as any)?.name }}</span>
    </nav>

    <h1 class="mb-6 text-2xl font-bold sm:text-3xl">{{ (category as any)?.name }}</h1>

    <!-- Поиск + сортировка -->
    <div class="flex gap-3 mb-6">
      <div class="relative flex-1">
        <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input v-model="searchInput" placeholder="Артикул / назва" class="pl-9" />
      </div>
      <Select v-model="sort">
        <SelectTrigger class="w-48 shrink-0" aria-label="Сортування">
          <SelectValue placeholder="Сортування" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="price_asc">Ціна: від меншої</SelectItem>
          <SelectItem value="price_desc">Ціна: від більшої</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Скелетон -->
    <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      <div v-for="i in 6" :key="i" class="rounded-xl overflow-hidden bg-muted animate-pulse">
        <div class="aspect-[4/3] bg-muted-foreground/10" />
        <div class="p-4 space-y-2">
          <div class="h-4 bg-muted-foreground/10 rounded w-3/4" />
          <div class="h-3 bg-muted-foreground/10 rounded w-1/2" />
          <div class="h-5 bg-muted-foreground/10 rounded w-1/3 mt-2" />
        </div>
      </div>
    </div>

    <!-- Товары -->
    <div v-else-if="products.length" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      <CommonProductCard
        v-for="product in products"
        :key="product.id"
        :id="product.id"
        :slug="product.slug"
        :category-slug="categorySlug"
        :images="product.images"
        :name="product.name"
        :description="product.description"
        :price="product.price"
        :in-stock="product.inStock"
      />
    </div>

    <!-- Пусто -->
    <div v-else class="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
      <Icon name="lucide:package-search" class="h-12 w-12 mb-4 opacity-30" />
      <p class="text-lg font-medium">Товарів не знайдено</p>
      <p class="text-sm mt-1">Спробуйте змінити пошуковий запит</p>
      <Button variant="outline" class="mt-4" @click="resetSearch">Скинути</Button>
    </div>

    <!-- Пагинация -->
    <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-1">
      <Button variant="outline" size="icon" :disabled="page === 1" @click="page--">
        <Icon name="lucide:chevron-left" class="h-4 w-4" />
      </Button>
      <template v-for="p in visiblePages" :key="p">
        <span v-if="p === '...'" class="px-2 text-muted-foreground text-sm">…</span>
        <Button
          v-else
          :variant="page === p ? 'default' : 'outline'"
          size="icon"
          class="w-9"
          @click="page = Number(p)"
        >{{ p }}</Button>
      </template>
      <Button variant="outline" size="icon" :disabled="page === totalPages" @click="page++">
        <Icon name="lucide:chevron-right" class="h-4 w-4" />
      </Button>
    </div>

    <!-- Итого -->
    <p v-if="!pending && total > 0" class="mt-4 text-center text-sm text-muted-foreground">
      Знайдено {{ total }} {{ total === 1 ? 'товар' : total < 5 ? 'товари' : 'товарів' }}
    </p>
  </CommonContainer>
</template>
