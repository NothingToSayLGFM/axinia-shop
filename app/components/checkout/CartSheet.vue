<script setup lang="ts">
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const cart = useCartStore()

function formatPrice(value: number) {
  return `${value.toLocaleString('uk-UA')} грн`
}

function formatItemPrice(item: { price: number | null; quantity: number }) {
  if (item.price === null) return 'Договірна'
  return formatPrice(item.price * item.quantity)
}

const totalLabel = computed(() => {
  if (cart.hasNegotiableItems && !cart.hasPricedItems) return 'Договірна'
  if (cart.hasNegotiableItems && cart.hasPricedItems)
    return `≈ ${formatPrice(cart.totalPrice)} (+ договірна)`
  return formatPrice(cart.totalPrice)
})
</script>

<template>
  <Popover v-model:open="cart.isOpen">
    <PopoverTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        class="relative h-10 w-10 cursor-pointer"
        aria-label="Кошик"
      >
        <Icon name="lucide:shopping-cart" class="h-6 w-6" />
        <span
          v-if="cart.totalItems > 0"
          class="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
        >
          {{ cart.totalItems > 99 ? '99+' : cart.totalItems }}
        </span>
      </Button>
    </PopoverTrigger>

    <PopoverContent
      align="end"
      :side-offset="12"
      class="flex w-80 flex-col gap-0 p-0 sm:w-96"
    >
      <!-- Header -->
      <div class="flex items-center justify-between border-b px-4 py-3">
        <span class="font-semibold">Кошик</span>
        <span v-if="cart.totalItems > 0" class="text-sm text-muted-foreground">
          {{ cart.totalItems }}
          {{ cart.totalItems === 1 ? 'товар' : cart.totalItems < 5 ? 'товари' : 'товарів' }}
        </span>
      </div>

      <!-- Empty state -->
      <div
        v-if="cart.items.length === 0"
        class="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center text-muted-foreground"
      >
        <Icon name="lucide:shopping-cart" class="h-12 w-12 opacity-20" />
        <p class="text-sm font-medium">Кошик порожній</p>
        <p class="text-xs">Додайте товари щоб оформити замовлення</p>
      </div>

      <!-- Items list -->
      <ul v-else class="max-h-72 divide-y overflow-y-auto">
        <li
          v-for="item in cart.items"
          :key="item.id"
          class="flex items-center gap-3 px-4 py-3"
        >
          <!-- Thumbnail -->
          <div class="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
            <NuxtImg
              v-if="item.image"
              :src="item.image"
              :alt="item.name"
              class="h-full w-full object-contain"
            />
            <div v-else class="flex h-full w-full items-center justify-center">
              <Icon name="lucide:package" class="h-5 w-5 text-muted-foreground/30" />
            </div>
          </div>

          <!-- Info -->
          <div class="flex flex-1 flex-col gap-1.5 min-w-0">
            <NuxtLink
              :to="item.categorySlug ? `/shop/${item.categorySlug}/${item.slug ?? item.id}` : `/shop/${item.slug ?? item.id}`"
              class="text-sm font-medium leading-tight line-clamp-2 hover:underline cursor-pointer"
            >{{ item.name }}</NuxtLink>

            <!-- Quantity -->
            <div class="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                class="h-6 w-6 shrink-0"
                @click="cart.updateQuantity(item.id, item.quantity - 1)"
              >
                <Icon name="lucide:minus" class="h-3 w-3" />
              </Button>
              <span class="w-6 text-center text-sm font-medium">{{ item.quantity }}</span>
              <Button
                variant="outline"
                size="icon"
                class="h-6 w-6 shrink-0"
                @click="cart.updateQuantity(item.id, item.quantity + 1)"
              >
                <Icon name="lucide:plus" class="h-3 w-3" />
              </Button>
            </div>

            <p class="text-sm font-semibold">{{ formatItemPrice(item) }}</p>
          </div>

          <!-- Remove -->
          <Button
            variant="ghost"
            size="icon"
            class="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
            :aria-label="`Видалити ${item.name}`"
            @click="cart.removeItem(item.id)"
          >
            <Icon name="lucide:x" class="h-3.5 w-3.5" />
          </Button>
        </li>
      </ul>

      <!-- Footer -->
      <template v-if="cart.items.length > 0">
        <Separator />
        <div class="px-4 py-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Разом:</span>
            <span class="text-lg font-bold">{{ totalLabel }}</span>
          </div>
          <Button class="w-full" size="default" as-child>
            <NuxtLink to="/checkout" @click="cart.isOpen = false">Оформити замовлення</NuxtLink>
          </Button>
        </div>
      </template>
    </PopoverContent>
  </Popover>
</template>
