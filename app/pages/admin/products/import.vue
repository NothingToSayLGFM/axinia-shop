<template>
  <div class="space-y-4 pb-24">
    <div v-if="!importState" class="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <Icon name="lucide:file-x" class="h-10 w-10 text-muted-foreground/50" />
      <p class="text-muted-foreground">Немає даних для попереднього перегляду. Спочатку виберіть XML-файл на сторінці товарів.</p>
      <Button variant="outline" @click="router.push('/admin/products')">До товарів</Button>
    </div>

    <template v-else>
      <div>
        <h1 class="text-xl font-semibold">Попередній перегляд імпорту</h1>
        <p class="text-sm text-muted-foreground mt-1">
          {{ importState.rows.length }} товар(ів) до публікації —
          {{ newCount }} нових, {{ updatingCount }} оновляться{{ importState.stats.duplicatesSkipped ? `; ${importState.stats.duplicatesSkipped} дублікатів у файлі пропущено (лишено найдешевший)` : '' }}.
          Нічого не з'явиться на сайті, поки не натиснете «Опублікувати».
        </p>
      </div>

      <Card>
        <CardContent class="pt-4">
          <!-- Рендеримо лише видимі рядки (+невеликий запас) через @tanstack/vue-virtual —
               інакше 340 карток із CommonImageUpload/Select одразу в DOM відчутно гальмують сторінку. -->
          <div role="table" aria-label="Товари до імпорту">
            <div role="rowgroup">
              <div
                class="grid gap-3 px-3 pb-2 border-b text-sm font-medium text-muted-foreground"
                :style="{ gridTemplateColumns: GRID_COLUMNS }"
                role="row"
              >
                <div role="columnheader">Фото</div>
                <div role="columnheader">Товар</div>
                <div role="columnheader">Ціна</div>
                <div role="columnheader">В наявності</div>
                <div role="columnheader">Категорія</div>
                <div role="columnheader">Статус</div>
                <div role="columnheader" class="sr-only">Дії</div>
              </div>
            </div>

            <div ref="scrollParent" role="rowgroup" class="h-[calc(100vh-320px)] min-h-96 overflow-y-auto">
              <div :style="{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative', width: '100%' }">
                <div
                  v-for="virtualRow in rowVirtualizer.getVirtualItems()"
                  :key="virtualRow.key"
                  :ref="rowVirtualizer.measureElement"
                  :data-index="virtualRow.index"
                  class="absolute top-0 left-0 w-full border-b"
                  :style="{ transform: `translateY(${virtualRow.start}px)` }"
                  role="row"
                >
                  <div v-if="rowAt(virtualRow.index)" class="grid gap-3 items-start px-3 py-3" :style="{ gridTemplateColumns: GRID_COLUMNS }">
                    <div role="cell">
                      <CommonProductImagesUpload
                        :model-value="rowAt(virtualRow.index)!.images"
                        @update:model-value="(v) => onImagesChange(rowAt(virtualRow.index)!, v)"
                      />
                    </div>
                    <div role="cell">
                      <Input v-model="rowAt(virtualRow.index)!.name" aria-label="Назва товару" class="mb-1" />
                      <div class="text-xs text-muted-foreground font-mono">{{ rowAt(virtualRow.index)!.article }}</div>
                      <p v-if="rowAt(virtualRow.index)!.description" class="text-xs text-muted-foreground mt-1 line-clamp-2 max-w-md">
                        {{ rowAt(virtualRow.index)!.description }}
                      </p>
                      <button type="button" class="text-xs text-primary hover:underline mt-1" @click="toggleEdit(rowAt(virtualRow.index)!.article)">
                        {{ editingArticle === rowAt(virtualRow.index)!.article ? 'Згорнути опис' : 'Редагувати опис' }}
                      </button>
                    </div>
                    <div role="cell">
                      <Input
                        :model-value="rowAt(virtualRow.index)!.price ?? ''"
                        type="number"
                        step="0.01"
                        aria-label="Ціна"
                        @update:model-value="(v) => rowAt(virtualRow.index)!.price = v === '' ? null : Number(v)"
                      />
                    </div>
                    <div role="cell">
                      <label class="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="checkbox" v-model="rowAt(virtualRow.index)!.inStock" class="rounded" />
                        В наявності
                      </label>
                    </div>
                    <div role="cell">
                      <Select
                        :model-value="rowAt(virtualRow.index)!.categoryId !== null ? String(rowAt(virtualRow.index)!.categoryId) : 'none'"
                        @update:model-value="(v) => rowAt(virtualRow.index)!.categoryId = v === 'none' ? null : Number(v)"
                      >
                        <SelectTrigger class="w-full" aria-label="Категорія">
                          <SelectValue placeholder="Без категорії" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Без категорії</SelectItem>
                          <SelectItem v-for="cat in categories" :key="cat.id" :value="String(cat.id)">
                            {{ cat.name }}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div role="cell">
                      <Badge :variant="rowAt(virtualRow.index)!.existingId ? 'secondary' : 'default'">
                        {{ rowAt(virtualRow.index)!.existingId ? 'Оновлення' : 'Новий' }}
                      </Badge>
                    </div>
                    <div role="cell">
                      <Button variant="ghost" size="icon" class="h-8 w-8 text-destructive hover:text-destructive" aria-label="Прибрати з імпорту" @click="removeRow(rowAt(virtualRow.index)!.article)">
                        <Icon name="lucide:trash-2" class="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>

                  <div v-if="rowAt(virtualRow.index) && editingArticle === rowAt(virtualRow.index)!.article" class="px-3 pb-3 space-y-3 bg-muted/30">
                    <div class="flex flex-col gap-1">
                      <Label class="text-xs">Короткий опис</Label>
                      <Textarea v-model="rowAt(virtualRow.index)!.description" rows="2" class="resize-none" />
                    </div>
                    <div class="flex flex-col gap-1">
                      <Label class="text-xs">Детальний опис</Label>
                      <CommonRichEditor v-model="rowAt(virtualRow.index)!.longDescription" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div class="fixed bottom-0 left-64 right-0 border-t bg-background/95 backdrop-blur px-6 py-3 flex items-center justify-end gap-3">
        <span class="text-sm text-muted-foreground mr-auto">{{ importState.rows.length }} товар(ів) буде опубліковано</span>
        <Button variant="outline" :disabled="publishing" @click="cancel">Скасувати</Button>
        <Button :disabled="publishing || !importState.rows.length" @click="publish">
          {{ publishing ? 'Публікуємо...' : `Опублікувати (${importState.rows.length})` }}
        </Button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useVirtualizer } from '@tanstack/vue-virtual'
import type { ProductImportRow, ProductImportImage } from '~/composables/useProductImport'

interface Category { id: number; name: string; slug: string }

definePageMeta({ layout: 'admin' })

const GRID_COLUMNS = '16rem minmax(0, 1fr) 8rem 7rem 12rem 6rem 3rem'

const router = useRouter()
const importState = useProductImportState()
const { data: categories } = await useFetch<Category[]>('/api/categories')

const newCount = computed(() => importState.value?.rows.filter(r => !r.existingId).length ?? 0)
const updatingCount = computed(() => importState.value?.rows.filter(r => r.existingId).length ?? 0)

function rowAt(index: number): ProductImportRow | undefined {
  return importState.value?.rows[index]
}

const scrollParent = ref<HTMLElement | null>(null)
const rowVirtualizer = useVirtualizer(computed(() => ({
  count: importState.value?.rows.length ?? 0,
  getScrollElement: () => scrollParent.value,
  estimateSize: () => 128,
  overscan: 8,
})))

// Рендеримо CommonRichEditor лише для одного рядка одночасно — інакше десятки інстансів Tiptap кладуть сторінку
const editingArticle = ref<string | null>(null)

function toggleEdit(article: string) {
  editingArticle.value = editingArticle.value === article ? null : article
}

function onImagesChange(row: ProductImportRow, images: ProductImportImage[]) {
  row.images = images
  row.imagesTouched = true
}

function removeRow(article: string) {
  if (!importState.value) return
  importState.value.rows = importState.value.rows.filter(r => r.article !== article)
}

function cancel() {
  importState.value = null
  router.push('/admin/products')
}

const publishing = ref(false)

async function publish() {
  if (!importState.value?.rows.length) return
  publishing.value = true
  try {
    const result = await $fetch<{ created: number; updated: number; failed: { article: string; error: string }[] }>(
      '/api/products/import/commit',
      { method: 'POST', body: { rows: importState.value.rows } },
    )
    importState.value = null
    if (result.failed.length) {
      toast.warning(`Створено: ${result.created}, оновлено: ${result.updated}`, {
        description: `Не вдалося обробити ${result.failed.length} товар(ів): ${result.failed.map(f => f.article).join(', ')}`,
      })
    } else {
      toast.success('Імпорт завершено', { description: `Створено: ${result.created}, оновлено: ${result.updated}` })
    }
    await router.push('/admin/products')
  } catch {
    toast.error('Помилка', { description: 'Не вдалося опублікувати імпорт' })
  } finally {
    publishing.value = false
  }
}
</script>
