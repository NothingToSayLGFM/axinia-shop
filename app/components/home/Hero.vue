<script setup lang="ts">
const phoneHref = 'tel:+380675303930'

const advantages = [
  {
    icon: 'lucide:truck',
    label: 'Безкоштовна доставка',
    description: 'Безкоштовна доставка по всій Україні',
    to: '/payment',
  },
  {
    icon: 'lucide:tag',
    label: 'Гнучка система знижок',
    description: 'Гнучка система знижок для постійних клієнтів та гурту',
    to: '/discount',
  },
  {
    icon: 'lucide:headphones',
    label: 'Постійна підтримка',
    description: 'Консультації 24/7, допомога у виборі',
    to: '/contact',
  },
]
</script>

<template>
  <CommonContainer>

    <div class="flex flex-col items-center gap-10 lg:flex-row lg:gap-16">
      <div class="flex flex-col gap-8 lg:flex-1">
        <h1 class="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Обирайте найкращі протигази в Україні
        </h1>
        <a
          :href="phoneHref"
          class="inline-flex w-fit items-center gap-3 rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-md transition-opacity hover:opacity-90 cursor-pointer"
        >
          <Icon name="lucide:phone" class="h-5 w-5 shrink-0" />
          Замовити
        </a>
      </div>

      <div class="hidden sm:flex shrink-0 items-center justify-center lg:flex-1">
        <div class="relative flex h-72 w-72 items-center justify-center rounded-full bg-muted sm:h-96 sm:w-96">
          <NuxtImg
            src="/images/hero.webp"
            alt="Протигаз"
            format="webp"
            quality="55"
            width="256"
            sizes="(max-width: 640px) 256px, 320px"
            preload
            fetchpriority="high"
            class="absolute inset-0 z-10 m-auto h-64 w-64 object-contain object-center drop-shadow-xl sm:h-80 sm:w-80"
          />
        </div>
      </div>
    </div>

    <div class="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <NuxtLink
        v-for="item in advantages"
        :key="item.label"
        :to="item.to"
        class="group flex flex-col items-center gap-3 rounded-xl border bg-card px-6 py-7 text-center shadow-sm cursor-pointer transition-shadow hover:shadow-md"
      >
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110">
          <Icon :name="item.icon" class="h-6 w-6" />
        </div>
        <span class="text-base font-bold text-foreground">{{ item.label }}</span>
        <span class="text-sm text-muted-foreground">{{ item.description }}</span>
      </NuxtLink>
    </div>

  </CommonContainer>
</template>

