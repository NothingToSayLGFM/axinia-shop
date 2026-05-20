<script setup lang="ts">
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'

const props = defineProps<{
  id: number
  slug?: string | null
  categorySlug?: string | null
  images?: { url: string; isMain: boolean }[]
  name?: string | null
  description?: string | null
  price?: string | number | null
}>()

const cart = useCartStore()

const mainImage = computed(() =>
  props.images?.find(img => img.isMain)?.url ?? props.images?.[0]?.url ?? null
)

const cartItem = computed(() => cart.items.find(i => i.id === props.id))

const productUrl = computed(() =>
  props.categorySlug
    ? `/shop/${props.categorySlug}/${props.slug ?? props.id}`
    : `/shop/${props.slug ?? props.id}`
)

function formatPrice(price: string | number | null | undefined) {
  if (!price) return null
  return `${Number(price).toLocaleString('uk-UA')} грн`
}

function addToCart() {
  cart.addItem({
    id: props.id,
    slug: props.slug ?? null,
    categorySlug: props.categorySlug ?? null,
    name: props.name ?? 'Без назви',
    price: Number(props.price ?? 0),
    image: mainImage.value,
  })
  toast.success('Додано до кошика', { description: props.name ?? 'Товар' })
  cart.isOpen = true
}
</script>

<template>
  <Card class="group overflow-hidden pt-0 flex flex-col">
    <NuxtLink :to="productUrl" class="relative overflow-hidden aspect-[4/3] bg-muted cursor-pointer block">
      <img
        v-if="mainImage?.startsWith('/uploads/')"
        :src="mainImage"
        :alt="name ?? ''"
        loading="lazy"
        class="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
      />
      <NuxtImg
        v-else-if="mainImage"
        :src="mainImage"
        :alt="name ?? ''"
        format="webp"
        quality="80"
        width="400"
        height="300"
        sizes="100vw sm:50vw md:33vw"
        loading="lazy"
        class="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
      />
      <div v-else class="h-full w-full flex items-center justify-center bg-muted p-8">
        <NuxtImg src="/images/logo.webp" alt="" role="presentation" format="webp" quality="80" width="200" class="object-contain opacity-30" />
      </div>
    </NuxtLink>

    <CardHeader>
      <NuxtLink :to="productUrl" class="cursor-pointer hover:underline">
        <CardTitle class="text-base leading-snug">{{ name ?? 'Без назви' }}</CardTitle>
      </NuxtLink>
      <p v-if="description" class="text-sm text-muted-foreground line-clamp-3">{{ description }}</p>
    </CardHeader>

    <CardContent class="flex-1">
      <span v-if="price" class="text-lg font-bold text-foreground">
        {{ formatPrice(price) }}
      </span>
      <span v-else class="text-sm text-muted-foreground">Ціна на запит</span>
    </CardContent>

    <CardFooter class="grid grid-cols-2 gap-2">
      <Button class="gap-1.5" size="sm" @click="addToCart">
        <Icon name="lucide:shopping-cart" class="h-4 w-4" />
        Купити
      </Button>
      <ClientOnly>
        <div v-if="cartItem" class="flex items-center justify-between border rounded-md px-1 h-9">
          <Button
            variant="ghost"
            size="icon"
            class="h-7 w-7 shrink-0"
            aria-label="Зменшити кількість"
            @click="cart.updateQuantity(id, cartItem.quantity - 1)"
          >
            <Icon name="lucide:minus" class="h-3.5 w-3.5" />
          </Button>
          <span class="text-sm font-medium tabular-nums">{{ cartItem.quantity }}</span>
          <Button
            variant="ghost"
            size="icon"
            class="h-7 w-7 shrink-0"
            aria-label="Збільшити кількість"
            @click="cart.updateQuantity(id, cartItem.quantity + 1)"
          >
            <Icon name="lucide:plus" class="h-3.5 w-3.5" />
          </Button>
        </div>
        <Button v-else variant="outline" class="w-full" size="sm" as-child>
          <NuxtLink :to="productUrl">Детальніше</NuxtLink>
        </Button>
        <template #fallback>
          <Button variant="outline" class="w-full" size="sm" as-child>
            <NuxtLink :to="productUrl">Детальніше</NuxtLink>
          </Button>
        </template>
      </ClientOnly>
    </CardFooter>
  </Card>
</template>
