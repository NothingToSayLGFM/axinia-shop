<script setup lang="ts">
definePageMeta({ layout: 'info' })
useHead({ title: 'Знижки — Axinia Market' })
</script>

<template>
  <div>
    <nav class="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
      <NuxtLink to="/" class="hover:text-foreground transition-colors">Головна</NuxtLink>
      <span>›</span>
      <span class="text-foreground">Знижки</span>
    </nav>
    <h1 class="text-3xl font-bold">Знижки</h1>
  </div>
</template>
