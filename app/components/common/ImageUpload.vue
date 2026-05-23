<template>
  <div class="flex items-start gap-4">
    <div
      class="relative w-24 h-24 rounded-md border-2 border-dashed border-muted-foreground/30 overflow-hidden flex items-center justify-center bg-muted/30 shrink-0 cursor-pointer hover:border-primary/50 transition-colors"
      @click="input?.click()"
    >
      <img v-if="preview" :src="preview" class="w-full h-full object-cover" alt="preview" />
      <Icon v-else name="lucide:image-plus" class="h-8 w-8 text-muted-foreground/50" />
      <div v-if="preview" class="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
        <Icon name="lucide:pencil" class="h-5 w-5 text-white" />
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <Button type="button" variant="outline" size="sm" @click="input?.click()" :disabled="uploading">
        <Icon name="lucide:upload" class="h-4 w-4 mr-2" />
        {{ uploading ? 'Завантаження...' : 'Вибрати фото' }}
      </Button>
      <p v-if="modelValue" class="text-xs text-muted-foreground font-mono truncate max-w-48">{{ modelValue }}</p>
      <Button v-if="modelValue" type="button" variant="ghost" size="sm" class="text-destructive hover:text-destructive w-fit px-0 h-auto" @click="clear">
        <Icon name="lucide:x" class="h-3 w-3 mr-1" />Видалити
      </Button>
    </div>

    <input ref="input" type="file" accept="image/*" class="hidden" @change="onFileChange" />
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'

const props = defineProps<{ modelValue?: string | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()

const input = ref<HTMLInputElement>()
const uploading = ref(false)

const preview = computed(() => props.modelValue || null)

async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    const result = await $fetch<{ url: string }>('/api/upload', { method: 'POST', body: formData })
    emit('update:modelValue', result.url)
  } catch {
    toast.error('Помилка завантаження', { description: 'Не вдалося завантажити зображення. Перевірте формат і розмір файлу (макс. 10MB).' })
  } finally {
    uploading.value = false
    if (input.value) input.value.value = ''
  }
}

function clear() {
  emit('update:modelValue', null)
}
</script>
