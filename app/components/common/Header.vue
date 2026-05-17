<script setup lang="ts">
import { Button } from '@/components/ui/button'

const navLinks = [
  { label: 'Головна', to: '/' },
  { label: 'Товари', to: '/shop' },
  { label: 'Про нас', to: '/about' },
  { label: 'Контакти', to: '/contacts' },
]

const phone = '+38 (067) 530-39-30'
const phoneHref = 'tel:+380675303930'

const mobileMenuOpen = ref(false)
const route = useRoute()
const router = useRouter()
const searchFocusTrigger = useState('searchFocusTrigger', () => 0)

function handleSearchClick() {
  if (route.path === '/shop') {
    searchFocusTrigger.value++
  } else {
    router.push('/shop')
  }
}
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <CommonContainer>
      <div class="flex h-20 items-center justify-between gap-4">

        <!-- Лого + Название -->
        <NuxtLink to="/" class="flex shrink-0 items-center gap-3 focus:outline-none">
          <NuxtImg
            src="/images/logo.webp"
            alt="Аксінья-Маркет"
            format="webp"
            quality="85"
            width="88"
            class="h-11 w-auto"
          />
          <span class="hidden text-base font-bold leading-tight sm:block">
            ПП Аксінья-Маркет
          </span>
        </NuxtLink>

        <!-- Телефон (md+) -->
        <a
          :href="phoneHref"
          class="hidden items-center gap-2 font-medium text-foreground transition-colors hover:text-primary md:flex"
        >
          <Icon name="lucide:phone" class="h-5 w-5 shrink-0" />
          {{ phone }}
        </a>

        <!-- Навигация (lg+) -->
        <nav class="hidden items-center gap-1 lg:flex" aria-label="Головна навігація">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="rounded-md px-4 py-2 text-base font-medium transition-colors hover:bg-accent"
            :class="route.path === link.to || (link.to !== '/' && route.path.startsWith(link.to))
              ? 'bg-accent text-foreground font-semibold'
              : 'text-muted-foreground hover:text-accent-foreground'"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <!-- Правый блок: поиск + корзина + гамбургер -->
        <div class="flex items-center gap-1">
          <Button variant="ghost" size="icon" class="h-10 w-10 cursor-pointer" aria-label="Пошук" @click="handleSearchClick">
            <Icon name="lucide:search" class="h-6 w-6" />
          </Button>

          <!-- Единственная инстанция корзины -->
          <ClientOnly>
            <CheckoutCartSheet />
            <template #fallback>
              <Button variant="ghost" size="icon" class="h-10 w-10" aria-label="Кошик">
                <Icon name="lucide:shopping-cart" class="h-6 w-6" />
              </Button>
            </template>
          </ClientOnly>

          <!-- Гамбургер (только mobile) -->
          <Button
            variant="ghost"
            size="icon"
            class="h-10 w-10 cursor-pointer lg:hidden"
            aria-label="Меню"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <Icon :name="mobileMenuOpen ? 'lucide:x' : 'lucide:menu'" class="h-6 w-6" />
          </Button>
        </div>

      </div>
    </CommonContainer>

    <!-- Мобильное меню -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="mobileMenuOpen"
        class="absolute inset-x-0 top-full border-t bg-background shadow-lg lg:hidden"
      >
        <CommonContainer>
          <nav class="flex flex-col py-3" aria-label="Мобільна навігація">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="rounded-md px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              active-class="bg-accent text-foreground"
              @click="mobileMenuOpen = false"
            >
              {{ link.label }}
            </NuxtLink>
            <a
              :href="phoneHref"
              class="mt-1 flex items-center gap-2 rounded-md px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Icon name="lucide:phone" class="h-5 w-5" />
              {{ phone }}
            </a>
          </nav>
        </CommonContainer>
      </div>
    </Transition>
  </header>
</template>
