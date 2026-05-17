import { useLocalStorage } from '@vueuse/core'
import { skipHydrate } from 'pinia'

export interface CartItem {
  id: number
  slug: string | null
  categorySlug: string | null
  name: string
  price: number
  image: string | null
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  const items = useLocalStorage<CartItem[]>('cart', [])
  const isOpen = ref(false)

  const totalItems = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))
  const totalPrice = computed(() => items.value.reduce((sum, i) => sum + i.price * i.quantity, 0))

  function addItem(product: Omit<CartItem, 'quantity'>) {
    const existing = items.value.find(i => i.id === product.id)
    if (existing) {
      items.value = items.value.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
    } else {
      items.value = [...items.value, { ...product, quantity: 1 }]
    }
  }

  function removeItem(id: number) {
    items.value = items.value.filter(i => i.id !== id)
  }

  function updateQuantity(id: number, quantity: number) {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    items.value = items.value.map(i => i.id === id ? { ...i, quantity } : i)
  }

  function clear() {
    items.value = []
  }

  return { items: skipHydrate(items), isOpen, totalItems, totalPrice, addItem, removeItem, updateQuantity, clear }
})
