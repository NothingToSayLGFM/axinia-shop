<script setup lang="ts">
const phone = '+38 (067) 530-39-30'
const phoneHref = 'tel:+380675303930'
const email = 'info@axinia.com.ua'
const emailHref = 'mailto:info@axinia.com.ua'

const { data: categories } = await useFetch('/api/categories')

const infoLinks = [
  { label: 'Доставка', to: '/delivery' },
  { label: 'Оплата і доставка', to: '/payment' },
  { label: 'Гарантія / обмін та повернення', to: '/warranty' },
  { label: 'Контактна інформація', to: '/contact' },
  { label: 'Знижки', to: '/discount' },
  { label: 'Угода користувача', to: '/terms' },
  { label: 'Мапа сайту', to: '/sitemap' },
]
</script>

<template>
  <footer class="border-t bg-muted/40">
    <CommonContainer class="py-12">
      <div class="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

        <!-- Про нас -->
        <div class="flex flex-col gap-4">
          <NuxtLink to="/" class="flex items-center gap-3">
            <NuxtImg src="/images/logo.webp" alt="Аксінья-Маркет" format="webp" quality="85" width="80" class="h-10 w-auto" />
            <span class="text-sm font-bold leading-tight">Аксінья-Маркет</span>
          </NuxtLink>
          <p class="text-sm leading-relaxed text-muted-foreground">
            Приватне підприємство «Аксінья – Маркет» реалізовує засоби індивідуального захисту для комплексного обслуговування відділів ЦО та Охорони праці.
          </p>
        </div>

        <!-- Товари -->
        <div class="flex flex-col gap-4">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-foreground">Товари</h2>
          <ul class="flex flex-col gap-2">
            <li v-for="cat in categories" :key="cat.slug">
              <NuxtLink
                :to="`/shop/${cat.slug}`"
                class="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {{ cat.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Інформація -->
        <div class="flex flex-col gap-4">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-foreground">Інформація</h2>
          <ul class="flex flex-col gap-2">
            <li v-for="link in infoLinks" :key="link.to">
              <NuxtLink
                :to="link.to"
                class="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Контакти -->
        <div class="flex flex-col gap-4">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-foreground">Контакти</h2>
          <div class="flex flex-col gap-3">
            <a
              :href="phoneHref"
              class="flex items-center gap-3 rounded-md border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
            >
              <Icon name="lucide:phone" class="h-4 w-4 shrink-0 text-brand" />
              {{ phone }}
            </a>
            <a
              :href="emailHref"
              class="flex items-center gap-3 rounded-md border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
            >
              <Icon name="lucide:mail" class="h-4 w-4 shrink-0 text-brand" />
              {{ email }}
            </a>
          </div>
        </div>

      </div>

      <!-- Bottom bar -->
      <div class="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
        © {{ new Date().getFullYear() }} ПП «Аксінья-Маркет». Всі права захищені.
      </div>
    </CommonContainer>
  </footer>
</template>

