import tailwindcss from '@tailwindcss/vite'

const isProd = process.env.NODE_ENV === 'production'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  site: {
    url: 'https://axinia.com.ua',
    name: 'ПП Аксінья-Маркет',
    description: 'Магазин засобів індивідуального захисту — протигази, респіратори, захисні костюми, газоаналізатори, засоби тактичної медицини. Безкоштовна доставка по Україні.',
    defaultLocale: 'uk',
    indexable: true,
  },

  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    exclude: ['/admin/**', '/sign-in/**', '/checkout'],
  },

  robots: {
    disallow: ['/admin', '/sign-in', '/checkout'],
  },

  seo: {
    redirectToCanonicalSiteUrl: false,
  },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicons/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicons/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicons/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicons/apple-touch-icon.png' },
        { rel: 'manifest', href: '/favicons/site.webmanifest' },
      ]
    }
  },

  modules: [
    '@nuxtjs/color-mode',
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

  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: '',
  },

  cookieControl: {
    locales: ['uk'],
    cookies: {
      necessary: [
        {
          id: 'necessary',
          name: { uk: 'Необхідні' },
          description: { uk: 'Файли cookie для базової роботи сайту та кошика.' },
          targetCookieIds: ['__session', '__client_uat'],
        },
      ],
      optional: [],
    },
    colors: {
      barBackground: '#09090b',
      barTextColor: '#fafafa',
      barButtonColor: '#fafafa',
      barButtonBackground: '#18181b',
      barButtonHoverColor: '#fafafa',
      barButtonHoverBackground: '#27272a',
      modalBackground: '#ffffff',
      modalTextColor: '#09090b',
      modalButtonColor: '#fafafa',
      modalButtonBackground: '#09090b',
      modalButtonHoverColor: '#fafafa',
      modalButtonHoverBackground: '#18181b',
      modalOverlay: '#09090b',
      modalOverlayOpacity: 0.5,
      checkboxActiveBackground: '#09090b',
      checkboxInactiveBackground: '#e4e4e7',
      checkboxDisabledBackground: '#d4d4d8',
      checkboxActiveCircleBackground: '#ffffff',
      checkboxInactiveCircleBackground: '#ffffff',
      checkboxDisabledCircleBackground: '#a1a1aa',
      controlButtonBackground: '#84D114',
      controlButtonIconColor: '#ffffff',
      controlButtonHoverBackground: '#6faf0f',
    },
  },

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
    resendApiKey: '',
    shopEmail: '',
  },

  nitro: {
    compressPublicAssets: true,
  },

  routeRules: {
    // Rendering strategies (ISR only in production)
    '/': isProd ? { isr: 60 } : {},
    '/shop/**': isProd ? { isr: 300 } : {},
    '/about': isProd ? { isr: 300 } : {},
    '/delivery': isProd ? { isr: 300 } : {},
    '/payment': isProd ? { isr: 300 } : {},
    '/warranty': isProd ? { isr: 300 } : {},
    '/contact': isProd ? { isr: 300 } : {},
    '/discount': isProd ? { isr: 300 } : {},
    '/terms': isProd ? { isr: 300 } : {},
    '/sitemap': isProd ? { isr: 300 } : {},
    '/vidhuky-pro-mahazyn': isProd ? { isr: 300 } : {},

    // Auth & admin
    '/admin/**': { appMiddleware: ['admin'] },

    // Static asset caching
    '/_ipx/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/images/**': { headers: { 'cache-control': 'public, max-age=604800' } },
    '/uploads/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
  }
})