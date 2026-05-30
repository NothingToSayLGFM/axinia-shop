<script setup lang="ts">
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  categories: Array<{ id: number; name: string; slug: string }>
  selectedCategories: string[]
  priceRange: [number, number]
  priceMax: number
}>()

const emit = defineEmits<{
  'update:selectedCategories': [value: string[]]
  'update:priceRange': [value: [number, number]]
  reset: []
}>()

const localPriceRange = ref<[number, number]>([...props.priceRange])

watch(() => props.priceRange, (val) => {
  localPriceRange.value = [...val]
})

function toggleCategory(slug: string, current: string[]) {
  const next = current.includes(slug)
    ? current.filter(s => s !== slug)
    : [...current, slug]
  emit('update:selectedCategories', next)
}

function applyPrice() {
  emit('update:priceRange', [...localPriceRange.value])
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <span class="text-sm font-semibold text-foreground">Фільтри</span>
      <Button variant="ghost" size="sm" class="h-7 px-2 text-xs text-muted-foreground" @click="emit('reset')">
        Скинути
      </Button>
    </div>

    <!-- Категорії -->
    <div class="space-y-2">
      <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Категорія</p>
      <div class="space-y-0.5">
        <label
          v-for="cat in categories"
          :key="cat.slug"
          class="flex items-center gap-2.5 cursor-pointer py-1.5 px-2 rounded-md hover:bg-muted text-sm transition-colors"
        >
          <input
            type="checkbox"
            :value="cat.slug"
            :checked="selectedCategories.includes(cat.slug)"
            class="h-4 w-4 rounded border-input accent-primary cursor-pointer shrink-0"
            @change="toggleCategory(cat.slug, selectedCategories)"
          />
          {{ cat.name }}
        </label>
      </div>
    </div>

    <!-- Ціна -->
    <div class="space-y-3">
      <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ціна (грн)</p>
      <Slider
        v-model="localPriceRange"
        :min="0"
        :max="priceMax"
        :step="100"
        class="w-full"
      />
      <div class="flex items-center justify-between text-sm text-muted-foreground">
        <span>{{ localPriceRange[0].toLocaleString('uk-UA') }}</span>
        <span>{{ localPriceRange[1].toLocaleString('uk-UA') }}</span>
      </div>
      <Button size="sm" class="w-full bg-foreground text-background hover:bg-foreground/90" @click="applyPrice">ОК</Button>
    </div>
  </div>
</template>
