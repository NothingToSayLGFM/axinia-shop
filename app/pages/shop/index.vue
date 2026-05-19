<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

useSeoMeta({
  title: 'Каталог засобів захисту',
  description: 'Каталог засобів захисту: протигази, респіратори, газоаналізатори, захисні костюми, фільтри, засоби тактичної медицини. Фільтрація за ціною та категорією.',
  ogType: 'website',
  ogImage: '/images/logo.webp',
  twitterCard: 'summary_large_image',
})

const PRICE_MAX = 50000

const route = useRoute()
const router = useRouter()

const searchInput = ref((route.query.search as string) || '')
const searchInputEl = ref<any>(null)

const searchFocusTrigger = useState('searchFocusTrigger', () => 0)

onMounted(() => {
  searchInputEl.value?.$el?.focus()
})

watch(searchFocusTrigger, () => {
  searchInputEl.value?.$el?.focus()
})
const search = ref(searchInput.value)
const selectedCategories = ref<string[]>(
  route.query.category ? (route.query.category as string).split(',').filter(Boolean) : []
)
const priceRange = ref<[number, number]>([
  route.query.minPrice ? Number(route.query.minPrice) : 0,
  route.query.maxPrice ? Number(route.query.maxPrice) : PRICE_MAX,
])
const page = ref(route.query.page ? Number(route.query.page) : 1)
const mobileFiltersOpen = ref(false)

let debounceTimer: ReturnType<typeof setTimeout>
watch(searchInput, (val) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    search.value = val
    page.value = 1
  }, 400)
})

watch([selectedCategories, priceRange], () => { page.value = 1 }, { deep: true })

const { data: categories } = await useFetch('/api/categories')

const productsQuery = computed(() => ({
  page: page.value,
  limit: 10,
  ...(search.value && { search: search.value }),
  ...(selectedCategories.value.length > 0 && { category: selectedCategories.value.join(',') }),
  ...(priceRange.value[0] > 0 && { minPrice: priceRange.value[0] }),
  ...(priceRange.value[1] < PRICE_MAX && { maxPrice: priceRange.value[1] }),
}))

const { data: result, status } = await useFetch('/api/products', {
  query: productsQuery,
})

const products = computed(() => (result.value as any)?.items ?? [])
const total = computed(() => (result.value as any)?.total ?? 0)
const totalPages = computed(() => Math.ceil(total.value / 10))
const pending = computed(() => status.value === 'pending')

watch([search, selectedCategories, priceRange, page], () => {
  router.replace({
    query: {
      ...(search.value && { search: search.value }),
      ...(selectedCategories.value.length > 0 && { category: selectedCategories.value.join(',') }),
      ...(priceRange.value[0] > 0 && { minPrice: String(priceRange.value[0]) }),
      ...(priceRange.value[1] < PRICE_MAX && { maxPrice: String(priceRange.value[1]) }),
      ...(page.value > 1 && { page: String(page.value) }),
    },
  })
}, { deep: true })

function resetFilters() {
  searchInput.value = ''
  search.value = ''
  selectedCategories.value = []
  priceRange.value = [0, PRICE_MAX]
  page.value = 1
}

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = page.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
})
</script>

<template>
  <CommonContainer class="py-8">
    <!-- Breadcrumbs -->
    <nav class="mb-6 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Хлібні крихти">
      <NuxtLink to="/" class="hover:text-foreground transition-colors">Головна</NuxtLink>
      <span>›</span>
      <span class="text-foreground">Товари</span>
    </nav>

    <h1 class="sr-only">Товари</h1>

    <!-- Поиск + кнопка фильтров на мобильном -->
    <div class="flex gap-3 mb-6">
      <div class="relative flex-1">
        <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input ref="searchInputEl" v-model="searchInput" placeholder="Артикул / назва" class="pl-9" />
      </div>

      <Sheet v-model:open="mobileFiltersOpen">
        <SheetTrigger as-child>
          <Button variant="outline" class="lg:hidden gap-2 shrink-0">
            <Icon name="lucide:sliders-horizontal" class="h-4 w-4" />
            Фільтри
          </Button>
        </SheetTrigger>
        <SheetContent side="left" class="w-72 pt-10">
          <SheetHeader>
            <SheetTitle>Фільтри</SheetTitle>
          </SheetHeader>
          <div class="mt-4 px-1">
            <ProductsFilters
              :categories="categories ?? []"
              :selected-categories="selectedCategories"
              :price-range="priceRange"
              :price-max="PRICE_MAX"
              @update:selected-categories="selectedCategories = $event"
              @update:price-range="priceRange = $event"
              @reset="resetFilters"
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>

    <div class="flex gap-8 items-start">
      <!-- Сайдбар (только desktop) -->
      <aside class="hidden lg:block w-56 shrink-0 sticky top-24">
        <ProductsFilters
          :categories="categories ?? []"
          :selected-categories="selectedCategories"
          :price-range="priceRange"
          :price-max="PRICE_MAX"
          @update:selected-categories="selectedCategories = $event"
          @update:price-range="priceRange = $event"
          @reset="resetFilters"
        />
      </aside>

      <!-- Основной контент -->
      <div class="flex-1 min-w-0">
        <h2 class="sr-only">Список товарів</h2>
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
            :category-slug="product.categories?.[0]?.slug ?? null"
            :images="product.images"
            :name="product.name"
            :description="product.description"
            :price="product.price"
          />
        </div>

        <!-- Пусто -->
        <div v-else class="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
          <Icon name="lucide:package-search" class="h-12 w-12 mb-4 opacity-30" />
          <p class="text-lg font-medium">Товарів не знайдено</p>
          <p class="text-sm mt-1">Спробуйте змінити фільтри або пошуковий запит</p>
          <Button variant="outline" class="mt-4" @click="resetFilters">Скинути фільтри</Button>
        </div>

        <!-- Пагинация -->
        <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-1">
          <Button
            variant="outline"
            size="icon"
            :disabled="page === 1"
            @click="page--"
          >
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
            >
              {{ p }}
            </Button>
          </template>

          <Button
            variant="outline"
            size="icon"
            :disabled="page === totalPages"
            @click="page++"
          >
            <Icon name="lucide:chevron-right" class="h-4 w-4" />
          </Button>
        </div>

        <!-- Итого -->
        <p v-if="!pending && total > 0" class="mt-4 text-center text-sm text-muted-foreground">
          Знайдено {{ total }} {{ total === 1 ? 'товар' : total < 5 ? 'товари' : 'товарів' }}
        </p>
      </div>
    </div>
  </CommonContainer>
</template>
