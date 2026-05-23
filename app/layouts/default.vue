<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <CommonHeader />
    <main class="flex-1 bg-muted/40">
      <slot />
    </main>
    <CommonFooter />
  </div>
  <ClientOnly>
    <Teleport to="body">
      <Toaster :rich-colors="true" position="bottom-right" />
      <CookieControl locale="uk" />
    </Teleport>
  </ClientOnly>
</template>
