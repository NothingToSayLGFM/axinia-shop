<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin' })

const INFO_PAGES = [
  { slug: 'about', label: 'Про нас' },
  { slug: 'delivery', label: 'Доставка' },
  { slug: 'payment', label: 'Оплата і доставка' },
  { slug: 'warranty', label: 'Гарантія / обмін та повернення' },
  { slug: 'contacts', label: 'Контактна інформація' },
  { slug: 'discount', label: 'Знижки' },
  { slug: 'terms', label: 'Угода користувача' },
  { slug: 'sitemap', label: 'Мапа сайту' },
]

const contents = reactive<Record<string, string>>({})
const saving = reactive<Record<string, boolean>>({})

INFO_PAGES.forEach(p => { contents[p.slug] = ''; saving[p.slug] = false })

const { data } = await useFetch('/api/pages')
if (data.value) {
  for (const page of data.value) {
    contents[page.slug] = page.content
  }
}

async function publish(slug: string) {
  saving[slug] = true
  try {
    await $fetch(`/api/pages/${slug}`, {
      method: 'PUT',
      body: { content: contents[slug] },
    })
    toast.success('Збережено')
  } catch {
    toast.error('Помилка збереження')
  } finally {
    saving[slug] = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div
      v-for="page in INFO_PAGES"
      :key="page.slug"
      class="rounded-lg border bg-background p-6"
    >
      <h2 class="mb-4 text-base font-semibold">{{ page.label }}</h2>
      <CommonRichEditor v-model="contents[page.slug]" />
      <div class="mt-4 flex justify-end">
        <Button :disabled="saving[page.slug]" @click="publish(page.slug)">
          <Icon
            v-if="saving[page.slug]"
            name="lucide:loader-circle"
            class="mr-2 h-4 w-4 animate-spin"
          />
          Опублікувати
        </Button>
      </div>
    </div>
  </div>
</template>
