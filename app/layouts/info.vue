<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'

const route = useRoute()

const infoLinks = [
  { label: 'Про нас', to: '/about' },
  { label: 'Доставка', to: '/delivery' },
  { label: 'Оплата і доставка', to: '/payment' },
  { label: 'Гарантія / обмін та повернення', to: '/warranty' },
  { label: 'Контактна інформація', to: '/contacts' },
  { label: 'Знижки', to: '/discount' },
  { label: 'Угода користувача', to: '/terms' },
  { label: 'Мапа сайту', to: '/sitemap' },
]
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <CommonHeader />
    <main class="flex-1 bg-muted/40">
      <CommonContainer class="py-8">
        <div class="flex gap-8 items-start">
          <!-- Sidebar -->
          <aside class="w-52 shrink-0">
            <nav class="flex flex-col overflow-hidden rounded-lg border bg-background">
              <NuxtLink
                v-for="link in infoLinks"
                :key="link.to"
                :to="link.to"
                :class="[
                  'px-4 py-3 text-sm leading-tight transition-colors',
                  route.path === link.to
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted',
                ]"
              >
                {{ link.label }}
              </NuxtLink>
            </nav>
          </aside>

          <!-- Content -->
          <div class="min-w-0 flex-1">
            <slot />
          </div>
        </div>
      </CommonContainer>
    </main>
    <CommonFooter />
  </div>
  <ClientOnly>
    <Teleport to="body">
      <Toaster :rich-colors="true" position="bottom-right" />
    </Teleport>
  </ClientOnly>
</template>
