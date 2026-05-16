import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  site: {
    url: 'https://axinia.com.ua',
    name: 'ПП Аксінья-Маркет',
    description: 'Магазин захисного спорядження — балістичний захист, протигази, бронежилети та інше спорядження',
    defaultLocale: 'uk',
  },

  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    exclude: ['/admin/**', '/sign-in/**', '/checkout'],
  },

  robots: {
    disallow: ['/admin', '/sign-in', '/checkout'],
  },

  modules: [
    '@nuxt/a11y',
    '@nuxt/fonts',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/image',
    '@dargmuesli/nuxt-cookie-control',
    '@clerk/nuxt',
    '@formkit/auto-animate',
    '@pinia/nuxt',
    '@nuxtjs/seo',
    'shadcn-nuxt'
  ],

  shadcn: {
    prefix: '',
    componentDir: './app/components/ui'
  },

  vite: {
    plugins: [tailwindcss()]
  },

  css: ['~/assets/css/main.css', 'vue-sonner/style.css'],

  runtimeConfig: {
    novaPostApiKey: '',
  },

  routeRules: {
    '/admin/**': { appMiddleware: ['admin'] },
    '/_ipx/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/images/**': { headers: { 'cache-control': 'public, max-age=604800' } },
    '/uploads/**': { headers: { 'cache-control': 'public, max-age=604800' } },
  }
})