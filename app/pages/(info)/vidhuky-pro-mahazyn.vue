<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'info' })
useSeoMeta({
  title: 'Відгуки про магазин — ПП Аксінья-Маркет',
  description: 'Відгуки покупців про ПП Аксінья-Маркет. Реальні оцінки та враження від покупок засобів індивідуального захисту.',
})

type SortOption = 'newest' | 'rating_desc' | 'oldest'

const sort = ref<SortOption>('newest')

const sortMap: Record<SortOption, string> = {
  newest: 'newest',
  rating_desc: 'rating_desc',
  oldest: 'oldest',
}

const { data, refresh } = await useFetch('/api/reviews', {
  query: computed(() => ({ sort: sortMap[sort.value] })),
})

const reviews = computed(() => data.value?.reviews ?? [])
const total = computed(() => data.value?.total ?? 0)
const avgRating = computed(() => data.value?.avgRating ?? 0)

watch(sort, () => refresh())

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

// Form
const form = reactive({ name: '', email: '', text: '', rating: 0 })
const errors = reactive({ name: '', text: '', rating: '' })
const isSubmitting = ref(false)
const submitted = ref(false)
const hoverRating = ref(0)
const formRef = ref<HTMLElement | null>(null)

function scrollToForm() {
  formRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function validateForm() {
  errors.name = form.name.trim() ? '' : "Вкажіть ім'я"
  errors.text = form.text.trim() ? '' : 'Напишіть відгук'
  errors.rating = form.rating > 0 ? '' : 'Оцініть магазин'
  return !errors.name && !errors.text && !errors.rating
}

async function submitReview() {
  if (!validateForm()) return
  isSubmitting.value = true
  try {
    await $fetch('/api/reviews', {
      method: 'POST',
      body: { name: form.name, email: form.email, text: form.text, rating: form.rating },
    })
    submitted.value = true
    form.name = ''
    form.email = ''
    form.text = ''
    form.rating = 0
  } catch {
    toast.error('Помилка', { description: 'Не вдалося надіслати відгук. Спробуйте ще раз.' })
  } finally {
    isSubmitting.value = false
  }
}

watch(() => form.name, () => { if (errors.name) errors.name = '' })
watch(() => form.text, () => { if (errors.text) errors.text = '' })
watch(() => form.rating, () => { if (errors.rating) errors.rating = '' })
</script>

<template>
  <div>
    <nav aria-label="Хлібні крихти" class="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
      <NuxtLink to="/" class="hover:text-foreground transition-colors">Головна</NuxtLink>
      <span>›</span>
      <span class="text-foreground">Відгуки про магазин</span>
    </nav>

    <h1 class="text-3xl font-bold mb-1">Відгуки про магазин</h1>
    <p class="text-sm text-muted-foreground mb-6">Будемо дуже раді бачити Вашу оцінку нашої роботи!</p>

    <!-- Rating summary -->
    <div v-if="total > 0" class="flex items-center gap-4 mb-6">
      <div class="flex items-baseline gap-2">
        <span class="text-4xl font-bold">{{ avgRating }}</span>
        <div>
          <div class="flex gap-0.5">
            <Icon
              v-for="i in 5"
              :key="i"
              :name="i <= Math.round(avgRating) ? 'lucide:star' : 'lucide:star'"
              :class="i <= Math.round(avgRating) ? 'text-amber-400' : 'text-muted-foreground/30'"
              class="h-5 w-5 fill-current"
            />
          </div>
          <p class="text-sm text-muted-foreground mt-0.5">{{ total }} {{ total === 1 ? 'відгук' : total < 5 ? 'відгуки' : 'відгуків' }}</p>
        </div>
      </div>
    </div>

    <!-- Sort + button -->
    <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
      <div class="flex items-center gap-1 flex-wrap">
        <span class="text-sm text-muted-foreground mr-1">Сортування:</span>
        <Button
          v-for="opt in ([
            { value: 'newest', label: 'спочатку нові' },
            { value: 'rating_desc', label: 'по рейтингу' },
            { value: 'oldest', label: 'спочатку старі' },
          ] as const)"
          :key="opt.value"
          :variant="sort === opt.value ? 'default' : 'ghost'"
          size="sm"
          class="text-xs"
          @click="sort = opt.value"
        >
          {{ opt.label }}
        </Button>
      </div>
      <Button size="sm" @click="scrollToForm">Написати відгук</Button>
    </div>

    <!-- Reviews list -->
    <div v-if="reviews.length" class="divide-y border rounded-lg bg-background mb-10">
      <div v-for="review in reviews" :key="review.id" class="px-5 py-4">
        <div class="flex items-start gap-3">
          <div class="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0 text-sm font-semibold text-muted-foreground uppercase">
            {{ review.name.charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-x-3 gap-y-0.5 mb-1">
              <span class="font-medium text-sm">{{ review.name }}</span>
              <span class="text-xs text-muted-foreground">{{ formatDate(review.createdAt as unknown as string) }}</span>
              <div class="flex gap-0.5">
                <Icon
                  v-for="i in 5"
                  :key="i"
                  name="lucide:star"
                  :class="i <= review.rating ? 'text-amber-400' : 'text-muted-foreground/25'"
                  class="h-3.5 w-3.5 fill-current"
                />
              </div>
            </div>
            <p class="text-sm text-foreground leading-relaxed">{{ review.text }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-12 text-center text-muted-foreground mb-10 border rounded-lg bg-background">
      <Icon name="lucide:message-square" class="h-10 w-10 mb-3 opacity-25" />
      <p class="font-medium">Відгуків поки немає</p>
      <p class="text-sm mt-1">Будьте першим, хто залишить відгук!</p>
    </div>

    <!-- New review form -->
    <div ref="formRef" class="border rounded-lg bg-background p-6">
      <h2 class="text-lg font-semibold mb-5">Новий відгук</h2>

      <div v-if="submitted" class="flex flex-col items-center justify-center py-8 text-center">
        <Icon name="lucide:check-circle" class="h-12 w-12 text-green-600 mb-3" />
        <p class="font-semibold text-lg">Дякуємо за відгук!</p>
        <p class="text-sm text-muted-foreground mt-1">Він з'явиться після модерації.</p>
        <Button variant="outline" size="sm" class="mt-4" @click="submitted = false">Залишити ще один</Button>
      </div>

      <form v-else class="space-y-4" @submit.prevent="submitReview">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="space-y-1.5">
            <Label for="review-name">Ім'я та прізвище <span class="text-destructive">*</span></Label>
            <Input
              id="review-name"
              v-model="form.name"
              placeholder="Ваше ім'я"
              :class="errors.name ? 'border-destructive' : ''"
            />
            <p v-if="errors.name" class="text-xs text-destructive">{{ errors.name }}</p>
          </div>
          <div class="space-y-1.5">
            <Label for="review-email">E-пошта</Label>
            <Input id="review-email" v-model="form.email" type="email" placeholder="email@example.com" />
          </div>
        </div>

        <div class="space-y-1.5">
          <Label for="review-text">Повідомлення <span class="text-destructive">*</span></Label>
          <Textarea
            id="review-text"
            v-model="form.text"
            placeholder="Ваш відгук про магазин..."
            rows="4"
            :class="errors.text ? 'border-destructive' : ''"
          />
          <p v-if="errors.text" class="text-xs text-destructive">{{ errors.text }}</p>
        </div>

        <div class="space-y-1.5">
          <Label>Оцініть магазин <span class="text-destructive">*</span></Label>
          <div class="flex gap-1">
            <button
              v-for="i in 5"
              :key="i"
              type="button"
              :aria-label="`${i} ${i === 1 ? 'зірка' : i < 5 ? 'зірки' : 'зірок'}`"
              class="p-0.5 transition-transform hover:scale-110"
              @click="form.rating = i"
              @mouseenter="hoverRating = i"
              @mouseleave="hoverRating = 0"
            >
              <Icon
                name="lucide:star"
                :class="i <= (hoverRating || form.rating) ? 'text-amber-400' : 'text-muted-foreground/30'"
                class="h-7 w-7 fill-current transition-colors"
              />
            </button>
          </div>
          <p v-if="errors.rating" class="text-xs text-destructive">{{ errors.rating }}</p>
        </div>

        <Button type="submit" :disabled="isSubmitting" class="w-full sm:w-auto">
          <Icon v-if="isSubmitting" name="lucide:loader-circle" class="h-4 w-4 mr-2 animate-spin" />
          Надіслати
        </Button>
      </form>
    </div>
  </div>
</template>
