<script setup lang="ts">
defineProps<{
  to: string
  image?: string | null
  name: string
}>()
</script>

<template>
  <NuxtLink
    :to="to"
    class="group relative overflow-hidden rounded-xl bg-muted aspect-[4/3] block"
  >
    <NuxtImg
      v-if="image"
      :src="image"
      alt=""
      role="presentation"
      class="absolute inset-0 h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-110"
    />
    <div
      v-else
      class="absolute inset-0 bg-gradient-to-br from-muted-foreground/20 to-muted-foreground/5"
    />
    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
    <span class="absolute bottom-0 left-0 right-0 p-4 text-sm font-semibold leading-snug text-white">
      {{ name }}
    </span>
  </NuxtLink>
</template>
