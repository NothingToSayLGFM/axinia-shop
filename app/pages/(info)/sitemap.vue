<script setup lang="ts">
definePageMeta({ layout: 'info' })
useSeoMeta({
  title: 'Мапа сайту — ПП Аксінья-Маркет',
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
  </div>
</template>
