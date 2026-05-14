<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card v-for="stat in stats" :key="stat.label">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle as="h2" class="text-sm font-medium text-muted-foreground">{{ stat.label }}</CardTitle>
          <Icon :name="stat.icon" class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-bold">{{ stat.value }}</p>
        </CardContent>
      </Card>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle as="h2" class="text-base">Швидкі дії</CardTitle>
        </CardHeader>
        <CardContent class="space-y-2">
          <Button variant="outline" class="w-full justify-start gap-2" as-child>
            <NuxtLink to="/admin/products">
              <Icon name="lucide:plus" class="h-4 w-4" />
              Додати товар
            </NuxtLink>
          </Button>
          <Button variant="outline" class="w-full justify-start gap-2" as-child>
            <NuxtLink to="/admin/categories">
              <Icon name="lucide:plus" class="h-4 w-4" />
              Додати категорію
            </NuxtLink>
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { data: categories } = await useFetch('/api/categories')
const { data: products } = await useFetch('/api/products')

const stats = computed(() => [
  { label: 'Категорій', value: categories.value?.length ?? 0, icon: 'lucide:folder' },
  { label: 'Товарів', value: products.value?.length ?? 0, icon: 'lucide:package' },
  { label: 'В наявності', value: products.value?.filter((p: any) => p.inStock).length ?? 0, icon: 'lucide:check-circle' },
])
</script>
