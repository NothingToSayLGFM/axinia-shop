<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  as?: string
}

const { size = 'xl', as = 'div' } = defineProps<Props>()

const maxWidth = {
  sm:   'max-w-3xl',
  md:   'max-w-5xl',
  lg:   'max-w-6xl',
  xl:   'max-w-7xl',
  full: 'max-w-full',
}
</script>

<template>
  <component
    :is="as"
    :class="['mx-auto w-full px-4 sm:px-6 lg:px-8', maxWidth[size]]"
  >
    <slot />
  </component>
</template>
