<template>
  <div class="min-h-screen bg-muted/40 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-background border-r flex flex-col fixed inset-y-0">
      <div class="h-16 flex items-center gap-2 px-6 border-b">
        <NuxtImg src="/images/logo.png" alt="Аксінья-Маркет" class="h-8 w-auto" />
        <span class="font-semibold text-sm">Адмінка</span>
      </div>

      <nav class="flex-1 p-4 space-y-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-muted"
          :class="{ 'bg-muted text-foreground': isActive(item.to), 'text-muted-foreground': !isActive(item.to) }"
        >
          <Icon :name="item.icon" class="h-4 w-4 shrink-0" />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="p-4 border-t">
        <div class="flex items-center gap-3">
          <ClientOnly>
            <UserButton />
          </ClientOnly>
          <div class="text-sm">
            <p class="font-medium leading-none">{{ user?.firstName }}</p>
            <p class="text-muted-foreground text-xs mt-1">Адміністратор</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 ml-64 flex flex-col min-h-screen">
      <header class="h-16 bg-background border-b flex items-center px-6">
        <h1 class="font-semibold text-lg">{{ pageTitle }}</h1>
      </header>
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const { user } = useUser()
const route = useRoute()

const navItems = [
  { to: '/admin', label: 'Дашборд', icon: 'lucide:layout-dashboard' },
  { to: '/admin/categories', label: 'Категорії', icon: 'lucide:folder' },
  { to: '/admin/products', label: 'Товари', icon: 'lucide:package' },
  { to: '/admin/orders', label: 'Замовлення', icon: 'lucide:shopping-bag' },
  { to: '/admin/info', label: 'Інформація', icon: 'lucide:file-text' },
]

const pageTitles: Record<string, string> = {
  '/admin': 'Дашборд',
  '/admin/categories': 'Категорії',
  '/admin/products': 'Товари',
  '/admin/orders': 'Замовлення',
  '/admin/info': 'Інформація',
}

const pageTitle = computed(() => pageTitles[route.path] ?? 'Адмінка')

function isActive(to: string) {
  return to === '/admin' ? route.path === to : route.path.startsWith(to)
}
</script>
