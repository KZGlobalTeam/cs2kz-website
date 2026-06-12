<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { api } from '@/utils'
import { saveLocale } from '@/utils/locale'
import AppLogo from './AppLogo.vue'
import Cookies from 'universal-cookie'

const localeMap = {
  en: 'English',
  zh: '简体中文',
}

const cookies = new Cookies(null, { path: '/' })

const playerStore = usePlayerStore()

const route = useRoute()

const { locale, availableLocales } = useI18n()

const localeOptions = computed(() => {
  return availableLocales
    .filter((l) => l !== locale.value)
    .map((l) => ({
      value: l,
      label: localeMap[l as keyof typeof localeMap],
      click: () => {
        locale.value = l
        saveLocale(l)
      },
    })) as { value: string; label: string; click: () => void }[]
})

const openNavigation = ref(false)

const navigation = [
  {
    localePath: 'nav.home',
    path: '/',
  },
  {
    localePath: 'nav.leaderboards',
    path: '/leaderboards',
  },
  {
    localePath: 'nav.records',
    path: '/records',
  },
  {
    localePath: 'nav.maps',
    path: '/maps',
  },
]

function signIn() {
  const url = `${import.meta.env.VITE_API_URL}/auth/web/login?redirect_to=${location.origin}`
  location.href = url
}

function signOut() {
  playerStore.player = null
  cookies.remove('kz-player')
  api.get('/auth/web/logout')
}
</script>
<template>
  <div class="h-12 border-b border-gray-700 w-full bg-gray-900">
    <header class="h-full xl:max-w-7xl px-2 md:px-6 lg:mx-auto grid grid-cols-2 lg:grid-cols-3 items-center">
      <div class="flex items-center">
        <AppLogo />
      </div>

      <!-- navigation -->
      <nav class="hidden lg:flex justify-center">
        <ol class="text-[1.125rem] flex gap-4 leading-5">
          <li v-for="item in navigation" :key="item.path">
            <UButton :variant="route.path === item.path ? 'solid' : 'ghost'" :to="item.path">
              {{ $t(item.localePath) }}
            </UButton>
          </li>
        </ol>
      </nav>

      <div class="flex justify-end items-center gap-1">
        <ExternalLinks class="hidden lg:block" />

        <!-- switch locale -->
        <UPopover mode="hover">
          <UButton variant="ghost" square>
            <IconLocales />
          </UButton>
          <template #content>
            <div class="flex flex-col gap-2 p-1">
              <div
                v-for="option in localeOptions"
                :key="option.value"
                class="hover:bg-gray-700 text-sm pl-2 pr-3 py-1 rounded-sm cursor-pointer"
                @click="option.click()"
              >
                {{ option.label }}
              </div>
            </div>
          </template>
        </UPopover>

        <!-- avatar -->
        <UPopover mode="click" v-if="playerStore.player">
          <UButton variant="ghost" square>
            <PlayerAvatar :avatar-url="playerStore.player.avatar_url" :username="playerStore.player.name" />
          </UButton>
          <template #content>
            <div class="flex flex-col gap-1 p-1">
              <div class="hover:bg-gray-700 text-sm pl-2 pr-3 py-1 rounded-sm cursor-pointer">
                <RouterLink :to="`/profile/${playerStore.player!.id}`">{{ $t('nav.profile') }}</RouterLink>
              </div>
              <div @click="signOut" class="hover:bg-gray-700 text-sm pl-2 pr-3 py-1 rounded-sm cursor-pointer">
                {{ $t('nav.signOut') }}
              </div>
            </div>
          </template>
        </UPopover>

        <!-- login -->
        <UButton v-else variant="ghost" square @click="signIn" :ui="{ base: 'cursor-pointer' }">
          <IconSteam />
        </UButton>

        <NavModal v-model="openNavigation" :navigation="navigation" />
      </div>
    </header>
  </div>
</template>
