<template>
  <div class="flex flex-wrap gap-2">
    <div
      v-for="(img, i) in modelValue"
      :key="i"
      class="relative group w-24 h-24 rounded-md overflow-hidden border-2 shrink-0 transition-colors"
      :class="img.isMain ? 'border-primary' : 'border-transparent ring-1 ring-border'"
    >
      <img :src="img.url" class="w-full h-full object-cover" alt="" />

      <div v-if="img.isMain" class="absolute top-1 left-1 pointer-events-none">
        <Icon name="lucide:star" class="h-4 w-4 text-yellow-400 drop-shadow" style="fill: #facc15" />
      </div>

      <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
        <button
          type="button"
          class="img-action-btn"
          :class="img.isMain ? 'text-yellow-400' : 'text-white'"
          :title="img.isMain ? 'Головна' : 'Зробити головною'"
          :aria-label="img.isMain ? 'Головна картинка' : 'Зробити головною'"
          @click="setMain(i)"
        >
          <Icon name="lucide:star" class="h-4 w-4" :style="img.isMain ? 'fill: #facc15' : ''" />
        </button>
        <button
          type="button"
          class="img-action-btn text-red-400"
          title="Видалити"
          aria-label="Видалити картинку"
          @click="remove(i)"
        >
          <Icon name="lucide:trash-2" class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div
      class="w-24 h-24 rounded-md border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors shrink-0 bg-muted/20"
      :class="uploading ? 'opacity-60 pointer-events-none' : ''"
      @click="input?.click()"
    >
      <Icon v-if="!uploading" name="lucide:plus" class="h-6 w-6 text-muted-foreground/50" />
      <Icon v-else name="lucide:loader-circle" class="h-6 w-6 text-muted-foreground/50 animate-spin" />
      <span class="text-xs text-muted-foreground/50 mt-1">{{ uploading ? '...' : 'Фото' }}</span>
    </div>

    <input ref="input" type="file" accept="image/*" class="hidden" @change="onFileChange" />
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'

export interface ProductImage {
  url: string
  isMain: boolean
  sortOrder: number
}

const props = defineProps<{ modelValue: ProductImage[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: ProductImage[]] }>()

const input = ref<HTMLInputElement>()
const uploading = ref(false)

function setMain(idx: number) {
  emit('update:modelValue', props.modelValue.map((img, i) => ({ ...img, isMain: i === idx })))
}

function remove(idx: number) {
  const next = props.modelValue.filter((_, i) => i !== idx)
  const removedWasMain = props.modelValue[idx]?.isMain ?? false
  if (next.length > 0 && removedWasMain) {
    next[0] = { ...next[0]!, isMain: true }
  }
  emit('update:modelValue', next)
}

async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    const result = await $fetch<{ url: string }>('/api/upload', { method: 'POST', body: formData })
    const isFirst = props.modelValue.length === 0
    emit('update:modelValue', [
      ...props.modelValue,
      { url: result.url, isMain: isFirst, sortOrder: props.modelValue.length },
    ])
  } catch {
    toast.error('Помилка завантаження', { description: 'Не вдалося завантажити зображення. Перевірте формат і розмір файлу (макс. 10MB).' })
  } finally {
    uploading.value = false
    if (input.value) input.value.value = ''
  }
}
</script>

<style scoped>
.img-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 9999px;
  background-color: rgba(0, 0, 0, 0.4);
  transition: background-color 0.15s;
}
.img-action-btn:hover {
  background-color: rgba(0, 0, 0, 0.7);
}
</style>
