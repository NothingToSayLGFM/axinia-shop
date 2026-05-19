<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()

function clerkDomainFromKey(key: string): string | null {
  try {
    const b64 = key.replace(/^pk_(test|live)_/, '')
    const raw = typeof atob !== 'undefined' ? atob(b64) : Buffer.from(b64, 'base64').toString()
    return raw.replace(/\$$/, '') || null
  } catch {
    return null
  }
}

const publishableKey = runtimeConfig.public.clerk?.publishableKey as string | undefined
const clerkDomain = publishableKey ? clerkDomainFromKey(publishableKey) : null

if (clerkDomain) {
  useHead({
    link: [{ rel: 'preconnect', href: `https://${clerkDomain}`, crossorigin: '' }],
  })
}
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
