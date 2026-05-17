<script setup lang="ts">
definePageMeta({ layout: 'admin' })

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableEmpty } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

interface OrderItem {
  id: number
  name: string
  price: number | string
  quantity: number
  image: string | null
  productId: number | null
}

interface Order {
  id: number
  status: OrderStatus
  name: string
  phone: string
  email: string | null
  comment: string | null
  city: string
  cityRef: string
  deliveryType: 'branch' | 'parcel_locker' | 'courier'
  warehouseRef: string | null
  warehouseDescription: string | null
  street: string | null
  building: string | null
  apartment: string | null
  paymentType: 'online' | 'cash_on_delivery' | 'bank_transfer'
  totalPrice: number | string
  createdAt: string
  items: OrderItem[]
}

const { data: orders, refresh } = await useFetch<Order[]>('/api/orders')

const selectedOrder = ref<Order | null>(null)
const sheetOpen = ref(false)
const isUpdating = ref(false)

function openOrder(order: Order) {
  selectedOrder.value = order
  sheetOpen.value = true
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Новий',
  processing: 'В обробці',
  shipped: 'Відправлено',
  delivered: 'Виконано',
  cancelled: 'Скасовано',
}

const STATUS_CLASSES: Record<OrderStatus, string> = {
  new: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  processing: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  shipped: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100',
  delivered: 'bg-green-100 text-green-800 hover:bg-green-100',
  cancelled: 'bg-red-100 text-red-800 hover:bg-red-100',
}

const DELIVERY_LABELS: Record<string, string> = {
  branch: 'Відділення "Нова Пошта"',
  parcel_locker: 'Поштомат "Нова Пошта"',
  courier: 'Адресна доставка кур\'єром',
}

const PAYMENT_LABELS: Record<string, string> = {
  online: 'Онлайн-оплата карткою',
  cash_on_delivery: 'Післяплата',
  bank_transfer: 'Безготівковий розрахунок',
}

function formatPrice(value: number | string) {
  return `${Number(value).toLocaleString('uk-UA')} грн`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('uk-UA', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

async function updateStatus(status: OrderStatus) {
  if (!selectedOrder.value) return
  isUpdating.value = true
  try {
    const updated = await $fetch<Order>(`/api/orders/${selectedOrder.value.id}`, {
      method: 'PATCH',
      body: { status },
    })
    selectedOrder.value = updated
    await refresh()
  } finally {
    isUpdating.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Замовлення</h1>
      <span class="text-sm text-muted-foreground">{{ orders?.length ?? 0 }} замовлень</span>
    </div>

    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-16">#</TableHead>
            <TableHead>Дата</TableHead>
            <TableHead>Покупець</TableHead>
            <TableHead>Телефон</TableHead>
            <TableHead class="hidden lg:table-cell">E-пошта</TableHead>
            <TableHead class="text-right">Сума</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead><span class="sr-only">Дії</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableEmpty v-if="!orders?.length" :colspan="8">
            Замовлень ще немає
          </TableEmpty>
          <TableRow
            v-for="order in orders"
            :key="order.id"
            class="cursor-pointer"
            @click="openOrder(order)"
          >
            <TableCell class="font-mono text-muted-foreground">{{ order.id }}</TableCell>
            <TableCell class="whitespace-nowrap text-sm">{{ formatDate(order.createdAt) }}</TableCell>
            <TableCell class="font-medium">{{ order.name }}</TableCell>
            <TableCell class="text-sm">{{ order.phone }}</TableCell>
            <TableCell class="hidden lg:table-cell text-sm text-muted-foreground">{{ order.email ?? '—' }}</TableCell>
            <TableCell class="text-right font-semibold whitespace-nowrap">{{ formatPrice(order.totalPrice) }}</TableCell>
            <TableCell>
              <Badge :class="STATUS_CLASSES[order.status]">{{ STATUS_LABELS[order.status] }}</Badge>
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="icon" aria-label="Переглянути замовлення" @click.stop="openOrder(order)">
                <Icon name="lucide:eye" class="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Order detail sheet -->
    <Sheet v-model:open="sheetOpen">
      <SheetContent class="w-full sm:max-w-lg overflow-y-auto" side="right">
        <SheetHeader class="mb-4">
          <SheetTitle>Замовлення #{{ selectedOrder?.id }}</SheetTitle>
        </SheetHeader>

        <template v-if="selectedOrder">
          <!-- Status + actions -->
          <div class="flex items-center gap-3 mb-6">
            <Badge :class="STATUS_CLASSES[selectedOrder.status]" class="text-sm px-3 py-1">
              {{ STATUS_LABELS[selectedOrder.status] }}
            </Badge>
            <span class="text-xs text-muted-foreground ml-auto">{{ formatDate(selectedOrder.createdAt) }}</span>
          </div>

          <!-- Customer -->
          <div class="space-y-3 mb-6">
            <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Покупець</h3>
            <div class="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
              <span class="text-muted-foreground">ПІБ</span>
              <span class="font-medium">{{ selectedOrder.name }}</span>
              <span class="text-muted-foreground">Телефон</span>
              <span>{{ selectedOrder.phone }}</span>
              <span class="text-muted-foreground">E-пошта</span>
              <span>{{ selectedOrder.email ?? '—' }}</span>
              <template v-if="selectedOrder.comment">
                <span class="text-muted-foreground">Коментар</span>
                <span class="italic">{{ selectedOrder.comment }}</span>
              </template>
            </div>
          </div>

          <Separator class="mb-6" />

          <!-- Delivery -->
          <div class="space-y-3 mb-6">
            <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Доставка</h3>
            <div class="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
              <span class="text-muted-foreground">Місто</span>
              <span>{{ selectedOrder.city }}</span>
              <span class="text-muted-foreground">Спосіб</span>
              <span>{{ DELIVERY_LABELS[selectedOrder.deliveryType] }}</span>
              <template v-if="selectedOrder.warehouseDescription">
                <span class="text-muted-foreground">Відділення</span>
                <span>{{ selectedOrder.warehouseDescription }}</span>
              </template>
              <template v-if="selectedOrder.street">
                <span class="text-muted-foreground">Адреса</span>
                <span>
                  вул. {{ selectedOrder.street }}, {{ selectedOrder.building }}
                  <template v-if="selectedOrder.apartment">, кв. {{ selectedOrder.apartment }}</template>
                </span>
              </template>
            </div>
          </div>

          <Separator class="mb-6" />

          <!-- Payment -->
          <div class="space-y-3 mb-6">
            <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Оплата</h3>
            <p class="text-sm">{{ PAYMENT_LABELS[selectedOrder.paymentType] }}</p>
          </div>

          <Separator class="mb-6" />

          <!-- Items -->
          <div class="space-y-3 mb-6">
            <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Товари</h3>
            <ul class="space-y-3">
              <li v-for="item in selectedOrder.items" :key="item.id" class="flex items-center gap-3">
                <div class="h-12 w-12 shrink-0 rounded-md bg-muted overflow-hidden">
                  <NuxtImg v-if="item.image" :src="item.image" :alt="item.name" class="h-full w-full object-contain" />
                  <div v-else class="flex h-full w-full items-center justify-center">
                    <Icon name="lucide:package" class="h-4 w-4 text-muted-foreground/30" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium line-clamp-1">{{ item.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ item.quantity }} × {{ formatPrice(item.price) }}</p>
                </div>
                <span class="text-sm font-semibold whitespace-nowrap">{{ formatPrice(Number(item.price) * item.quantity) }}</span>
              </li>
            </ul>
            <div class="flex items-center justify-between pt-2 border-t">
              <span class="text-sm text-muted-foreground">Разом:</span>
              <span class="text-base font-bold">{{ formatPrice(selectedOrder.totalPrice) }}</span>
            </div>
          </div>

          <Separator class="mb-6" />

          <!-- Status actions -->
          <div class="space-y-2">
            <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Змінити статус</h3>
            <div class="flex flex-wrap gap-2">
              <Button
                v-if="selectedOrder.status !== 'processing' && selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled'"
                variant="outline"
                size="sm"
                :disabled="isUpdating"
                @click="updateStatus('processing')"
              >
                <Icon name="lucide:clock" class="mr-1.5 h-3.5 w-3.5" />
                В обробці
              </Button>
              <Button
                v-if="selectedOrder.status !== 'shipped' && selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled'"
                variant="outline"
                size="sm"
                :disabled="isUpdating"
                @click="updateStatus('shipped')"
              >
                <Icon name="lucide:truck" class="mr-1.5 h-3.5 w-3.5" />
                Відправлено
              </Button>
              <Button
                v-if="selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled'"
                size="sm"
                class="bg-green-700 hover:bg-green-800 text-white"
                :disabled="isUpdating"
                @click="updateStatus('delivered')"
              >
                <Icon name="lucide:check-circle" class="mr-1.5 h-3.5 w-3.5" />
                Виконано
              </Button>
              <Button
                v-if="selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered'"
                variant="destructive"
                size="sm"
                :disabled="isUpdating"
                @click="updateStatus('cancelled')"
              >
                <Icon name="lucide:x-circle" class="mr-1.5 h-3.5 w-3.5" />
                Скасувати
              </Button>
              <p v-if="selectedOrder.status === 'delivered'" class="text-sm text-green-700 font-medium">
                Замовлення виконано
              </p>
              <p v-if="selectedOrder.status === 'cancelled'" class="text-sm text-destructive font-medium">
                Замовлення скасовано
              </p>
            </div>
          </div>
        </template>
      </SheetContent>
    </Sheet>
  </div>
</template>
