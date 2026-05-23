<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MIN_QUANTITY, useMinQuantityModal } from '~/composables/useMinQuantityModal'

const { isOpen } = useMinQuantityModal()
const { data, status } = useFetch('/api/pages/min-quantity', { key: 'min-qty-page', lazy: true })
const content = computed(() => data.value?.content ?? '')
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>Мінімальна кількість замовлення</DialogTitle>
      </DialogHeader>
      <div v-if="status === 'pending'" class="flex justify-center py-2">
        <Icon name="lucide:loader-circle" class="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
      <div
        v-else-if="content"
        class="prose prose-neutral prose-sm max-w-none"
        v-html="content"
      />
      <p v-else class="text-sm text-muted-foreground">
        Мінімальна кількість для замовлення — {{ MIN_QUANTITY }} штук.
      </p>
    </DialogContent>
  </Dialog>
</template>
