<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { RouterView, useRoute } from 'vue-router'
import Cookies from 'universal-cookie'
import { usePlayerStore } from './stores/player'
import { useCourseIndexStore } from './stores/course-index.ts'
import { api } from './utils'
import TheHeader from './components/TheHeader.vue'
import BetaNotice from './components/BetaNotice.vue'
import { useColorMode } from '@vueuse/core'

const playerStore = usePlayerStore()
const courseIndexStore = useCourseIndexStore()

const route = useRoute()

courseIndexStore.buildCourseIndices()

const cookies = new Cookies(null, { path: '/' })

const colorMode = useColorMode()
colorMode.value = 'dark'

useHead(() => ({
  link:
    route.name === 'NotFound'
      ? []
      : [
          {
            rel: 'canonical',
            href: 'https://cs2kz.org' + route.path,
          },
        ],
}))

playerStore.player = cookies.get('kz-player') || null

if (playerStore.player) {
  verifySession()
}

async function verifySession() {
  try {
    await api.get('/auth/web', { withCredentials: true })
    setTimeout(verifySession, 1000 * 25)
    /* eslint-disable */
  } catch (error: any) {
    /* eslint-enable */
    if (error.response && error.response.status === 401) {
      playerStore.player = null
      cookies.remove('kz-player')
    }
  }
}
</script>

<template>
  <UApp>
    <TheHeader />
    <Suspense>
      <RouterView />
    </Suspense>
    <BetaNotice />
  </UApp>
</template>
