<script setup lang="ts">
useSeoMeta({
  title: 'Засоби індивідуального захисту — інтернет-магазин',
  description: 'Протигази, респіратори, захисні костюми, газоаналізатори, фільтри, засоби тактичної медицини, захист голови та слуху. Доставка по Україні.',
  ogType: 'website',
  ogImage: '/images/logo.webp',
  twitterCard: 'summary_large_image',
})

useSchemaOrg([
  defineOrganization({
    name: 'Аксінья-Маркет',
    url: 'https://axinia.com.ua',
    logo: 'https://axinia.com.ua/images/logo.webp',
    telephone: '+380675303930',
    email: 'axinia-market@ukr.net',
  }),
  defineWebSite({
    name: 'Аксінья-Маркет',
    description: 'Магазин засобів індивідуального захисту',
  }),
])
</script>

<template>
  <section class="py-16 md:py-24">
    <HomeHero />
  </section>

  <section class="py-16 md:py-20">
    <HomeCategories />
  </section>

  <section class="py-16 md:py-20">
    <HomeHits />
  </section>
</template>
