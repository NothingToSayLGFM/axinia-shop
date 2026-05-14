<script setup lang="ts">
definePageMeta({ layout: 'info' })
useHead({ title: 'Мапа сайту — Axinia Market' })
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
