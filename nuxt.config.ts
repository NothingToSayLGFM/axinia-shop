import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

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