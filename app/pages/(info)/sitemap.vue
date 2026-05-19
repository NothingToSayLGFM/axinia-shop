<script setup lang="ts">
definePageMeta({ layout: 'info' })
const { data: page } = await useFetch('/api/pages/sitemap')
useSeoMeta({
  title: 'Мапа сайту',
  description: 'Структура сайту ПП Аксінья-Маркет. Всі розділи та сторінки магазину засобів індивідуального захисту.',
})
</script>

<template>
  <div>
    <nav class="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
      <NuxtLink to="/" class="hover:text-foreground transition-colors">Головна</NuxtLink>
      <span>›</span>
      <span class="text-foreground">Мапа сайту</span>
    </nav>
    <h1 class="text-3xl font-bold">Мапа сайту</h1>
    <div v-if="page?.content" class="prose prose-neutral mt-8 max-w-none" v-html="page.content" />
  </div>
</template>
