<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const route = useRoute()
const router = useRouter()

const infoLinks = [
  { label: 'Про нас', to: '/about' },
  { label: 'Доставка', to: '/delivery' },
  { label: 'Оплата і доставка', to: '/payment' },
  { label: 'Гарантія / обмін та повернення', to: '/warranty' },
  { label: 'Контактна інформація', to: '/contact' },
  { label: 'Знижки', to: '/discount' },
  { label: 'Угода користувача', to: '/terms' },
  { label: 'Відгуки про магазин', to: '/vidhuky-pro-mahazyn' },
  { label: 'Мапа сайту', to: '/sitemap' },
]

function onSelectChange(to: string) {
  router.push(to)
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <CommonHeader />
    <main class="flex-1 bg-muted/40">
      <CommonContainer class="py-8">

        <!-- Mobile select -->
        <div class="mb-6 md:hidden">
          <Select :model-value="route.path" @update:model-value="onSelectChange">
            <SelectTrigger aria-label="Розділи інформації" class="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="link in infoLinks" :key="link.to" :value="link.to">
                {{ link.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex gap-8 items-start">
          <!-- Desktop sidebar -->
          <aside class="hidden md:block w-52 shrink-0 sticky top-24 self-start">
            <nav aria-label="Розділи інформації" class="flex flex-col overflow-hidden rounded-lg border bg-background">
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
