<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin' })

interface Review {
  id: number
  name: string
  email: string | null
  text: string
  rating: number
  isPublished: boolean
  createdAt: string
}

const { data: reviews, refresh } = await useFetch<Review[]>('/api/reviews/admin')

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).replace(',', '')
}

const toggling = ref<number | null>(null)

async function togglePublish(review: Review) {
  toggling.value = review.id
  try {
    await $fetch(`/api/reviews/${review.id}`, {
      method: 'PATCH',
      body: { isPublished: !review.isPublished },
    })
    toast.success(review.isPublished ? 'Відгук відкликано' : 'Відгук опубліковано')
    await refresh()
  } catch {
    toast.error('Помилка', { description: 'Не вдалося змінити статус' })
  } finally {
    toggling.value = null
  }
}

const published = computed(() => reviews.value?.filter(r => r.isPublished).length ?? 0)
const pending = computed(() => reviews.value?.filter(r => !r.isPublished).length ?? 0)
</script>

<template>
  <div class="space-y-6">
    <!-- Stats -->
    <div class="flex gap-4 flex-wrap">
      <div class="rounded-lg border bg-background px-4 py-3 text-sm">
        <span class="text-muted-foreground">Всього:</span>
        <span class="ml-1.5 font-semibold">{{ reviews?.length ?? 0 }}</span>
      </div>
      <div class="rounded-lg border bg-background px-4 py-3 text-sm">
        <span class="text-muted-foreground">Опубліковано:</span>
        <span class="ml-1.5 font-semibold text-green-600">{{ published }}</span>
      </div>
      <div class="rounded-lg border bg-background px-4 py-3 text-sm">
        <span class="text-muted-foreground">На модерації:</span>
        <span class="ml-1.5 font-semibold text-amber-600">{{ pending }}</span>
      </div>
    </div>

    <!-- Table -->
    <div class="rounded-lg border bg-background overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-muted/40">
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Автор</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Відгук</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Оцінка</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Дата</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Дія</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!reviews?.length">
            <td colspan="6" class="px-4 py-12 text-center text-muted-foreground">
              <Icon name="lucide:message-square" class="h-8 w-8 mx-auto mb-2 opacity-25" />
              Відгуків ще немає
            </td>
          </tr>
          <tr
            v-for="review in reviews"
            :key="review.id"
            class="border-b last:border-0 hover:bg-muted/20 transition-colors"
          >
            <td class="px-4 py-3">
              <p class="font-medium leading-tight">{{ review.name }}</p>
              <p v-if="review.email" class="text-xs text-muted-foreground mt-0.5">{{ review.email }}</p>
            </td>
            <td class="px-4 py-3 max-w-xs">
              <p class="line-clamp-2 text-muted-foreground">{{ review.text }}</p>
            </td>
            <td class="px-4 py-3">
              <div class="flex gap-0.5">
                <Icon
                  v-for="i in 5"
                  :key="i"
                  name="lucide:star"
                  :class="i <= review.rating ? 'text-amber-400' : 'text-muted-foreground/20'"
                  class="h-3.5 w-3.5 fill-current"
                />
              </div>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-muted-foreground">
              {{ formatDate(review.createdAt) }}
            </td>
            <td class="px-4 py-3">
              <Badge
                :class="review.isPublished
                  ? 'bg-green-700 text-white hover:bg-green-800'
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-100'"
              >
                {{ review.isPublished ? 'Опубліковано' : 'На модерації' }}
              </Badge>
            </td>
            <td class="px-4 py-3 text-right">
              <Button
                :variant="review.isPublished ? 'outline' : 'default'"
                size="sm"
                :disabled="toggling === review.id"
                @click="togglePublish(review)"
              >
                <Icon v-if="toggling === review.id" name="lucide:loader-circle" class="h-3.5 w-3.5 mr-1.5 animate-spin" />
                {{ review.isPublished ? 'Відкликати' : 'Опублікувати' }}
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
