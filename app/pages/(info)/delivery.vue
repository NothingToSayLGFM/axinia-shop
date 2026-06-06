<script setup lang="ts">
definePageMeta({ layout: 'info' })
const { data: page } = await useFetch('/api/pages/delivery')
useSeoMeta({
  title: 'Доставка',
  description: 'Умови та терміни доставки товарів Аксінья-Маркет. Доставка Новою Поштою по всій Україні.',
})
</script>

<template>
  <div>
    <nav class="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
      <NuxtLink to="/" class="hover:text-foreground transition-colors">Головна</NuxtLink>
      <span>›</span>
      <span class="text-foreground">Доставка</span>
    </nav>
    <h1 class="text-3xl font-bold">Доставка</h1>
    <div v-if="page?.content" class="prose prose-neutral mt-8 max-w-none" v-html="page.content" />
  </div>
</template>
