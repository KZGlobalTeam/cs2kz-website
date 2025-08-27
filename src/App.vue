<script setup lang="ts">
import { RouterView } from 'vue-router'
import Cookies from 'universal-cookie'
import { usePlayerStore } from './stores/player'
import { api } from './utils'
import TheHeader from './components/TheHeader.vue'
import { useColorMode } from '@vueuse/core'

const playerStore = usePlayerStore()

const cookies = new Cookies(null, { path: '/' })

const colorMode = useColorMode()
colorMode.value = 'dark'

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
  </UApp>
</template>
