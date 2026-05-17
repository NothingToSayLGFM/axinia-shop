<script setup lang="ts">
import { Button } from '@/components/ui/button'

const error = useError()
const is404 = computed(() => error.value?.statusCode === 404)
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <CommonHeader />

    <main class="flex flex-1 flex-col items-center justify-center gap-6 text-center px-4">
      <p class="text-8xl font-extrabold text-muted-foreground/20">{{ error?.statusCode }}</p>
      <h1 class="text-2xl font-bold">
        {{ is404 ? 'Сторінка не знайдена' : 'Щось пішло не так' }}
      </h1>
      <p class="text-muted-foreground max-w-sm">
        {{ is404 ? 'Можливо, сторінку було видалено або ви перейшли за невірним посиланням.' : 'Спробуйте оновити сторінку або повернутись на головну.' }}
      </p>
      <NuxtLink to="/">
        <Button>На головну</Button>
      </NuxtLink>
    </main>

    <CommonFooter />
  </div>
</template>
