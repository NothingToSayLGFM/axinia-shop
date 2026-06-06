<script setup lang="ts">
definePageMeta({ layout: 'info' })
const { data: page } = await useFetch('/api/pages/warranty')
useSeoMeta({
  title: 'Гарантія та повернення',
  description: 'Умови гарантії, обміну та повернення товарів Аксінья-Маркет. Захист ваших прав як покупця.',
})
</script>

<template>
  <div>
    <nav class="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
      <NuxtLink to="/" class="hover:text-foreground transition-colors">Головна</NuxtLink>
      <span>›</span>
      <span class="text-foreground">Гарантія / обмін та повернення</span>
    </nav>
    <h1 class="text-3xl font-bold">Гарантія / обмін та повернення</h1>
    <div v-if="page?.content" class="prose prose-neutral mt-8 max-w-none" v-html="page.content" />
  </div>
</template>
