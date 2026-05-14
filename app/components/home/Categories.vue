<script setup lang="ts">
const { data: categories, status } = await useFetch('/api/categories')
const pending = computed(() => status.value === 'pending')
</script>

<template>
  <CommonContainer>
    <h2 class="mb-8 text-2xl font-bold text-foreground sm:text-3xl">Популярні категорії</h2>

    <div v-if="pending" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      <div v-for="i in 8" :key="i" class="rounded-xl aspect-[4/3] bg-muted animate-pulse" />
    </div>

    <div v-else-if="categories?.length" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      <CommonSimpleCard
        v-for="cat in categories"
        :key="cat.slug"
        :to="`/shop?category=${cat.slug}`"
        :image="cat.image"
        :name="cat.name"
      />
    </div>

    <div v-else class="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
      <Icon name="lucide:folder-open" class="h-12 w-12 mb-4 opacity-30" />
      <p class="text-lg font-medium">Категорії поки що відсутні</p>
      <p class="text-sm mt-1">Зайдіть пізніше — незабаром тут з'являться товари</p>
    </div>
  </CommonContainer>
</template>
