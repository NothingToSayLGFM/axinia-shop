<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Command, CommandList, CommandGroup, CommandItem } from '@/components/ui/command'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { onClickOutside, useDebounceFn } from '@vueuse/core'
import { vMaska } from 'maska/vue'
import { toast } from 'vue-sonner'

const cart = useCartStore()

const termsOpen = ref(false)
const { data: termsPage } = await useFetch('/api/pages/terms')
const termsContent = computed(() => termsPage.value?.content ?? '')

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

const errors = reactive({
  name: '',
  phone: '',
  warehouse: '',
  street: '',
  building: '',
})

function isValidPhone(phone: string): boolean {
  return phone.replace(/\D/g, '').length === 12
}

function validateForm(): boolean {
  errors.name = ''
  errors.phone = ''
  errors.warehouse = ''
  errors.street = ''
  errors.building = ''

  let valid = true

  if (!form.name.trim()) {
    errors.name = 'Введіть ПІБ'
    valid = false
  }

  if (!form.phone.trim()) {
    errors.phone = 'Введіть номер телефону'
    valid = false
  } else if (!isValidPhone(form.phone)) {
    errors.phone = 'Невірний формат. Приклад: +380671234567'
    valid = false
  }

  if (form.deliveryType !== 'courier' && !form.warehouseRef) {
    errors.warehouse = form.deliveryType === 'branch' ? 'Оберіть відділення' : 'Оберіть поштомат'
    valid = false
  }

  if (form.deliveryType === 'courier') {
    if (!form.street.trim()) {
      errors.street = 'Введіть назву вулиці'
      valid = false
    }
    if (!form.building.trim()) {
      errors.building = 'Введіть номер будинку'
      valid = false
    }
  }

  return valid
}

const isSubmitting = ref(false)
const orderNumber = ref<number | null>(null)

async function submitOrder() {
  if (!validateForm()) return
  isSubmitting.value = true
  try {
    const warehouseDescription = warehouses.value.find(w => w.ref === form.warehouseRef)?.description
    const order = await $fetch<{ id: number }>('/api/orders', {
      method: 'POST',
      body: {
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        comment: form.comment || undefined,
        city: form.city,
        cityRef: form.cityRef,
        deliveryType: form.deliveryType,
        warehouseRef: form.warehouseRef || undefined,
        warehouseDescription: warehouseDescription || undefined,
        street: form.street || undefined,
        building: form.building || undefined,
        apartment: form.apartment || undefined,
        paymentType: form.paymentType,
        items: cart.items.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price ?? 0,
          quantity: item.quantity,
          image: item.image || undefined,
        })),
      },
    })
    cart.clear()
    orderNumber.value = order.id
  } catch {
    toast.error('Помилка оформлення', { description: 'Спробуйте ще раз або зв\'яжіться з нами.' })
  } finally {
    isSubmitting.value = false
  }
}

const DELIVERY_TYPES = [
  { value: 'branch', label: 'Відділення "Нова Пошта"' },
  { value: 'parcel_locker', label: 'Поштомат "Нова Пошта"' },
  { value: 'courier', label: 'Адресна доставка кур\'єром "Нова Пошта"' },
] as const

type DeliveryType = typeof DELIVERY_TYPES[number]['value']

const PAYMENT_TYPES = [
  { value: 'online', label: 'Онлайн-оплата банківською карткою Visa / MasterCard', hint: 'Безпечна оплата карткою Visa або MasterCard на сайті.' },
  { value: 'cash_on_delivery', label: 'Післяплата', hint: 'Оплата при отриманні. Комісія за грошовий переказ 20 грн + 2% від суми грошового переказу.' },
  { value: 'bank_transfer', label: 'Безготівковий розрахунок', hint: 'Оплата на рахунок можлива з ПДВ, та без. Всю інформацію Вам надішле наш менеджер після оформлення замовлення.' },
] as const

type PaymentType = typeof PAYMENT_TYPES[number]['value']

const selectedPaymentHint = computed(() =>
  PAYMENT_TYPES.find(t => t.value === form.paymentType)?.hint ?? ''
)

interface WarehouseResult {
  ref: string
  description: string
  shortAddress: string
  number: string
}

const form = reactive({
  name: '',
  phone: '',
  city: '',
  cityRef: '',
  email: '',
  comment: '',
  deliveryType: 'branch' as DeliveryType,
  warehouseRef: '',
  street: '',
  building: '',
  apartment: '',
  paymentType: 'cash_on_delivery' as PaymentType,
})

watch(() => form.name, () => { errors.name = '' })
watch(() => form.phone, () => { errors.phone = '' })
watch(() => form.warehouseRef, () => { errors.warehouse = '' })
watch(() => form.street, () => { errors.street = '' })
watch(() => form.building, () => { errors.building = '' })

const warehouses = ref<WarehouseResult[]>([])
const warehousesLoading = ref(false)

async function loadWarehouses() {
  if (!form.cityRef || form.deliveryType === 'courier') {
    warehouses.value = []
    form.warehouseRef = ''
    return
  }
  warehousesLoading.value = true
  form.warehouseRef = ''
  try {
    warehouses.value = await $fetch<WarehouseResult[]>('/api/nova-poshta/warehouses', {
      query: { cityRef: form.cityRef, type: form.deliveryType },
    })
  } finally {
    warehousesLoading.value = false
  }
}

watch(() => form.cityRef, loadWarehouses)
watch(() => form.deliveryType, () => {
  form.warehouseRef = ''
  form.street = ''
  form.building = ''
  form.apartment = ''
  loadWarehouses()
})

// City search
interface CityResult {
  ref: string
  deliveryCity: string
  present: string
  area: string
  settlementTypeCode: string
}

const cityQuery = ref('')
const cityResults = ref<CityResult[]>([])
const cityLoading = ref(false)
const cityOpen = ref(false)
const cityContainer = ref<HTMLElement | null>(null)
const isProgrammaticSet = ref(false)

onClickOutside(cityContainer, () => { cityOpen.value = false })

const searchCities = useDebounceFn(async (query: string) => {
  if (query.length < 3) {
    cityResults.value = []
    cityOpen.value = false
    return
  }
  cityLoading.value = true
  try {
    cityResults.value = await $fetch<CityResult[]>('/api/nova-poshta/cities', {
      query: { search: query },
    })
    cityOpen.value = cityResults.value.length > 0
  } finally {
    cityLoading.value = false
  }
}, 400)

watch(cityQuery, (val) => {
  if (isProgrammaticSet.value) return
  form.city = ''
  form.cityRef = ''
  form.warehouseRef = ''
  warehouses.value = []
  searchCities(val)
})

function selectCity(city: CityResult) {
  isProgrammaticSet.value = true
  cityQuery.value = city.present
  form.city = city.present
  form.cityRef = city.deliveryCity
  cityOpen.value = false
  cityResults.value = []
  nextTick(() => { isProgrammaticSet.value = false })
}

function clearCity() {
  isProgrammaticSet.value = true
  cityQuery.value = ''
  form.city = ''
  form.cityRef = ''
  cityResults.value = []
  cityOpen.value = false
  nextTick(() => { isProgrammaticSet.value = false })
}
</script>

<template>
  <CommonContainer size="xl" class="py-10">

    <!-- Success screen -->
    <div v-if="orderNumber" class="flex flex-col items-center justify-center gap-6 py-20 text-center">
      <div class="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
        <Icon name="lucide:package-check" class="h-12 w-12 text-green-600" />
      </div>
      <div class="flex flex-col gap-2">
        <h1 class="text-2xl font-bold">Дякуємо за замовлення!</h1>
        <p class="text-muted-foreground">Замовлення <span class="font-semibold text-foreground">#{{ orderNumber }}</span> прийнято.</p>
        <p class="text-muted-foreground text-sm">Наш менеджер зв'яжеться з вами найближчим часом.</p>
      </div>
      <Button as-child variant="outline">
        <NuxtLink to="/shop">
          <Icon name="lucide:arrow-left" class="mr-2 h-4 w-4" />
          Продовжити покупки
        </NuxtLink>
      </Button>
    </div>

    <template v-else>
    <h1 class="text-2xl font-bold mb-8">Оформлення замовлення</h1>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
      <!-- Left: form -->
      <div class="flex flex-col gap-4" :class="{ 'pointer-events-none opacity-50 select-none': isSubmitting }">

        <!-- Одержувач замовлення -->
        <div class="rounded-lg border bg-card p-6">
          <h2 class="text-base font-semibold mb-5">Одержувач замовлення</h2>

          <div class="flex flex-col gap-4">
            <!-- ПІБ -->
            <div class="grid grid-cols-[140px_1fr] items-start gap-4">
              <Label for="name" class="text-sm text-muted-foreground pt-2">ПІБ</Label>
              <div class="flex flex-col gap-1">
                <Input id="name" v-model="form.name" placeholder="Прізвище Ім'я По батькові" :class="errors.name && 'border-destructive focus-visible:border-destructive'" />
                <p v-if="errors.name" class="text-xs text-destructive">{{ errors.name }}</p>
              </div>
            </div>

            <!-- Телефон -->
            <div class="grid grid-cols-[140px_1fr] items-start gap-4">
              <Label for="phone" class="text-sm text-muted-foreground pt-2">Телефон</Label>
              <div class="flex flex-col gap-1">
                <Input id="phone" v-maska="'+38 (0##) ###-##-##'" v-model="form.phone" type="tel" placeholder="+38 (0__) ___-__-__" :class="errors.phone && 'border-destructive focus-visible:border-destructive'" />
                <p v-if="errors.phone" class="text-xs text-destructive">{{ errors.phone }}</p>
              </div>
            </div>

            <!-- Місто -->
            <div class="grid grid-cols-[140px_1fr] items-center gap-4">
              <Label class="text-sm text-muted-foreground">Місто</Label>
              <div ref="cityContainer" class="relative">
                <!-- Input with search icon -->
                <div class="relative flex items-center">
                  <Icon
                    name="lucide:search"
                    class="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none z-10"
                  />
                  <Input
                    v-model="cityQuery"
                    placeholder="Для пошуку введіть мінімум 3 символи"
                    class="pl-9 pr-8"
                    autocomplete="off"
                  />
                  <button
                    v-if="cityQuery"
                    type="button"
                    class="absolute right-2.5 text-muted-foreground hover:text-foreground transition-colors"
                    @click="clearCity"
                  >
                    <Icon name="lucide:x" class="h-3.5 w-3.5" />
                  </button>
                  <Icon
                    v-if="cityLoading"
                    name="lucide:loader-circle"
                    class="absolute right-8 h-4 w-4 animate-spin text-muted-foreground"
                  />
                </div>

                <!-- Dropdown -->
                <div
                  v-if="cityOpen"
                  class="absolute z-50 top-full left-0 right-0 mt-1 rounded-md border shadow-md overflow-hidden"
                >
                  <Command class="h-auto rounded-none">
                    <CommandList class="max-h-56">
                      <CommandGroup>
                        <CommandItem
                          v-for="city in cityResults"
                          :key="city.ref"
                          :value="city.present"
                          class="cursor-pointer"
                          @mousedown.prevent
                          @click="selectCity(city)"
                        >
                          {{ city.present }}
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </div>
              </div>
            </div>

            <!-- E-пошта -->
            <div class="grid grid-cols-[140px_1fr] items-center gap-4">
              <Label for="email" class="text-sm text-muted-foreground">E-пошта</Label>
              <Input id="email" v-model="form.email" type="email" placeholder="example@email.com" />
            </div>

            <!-- Коментар -->
            <div class="grid grid-cols-[140px_1fr] items-start gap-4">
              <Label for="comment" class="text-sm text-muted-foreground pt-2">Коментар</Label>
              <Textarea
                id="comment"
                v-model="form.comment"
                placeholder="Додаткова інформація до замовлення"
                class="min-h-[100px]"
              />
            </div>
          </div>
        </div>

        <!-- Доставка -->
        <div class="rounded-lg border bg-card p-6">
          <h2 class="text-base font-semibold mb-5">Доставка</h2>

          <div class="flex flex-col gap-4">
            <!-- Тип доставки -->
            <div class="grid grid-cols-[140px_1fr] items-center gap-4">
              <Label class="text-sm text-muted-foreground">Доставка</Label>
              <Select v-model="form.deliveryType">
                <SelectTrigger aria-label="Тип доставки">
                  <SelectValue placeholder="Оберіть спосіб доставки" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="type in DELIVERY_TYPES" :key="type.value" :value="type.value">
                    {{ type.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Відділення або Поштомат -->
            <div
              v-if="form.deliveryType !== 'courier'"
              class="grid grid-cols-[140px_1fr] items-start gap-4"
            >
              <Label class="text-sm text-muted-foreground pt-2">Відділення</Label>
              <div class="flex flex-col gap-1">
                <Select v-model="form.warehouseRef" :disabled="!form.cityRef || warehousesLoading">
                  <SelectTrigger aria-label="Відділення" :class="errors.warehouse && 'border-destructive'">
                    <SelectValue :placeholder="!form.cityRef ? 'Спочатку оберіть місто' : warehousesLoading ? 'Завантаження...' : 'Оберіть відділення'" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="w in warehouses" :key="w.ref" :value="w.ref">
                      {{ w.description }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p v-if="errors.warehouse" class="text-xs text-destructive">{{ errors.warehouse }}</p>
              </div>
            </div>

            <!-- Адреса кур'єра -->
            <div
              v-if="form.deliveryType === 'courier'"
              class="grid grid-cols-[140px_1fr] items-start gap-4"
            >
              <Label class="text-sm text-muted-foreground pt-2">Адреса</Label>
              <div class="flex flex-col gap-2">
                <div class="grid grid-cols-[1fr_100px_100px] gap-2">
                  <Input v-model="form.street" placeholder="Вулиця" :class="errors.street && 'border-destructive focus-visible:border-destructive'" />
                  <Input v-model="form.building" placeholder="Будинок" :class="errors.building && 'border-destructive focus-visible:border-destructive'" />
                  <Input v-model="form.apartment" placeholder="Квартира" />
                </div>
                <p v-if="errors.street" class="text-xs text-destructive">{{ errors.street }}</p>
                <p v-if="errors.building && !errors.street" class="text-xs text-destructive">{{ errors.building }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Оплата -->
        <div class="rounded-lg border bg-card p-6">
          <h2 class="text-base font-semibold mb-5">Оплата</h2>

          <div class="grid grid-cols-[140px_1fr] items-start gap-4">
            <Label class="text-sm text-muted-foreground pt-2">Спосіб оплати</Label>
            <div class="flex flex-col gap-2">
              <Select v-model="form.paymentType">
                <SelectTrigger aria-label="Спосіб оплати">
                  <SelectValue placeholder="Оберіть спосіб оплати" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="type in PAYMENT_TYPES" :key="type.value" :value="type.value">
                    {{ type.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p class="text-xs text-muted-foreground">{{ selectedPaymentHint }}</p>
            </div>
          </div>
        </div>

      </div>

      <!-- Right: order summary -->
      <div class="sticky top-6 self-start rounded-lg border bg-card overflow-hidden" :class="{ 'pointer-events-none opacity-50 select-none': isSubmitting }">
        <div class="px-5 py-4 border-b">
          <h2 class="font-semibold">Ваше замовлення</h2>
        </div>

        <!-- Empty state -->
        <div
          v-if="cart.items.length === 0"
          class="flex flex-col items-center justify-center gap-2 px-5 py-10 text-center text-muted-foreground"
        >
          <Icon name="lucide:shopping-cart" class="h-10 w-10 opacity-20" />
          <p class="text-sm font-medium">Кошик порожній</p>
        </div>

        <!-- Items list -->
        <ul v-else class="divide-y max-h-[420px] overflow-y-auto">
          <li
            v-for="item in cart.items"
            :key="item.id"
            class="flex items-center gap-3 px-5 py-3"
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
              <div class="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  class="h-6 w-6 shrink-0"
                  :aria-label="`Зменшити кількість ${item.name}`"
                  @click="cart.updateQuantity(item.id, item.quantity - 1)"
                >
                  <Icon name="lucide:minus" class="h-3 w-3" />
                </Button>
                <span class="w-6 text-center text-sm font-medium" :aria-label="`Кількість: ${item.quantity}`">{{ item.quantity }}</span>
                <Button
                  variant="outline"
                  size="icon"
                  class="h-6 w-6 shrink-0"
                  :aria-label="`Збільшити кількість ${item.name}`"
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
          <div class="px-5 py-4 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">Разом:</span>
              <span class="text-lg font-bold">{{ totalLabel }}</span>
            </div>
            <Button
              class="w-full"
              size="default"
              :disabled="!form.cityRef || cart.items.length === 0 || isSubmitting"
              @click="submitOrder"
            >
              <Icon v-if="isSubmitting" name="lucide:loader-circle" class="mr-2 h-4 w-4 animate-spin" />
              {{ isSubmitting ? 'Оформлення...' : 'Оформити замовлення' }}
            </Button>
            <p class="text-center text-xs text-muted-foreground">
              Натискаючи кнопку, ви погоджуєтесь з
              <button type="button" class="underline underline-offset-2 hover:text-foreground transition-colors cursor-pointer" @click="termsOpen = true">
                угодою користувача
              </button>
            </p>
          </div>
        </template>
      </div>
    </div>
    </template>
  </CommonContainer>

  <Dialog v-model:open="termsOpen">
    <DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Угода користувача</DialogTitle>
      </DialogHeader>
      <div
        v-if="termsContent"
        class="prose prose-neutral max-w-none text-sm"
        v-html="termsContent"
      />
      <p v-else class="text-sm text-muted-foreground">Текст угоди поки не заповнений.</p>
    </DialogContent>
  </Dialog>
</template>
