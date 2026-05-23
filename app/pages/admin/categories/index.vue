<template>
  <div class="space-y-6">
    <!-- Create form -->
    <Card>
      <CardHeader>
        <CardTitle as="h2" class="text-base">Нова категорія</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="flex flex-wrap gap-3" @submit.prevent="create">
          <div class="flex-1 min-w-48 flex flex-col gap-1">
            <Label for="name">Назва</Label>
            <Input id="name" v-model="form.name" placeholder="Захисні костюми" required />
          </div>
          <div class="flex-1 min-w-48 flex flex-col gap-1">
            <Label for="slug">Slug</Label>
            <Input id="slug" v-model="form.slug" placeholder="zahysni-kostyumy" required />
          </div>
          <div class="flex-1 min-w-48 flex flex-col gap-1">
            <Label for="sortOrder">Порядок</Label>
            <Input id="sortOrder" v-model.number="form.sortOrder" type="number" placeholder="0" />
          </div>
          <div class="w-full flex flex-col gap-1">
            <Label>Зображення</Label>
            <CommonImageUpload v-model="form.image" />
          </div>
          <div class="flex items-end">
            <Button type="submit" :disabled="saving">
              <Icon name="lucide:plus" class="h-4 w-4 mr-2" />
              {{ saving ? 'Зберігаємо...' : 'Додати' }}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>

    <!-- Table -->
    <Card>
      <CardHeader>
        <CardTitle as="h2" class="text-base">Усі категорії ({{ categories?.length ?? 0 }})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-12">ID</TableHead>
              <TableHead>Назва</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead class="w-20">Порядок</TableHead>
              <TableHead class="w-24">Товарів</TableHead>
              <TableHead class="w-24"><span class="sr-only">Дії</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="!categories?.length">
              <TableCell colspan="6" class="text-center text-muted-foreground py-8">
                Категорій ще немає
              </TableCell>
            </TableRow>
            <TableRow v-for="cat in categories" :key="cat.id">
              <TableCell class="text-muted-foreground">{{ cat.id }}</TableCell>
              <TableCell class="font-medium">{{ cat.name }}</TableCell>
              <TableCell class="text-muted-foreground font-mono text-sm">{{ cat.slug }}</TableCell>
              <TableCell>{{ cat.sortOrder }}</TableCell>
              <TableCell>{{ cat._count?.products ?? 0 }}</TableCell>
              <TableCell>
                <div class="flex gap-1">
                  <Button variant="ghost" size="icon" class="h-8 w-8" aria-label="Редагувати" @click="openEdit(cat)">
                    <Icon name="lucide:pencil" class="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button variant="ghost" size="icon" class="h-8 w-8 text-destructive hover:text-destructive" aria-label="Видалити" @click="remove(cat.id)">
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
    <DialogContent class="max-w-lg">
      <DialogHeader>
        <DialogTitle>Редагувати категорію</DialogTitle>
      </DialogHeader>
      <form class="space-y-3 mt-2" @submit.prevent="saveEdit">
        <div class="flex flex-col gap-1">
          <Label>Назва</Label>
          <Input v-model="editForm.name" placeholder="Захисні костюми" required />
        </div>
        <div class="flex flex-col gap-1">
          <Label>Slug</Label>
          <Input v-model="editForm.slug" placeholder="zahysni-kostyumy" required />
        </div>
        <div class="flex flex-col gap-1">
          <Label>Порядок</Label>
          <Input v-model.number="editForm.sortOrder" type="number" placeholder="0" />
        </div>
        <div class="flex flex-col gap-1">
          <Label>Зображення</Label>
          <CommonImageUpload v-model="editForm.image" />
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
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'

interface Category {
  id: number
  name: string
  slug: string
  sortOrder: number
  image: string | null
  _count?: { products: number }
}

definePageMeta({ layout: 'admin' })

const { data: categories, refresh } = await useFetch('/api/categories')

const saving = ref(false)
const form = reactive({ name: '', slug: '', sortOrder: 0, image: null as string | null })

watch(() => form.name, (val) => {
  form.slug = val.toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zа-яёіїє0-9-]/gi, '')
})

async function create() {
  saving.value = true
  try {
    await $fetch('/api/categories', { method: 'POST', body: form })
    form.name = ''
    form.slug = ''
    form.sortOrder = 0
    form.image = null
    await refresh()
    toast.success('Категорію додано')
  } catch {
    toast.error('Помилка', { description: 'Не вдалося додати категорію' })
  } finally {
    saving.value = false
  }
}

async function remove(id: number) {
  if (!confirm('Видалити категорію?')) return
  try {
    await $fetch(`/api/categories/${id}`, { method: 'DELETE' })
    await refresh()
    toast.success('Категорію видалено')
  } catch {
    toast.error('Помилка', { description: 'Не вдалося видалити категорію' })
  }
}

const editOpen = ref(false)
const editSaving = ref(false)
const editId = ref<number | null>(null)
const editForm = reactive({ name: '', slug: '', sortOrder: 0, image: null as string | null })

function openEdit(cat: Category) {
  editId.value = cat.id
  Object.assign(editForm, {
    name: cat.name,
    slug: cat.slug,
    sortOrder: cat.sortOrder,
    image: cat.image,
  })
  editOpen.value = true
}

async function saveEdit() {
  if (!editId.value) return
  editSaving.value = true
  try {
    await $fetch(`/api/categories/${editId.value}`, { method: 'PUT', body: editForm })
    editOpen.value = false
    await refresh()
    toast.success('Категорію збережено')
  } catch {
    toast.error('Помилка', { description: 'Не вдалося зберегти категорію' })
  } finally {
    editSaving.value = false
  }
}
</script>

