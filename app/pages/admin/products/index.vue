<template>
  <TooltipProvider>
  <div class="space-y-6">
    <!-- Create form -->
    <Card>
      <CardHeader>
        <CardTitle as="h2" class="text-base">Новий товар</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="space-y-3" @submit.prevent="create">
          <div class="flex flex-wrap gap-3">
            <div class="flex-1 min-w-48 flex flex-col gap-1">
              <Label for="name">Назва</Label>
              <Input id="name" v-model="form.name" placeholder="Протигаз ГП-5" />
            </div>
            <div class="flex-1 min-w-48 flex flex-col gap-1">
              <Label for="slug">Slug</Label>
              <Input id="slug" v-model="form.slug" placeholder="protyhaz-hp-5" required />
            </div>
            <div class="flex-1 min-w-32 flex flex-col gap-1">
              <Label for="price">Ціна (грн)</Label>
              <Input id="price" v-model.number="form.price" type="number" step="0.01" placeholder="999.00" />
            </div>
            <div class="flex-1 min-w-32 flex flex-col gap-1">
              <Label for="article">Артикул</Label>
              <Input id="article" v-model="form.article" placeholder="GP5-001" />
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <Label for="description">Короткий опис</Label>
            <Textarea id="description" v-model="form.description" placeholder="Короткий опис товару..." class="resize-none" rows="3" />
          </div>
          <div class="flex flex-col gap-1">
            <Label>Детальний опис</Label>
            <CommonRichEditor v-model="form.longDescription" />
          </div>
          <div class="flex flex-col gap-1">
            <Label>Зображення</Label>
            <CommonProductImagesUpload v-model="form.images" />
          </div>
          <div class="flex flex-col gap-1">
            <Label>Категорії</Label>
            <div class="flex flex-wrap gap-2">
              <label
                v-for="cat in categories"
                :key="cat.id"
                class="flex items-center gap-2 cursor-pointer border rounded-md px-3 py-1.5 text-sm transition-colors"
                :class="form.categoryIds.includes(cat.id) ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'"
              >
                <input type="checkbox" :value="cat.id" v-model="form.categoryIds" class="hidden" />
                {{ cat.name }}
              </label>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-1.5">
              <label class="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" v-model="form.isActive" class="rounded" />
                Активний
              </label>
              <Tooltip>
                <TooltipTrigger as-child>
                  <Icon name="lucide:circle-help" class="h-3.5 w-3.5 text-muted-foreground cursor-help shrink-0" />
                </TooltipTrigger>
                <TooltipContent class="max-w-52">
                  Товар відображається у каталозі. Якщо прибрати — покупці не побачать товар на сайті.
                </TooltipContent>
              </Tooltip>
            </div>
            <div class="flex items-center gap-1.5">
              <label class="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" v-model="form.inStock" class="rounded" />
                В наявності
              </label>
              <Tooltip>
                <TooltipTrigger as-child>
                  <Icon name="lucide:circle-help" class="h-3.5 w-3.5 text-muted-foreground cursor-help shrink-0" />
                </TooltipTrigger>
                <TooltipContent class="max-w-52">
                  Показує бейдж «В наявності» на сторінці товару. Якщо прибрати — бейдж «Немає в наявності».
                </TooltipContent>
              </Tooltip>
            </div>
            <div class="flex items-center gap-1.5">
              <label class="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" v-model="form.isHit" class="rounded" />
                Хіт продаж
              </label>
              <Tooltip>
                <TooltipTrigger as-child>
                  <Icon name="lucide:circle-help" class="h-3.5 w-3.5 text-muted-foreground cursor-help shrink-0" />
                </TooltipTrigger>
                <TooltipContent class="max-w-52">
                  Товар потрапляє в секцію «Хіт продаж» на головній сторінці сайту.
                </TooltipContent>
              </Tooltip>
            </div>
            <Button type="submit" :disabled="saving">
              <Icon name="lucide:plus" class="h-4 w-4 mr-2" />
              {{ saving ? 'Зберігаємо...' : 'Додати' }}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>

    <!-- Filters -->
    <Card>
      <CardContent class="pt-4 pb-3">
        <div class="flex flex-wrap gap-3">
          <div class="flex-1 min-w-52">
            <Input v-model="filterSearch" placeholder="Пошук по назві або артикулу..." />
          </div>
          <Select v-model="filterCategoryId">
            <SelectTrigger class="w-48" aria-label="Фільтр за категорією">
              <SelectValue placeholder="Всі категорії" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі категорії</SelectItem>
              <SelectItem v-for="cat in categories" :key="cat.id" :value="String(cat.id)">
                {{ cat.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="filterStatus">
            <SelectTrigger class="w-40" aria-label="Фільтр за статусом">
              <SelectValue placeholder="Всі статуси" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі статуси</SelectItem>
              <SelectItem value="active">Активні</SelectItem>
              <SelectItem value="hidden">Приховані</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <!-- Table -->
    <Card>
      <CardHeader>
        <CardTitle as="h2" class="text-base">
          Усі товари ({{ filteredProducts.length }}{{ filteredProducts.length !== (products?.length ?? 0) ? ` з ${products?.length ?? 0}` : '' }})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-12">ID</TableHead>
              <TableHead>Назва</TableHead>
              <TableHead>Артикул</TableHead>
              <TableHead>Ціна</TableHead>
              <TableHead>Категорії</TableHead>
              <TableHead class="w-20">Статус</TableHead>
              <TableHead class="w-24"><span class="sr-only">Дії</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="!filteredProducts.length">
              <TableCell colspan="7" class="text-center text-muted-foreground py-8">
                {{ products?.length ? 'Нічого не знайдено' : 'Товарів ще немає' }}
              </TableCell>
            </TableRow>
            <TableRow v-for="product in filteredProducts" :key="product.id">
              <TableCell class="text-muted-foreground">{{ product.id }}</TableCell>
              <TableCell class="font-medium">{{ product.name ?? '—' }}</TableCell>
              <TableCell class="font-mono text-sm text-muted-foreground">{{ product.article ?? '—' }}</TableCell>
              <TableCell>{{ product.price ? `${product.price} грн` : '—' }}</TableCell>
              <TableCell>
                <div class="flex flex-wrap gap-1">
                  <Badge v-for="cat in product.categories" :key="cat.id" variant="secondary" class="text-xs">
                    {{ cat.name }}
                  </Badge>
                  <span v-if="!product.categories?.length" class="text-muted-foreground text-sm">—</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge :variant="product.isActive ? 'default' : 'secondary'">
                  {{ product.isActive ? 'Активний' : 'Прихований' }}
                </Badge>
              </TableCell>
              <TableCell>
                <div class="flex gap-1">
                  <Button variant="ghost" size="icon" class="h-8 w-8" aria-label="Редагувати" @click="openEdit(product)">
                    <Icon name="lucide:pencil" class="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button variant="ghost" size="icon" class="h-8 w-8 text-destructive hover:text-destructive" aria-label="Видалити" @click="remove(product.id)">
                    <Icon name="lucide:trash-2" class="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>

  <!-- Edit Dialog -->
  <Dialog v-model:open="editOpen">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Редагувати товар</DialogTitle>
      </DialogHeader>
      <form class="space-y-3 mt-2" @submit.prevent="saveEdit">
        <div class="flex flex-wrap gap-3">
          <div class="flex-1 min-w-48 flex flex-col gap-1">
            <Label>Назва</Label>
            <Input v-model="editForm.name" placeholder="Протигаз ГП-5" />
          </div>
          <div class="flex-1 min-w-48 flex flex-col gap-1">
            <Label>Slug</Label>
            <Input v-model="editForm.slug" placeholder="protyhaz-hp-5" required />
          </div>
          <div class="flex-1 min-w-32 flex flex-col gap-1">
            <Label>Ціна (грн)</Label>
            <Input v-model.number="editForm.price" type="number" step="0.01" placeholder="999.00" />
          </div>
          <div class="flex-1 min-w-32 flex flex-col gap-1">
            <Label>Артикул</Label>
            <Input v-model="editForm.article" placeholder="GP5-001" />
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <Label>Короткий опис</Label>
          <Textarea v-model="editForm.description" placeholder="Короткий опис товару..." class="resize-none" rows="3" />
        </div>
        <div class="flex flex-col gap-1">
          <Label>Детальний опис</Label>
          <CommonRichEditor v-model="editForm.longDescription" />
        </div>
        <div class="flex flex-col gap-1">
          <Label>Зображення</Label>
          <CommonProductImagesUpload v-model="editForm.images" />
        </div>
        <div class="flex flex-col gap-1">
          <Label>Категорії</Label>
          <div class="flex flex-wrap gap-2">
            <label
              v-for="cat in categories"
              :key="cat.id"
              class="flex items-center gap-2 cursor-pointer border rounded-md px-3 py-1.5 text-sm transition-colors"
              :class="editForm.categoryIds.includes(cat.id) ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'"
            >
              <input type="checkbox" :value="cat.id" v-model="editForm.categoryIds" class="hidden" />
              {{ cat.name }}
            </label>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-1.5">
            <label class="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" v-model="editForm.isActive" class="rounded" />
              Активний
            </label>
            <Tooltip>
              <TooltipTrigger as-child>
                <Icon name="lucide:circle-help" class="h-3.5 w-3.5 text-muted-foreground cursor-help shrink-0" />
              </TooltipTrigger>
              <TooltipContent class="max-w-52">
                Товар відображається у каталозі. Якщо прибрати — покупці не побачать товар на сайті.
              </TooltipContent>
            </Tooltip>
          </div>
          <div class="flex items-center gap-1.5">
            <label class="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" v-model="editForm.inStock" class="rounded" />
              В наявності
            </label>
            <Tooltip>
              <TooltipTrigger as-child>
                <Icon name="lucide:circle-help" class="h-3.5 w-3.5 text-muted-foreground cursor-help shrink-0" />
              </TooltipTrigger>
              <TooltipContent class="max-w-52">
                Показує бейдж «В наявності» на сторінці товару. Якщо прибрати — бейдж «Немає в наявності».
              </TooltipContent>
            </Tooltip>
          </div>
          <div class="flex items-center gap-1.5">
            <label class="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" v-model="editForm.isHit" class="rounded" />
              Хіт продаж
            </label>
            <Tooltip>
              <TooltipTrigger as-child>
                <Icon name="lucide:circle-help" class="h-3.5 w-3.5 text-muted-foreground cursor-help shrink-0" />
              </TooltipTrigger>
              <TooltipContent class="max-w-52">
                Товар потрапляє в секцію «Хіт продаж» на головній сторінці сайту.
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <DialogFooter class="pt-2">
          <Button type="button" variant="outline" @click="editOpen = false">Скасувати</Button>
          <Button type="submit" :disabled="editSaving">
            {{ editSaving ? 'Зберігаємо...' : 'Зберегти' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
  </TooltipProvider>
</template>

<script setup lang="ts">
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface Category { id: number; name: string; slug: string }
interface ProductImage { id: number; url: string; isMain: boolean; sortOrder: number }
interface Product {
  id: number
  name: string | null
  slug: string
  description: string | null
  longDescription: string | null
  price: string | number | null
  article: string | null
  isActive: boolean
  inStock: boolean
  isHit: boolean
  categories: Category[]
  images: ProductImage[]
}

definePageMeta({ layout: 'admin' })

const { data: rawProducts, refresh } = await useFetch('/api/products')
const products = computed(() => rawProducts.value as unknown as Product[])
const { data: categories } = await useFetch('/api/categories')

const filterSearch = ref('')
const filterCategoryId = ref('all')
const filterStatus = ref('all')

const filteredProducts = computed(() => {
  let result = products.value ?? []
  if (filterSearch.value) {
    const q = filterSearch.value.toLowerCase()
    result = result.filter(p =>
      p.name?.toLowerCase().includes(q) || p.article?.toLowerCase().includes(q)
    )
  }
  if (filterCategoryId.value !== 'all') {
    const id = Number(filterCategoryId.value)
    result = result.filter(p => p.categories.some(c => c.id === id))
  }
  if (filterStatus.value !== 'all') {
    result = result.filter(p => filterStatus.value === 'active' ? p.isActive : !p.isActive)
  }
  return result
})

const saving = ref(false)
const form = reactive({
  name: '',
  slug: '',
  description: '',
  longDescription: null as string | null,
  price: undefined as number | undefined,
  article: '',
  images: [] as { url: string; isMain: boolean; sortOrder: number }[],
  categoryIds: [] as number[],
  isActive: true,
  inStock: true,
  isHit: false,
})

watch(() => form.name, (val) => {
  form.slug = val.toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zа-яёіїє0-9-]/gi, '')
})

async function create() {
  saving.value = true
  try {
    await $fetch('/api/products', { method: 'POST', body: form })
    Object.assign(form, { name: '', slug: '', description: '', longDescription: null, price: undefined, article: '', images: [], categoryIds: [], isActive: true, inStock: true, isHit: false })
    await refresh()
  } finally {
    saving.value = false
  }
}

async function remove(id: number) {
  if (!confirm('Видалити товар?')) return
  await $fetch(`/api/products/${id}`, { method: 'DELETE' })
  await refresh()
}

const editOpen = ref(false)
const editSaving = ref(false)
const editId = ref<number | null>(null)
const editForm = reactive({
  name: '',
  slug: '',
  description: '',
  longDescription: null as string | null,
  price: undefined as number | undefined,
  article: '',
  images: [] as { url: string; isMain: boolean; sortOrder: number }[],
  categoryIds: [] as number[],
  isActive: true,
  inStock: true,
  isHit: false,
})

function openEdit(product: Product) {
  editId.value = product.id
  Object.assign(editForm, {
    name: product.name ?? '',
    slug: product.slug,
    description: product.description ?? '',
    longDescription: product.longDescription ?? null,
    price: product.price ? Number(product.price) : undefined,
    article: product.article ?? '',
    images: product.images.map(img => ({ url: img.url, isMain: img.isMain, sortOrder: img.sortOrder })),
    categoryIds: product.categories.map(c => c.id),
    isActive: product.isActive,
    inStock: product.inStock,
    isHit: product.isHit,
  })
  editOpen.value = true
}

async function saveEdit() {
  if (!editId.value) return
  editSaving.value = true
  try {
    await $fetch(`/api/products/${editId.value}`, { method: 'PUT', body: editForm })
    editOpen.value = false
    await refresh()
  } finally {
    editSaving.value = false
  }
}
</script>

