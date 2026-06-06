<script setup lang="ts">
definePageMeta({ layout: 'info' })
const { data: page } = await useFetch('/api/pages/discount')
useSeoMeta({
  title: 'Знижки та акції',
  description: 'Актуальні знижки та спеціальні пропозиції на засоби індивідуального захисту від Аксінья-Маркет.',
})
</script>

<template>
  <div>
    <nav class="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
      <NuxtLink to="/" class="hover:text-foreground transition-colors">Головна</NuxtLink>
      <span>›</span>
      <span class="text-foreground">Знижки</span>
    </nav>
    <h1 class="text-3xl font-bold">Знижки</h1>
    <div v-if="page?.content" class="prose prose-neutral mt-8 max-w-none" v-html="page.content" />
  </div>
</template>
