<script setup lang="ts">
definePageMeta({ layout: 'info' })
const { data: page } = await useFetch('/api/pages/about')
useSeoMeta({
  title: 'Про нас',
  description: 'Дізнайтесь про ПП Аксінья-Маркет — постачальника засобів індивідуального захисту. Комплексне обслуговування відділів ЦО та охорони праці.',
})
</script>

<template>
  <div>
    <nav class="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
      <NuxtLink to="/" class="hover:text-foreground transition-colors">Головна</NuxtLink>
      <span>›</span>
      <span class="text-foreground">Про нас</span>
    </nav>
    <h1 class="text-3xl font-bold">Про нас</h1>
    <div v-if="page?.content" class="prose prose-neutral mt-8 max-w-none" v-html="page.content" />
  </div>
</template>
