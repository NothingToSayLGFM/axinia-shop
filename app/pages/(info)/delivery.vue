<script setup lang="ts">
definePageMeta({ layout: 'info' })
useSeoMeta({
  title: 'Доставка',
  description: 'Умови та терміни доставки товарів ПП Аксінья-Маркет. Безкоштовна доставка Новою Поштою по всій Україні.',
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
  </div>
</template>
