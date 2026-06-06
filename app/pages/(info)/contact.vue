<script setup lang="ts">
definePageMeta({ layout: 'info' })
const { data: page } = await useFetch('/api/pages/contacts')
useSeoMeta({
  title: 'Контакти',
  description: 'Контактна інформація Аксінья-Маркет. Телефон: +38 (067) 530-39-30. Замовляйте засоби захисту з доставкою по Україні.',
})
</script>

<template>
  <div>
    <nav class="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
      <NuxtLink to="/" class="hover:text-foreground transition-colors">Головна</NuxtLink>
      <span>›</span>
      <span class="text-foreground">Контактна інформація</span>
    </nav>
    <h1 class="text-3xl font-bold">Контактна інформація</h1>
    <div v-if="page?.content" class="prose prose-neutral mt-8 max-w-none" v-html="page.content" />
  </div>
</template>
