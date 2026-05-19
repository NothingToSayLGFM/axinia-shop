export default defineNuxtPlugin({
  name: 'clerk-lazy',
  enforce: 'pre',
  setup(nuxtApp) {
    const route = useRoute()
    const router = useRouter()

    const needsClerk = (path: string) =>
      path.startsWith('/admin') || path.startsWith('/sign-in')

    // Pages that need Clerk — let @clerk/nuxt handle normally
    if (needsClerk(route.path)) return

    // Intercept vueApp.use() to skip Clerk installation on public pages
    const app = nuxtApp.vueApp
    const originalUse = app.use.bind(app)
    ;(app as any).use = (plugin: any, ...args: any[]) => {
      if (args[0]?.sdkMetadata?.name === '@clerk/nuxt') {
        return app
      }
      return originalUse(plugin, ...args)
    }

    // When SPA-navigating to a Clerk-protected route, force a full reload
    // so Clerk can initialize properly on the new page
    router.beforeEach((to) => {
      if (needsClerk(to.path)) {
        window.location.href = to.fullPath
        return false
      }
    })
  },
})
