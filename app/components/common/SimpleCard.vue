<script setup lang="ts">
const props = defineProps<{
  to: string
  image?: string | null
  name: string
}>()

const imgClass = computed(() =>
  props.image
    ? 'absolute inset-0 h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-110'
    : 'absolute inset-0 h-full w-full object-contain p-8 opacity-30 transition-transform duration-500 ease-out group-hover:scale-110'
)
</script>

<template>
  <NuxtLink
    :to="to"
    class="group relative overflow-hidden rounded-xl bg-muted aspect-[4/3] block"
  >
    <NuxtImg
      :src="image || '/images/logo.webp'"
      alt=""
      role="presentation"
      format="webp"
      quality="80"
      width="400"
      height="300"
      sizes="100vw sm:50vw md:25vw"
      loading="lazy"
      :class="imgClass"
    />
    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
    <span class="absolute bottom-0 left-0 right-0 p-4 text-sm font-semibold leading-snug text-white">
      {{ name }}
    </span>
  </NuxtLink>
</template>
