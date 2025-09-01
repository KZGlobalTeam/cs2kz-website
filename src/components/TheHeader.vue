<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { api } from '@/utils'
import AppLogo from './AppLogo.vue'

const localeMap = {
  en: 'English',
  zh: '简体中文',
}

const playerStore = usePlayerStore()

const route = useRoute()
const router = useRouter()

const { t, locale, availableLocales } = useI18n()

const localeOptions = computed(() => {
  return availableLocales
    .filter((l) => l !== locale.value)
    .map((l) => ({
      value: l,
      label: localeMap[l as keyof typeof localeMap],
      click: () => {
        locale.value = l
      },
    })) as { value: string; label: string; click: () => void }[]
})

const openNavigation = ref(false)

const profileOptions = computed(() => [
  {
    label: t('nav.profile'),
    onSelect: () => router.push(`/profile/${playerStore.player!.id}`),
  },
  {
    label: t('nav.signOut'),
    onSelect: signOut,
  },
])

const navigation = [
  {
    localePath: 'nav.records',
    path: '/records',
  },
  {
    localePath: 'nav.maps',
    path: '/maps',
  },
  {
    localePath: 'nav.servers',
    path: '/servers',
  },
]

function signIn() {
  const url = `${import.meta.env.VITE_API_URL}/auth/web/login?redirect_to=${location.origin}`
  location.href = url
}

function signOut() {
  playerStore.player = null
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

      <div class="flex justify-end items-center gap-2">
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
                class="hover:bg-gray-700 pl-2 pr-3 py-1.5 rounded-sm cursor-pointer"
                @click="locale = option.value"
              >
                {{ option.label }}
              </div>
            </div>
          </template>
        </UPopover>

        <!-- avatar -->
        <UPopover mode="hover" v-if="playerStore.player">
          <UButton variant="ghost" square>
            <PlayerAvatar :avatar-url="playerStore.player.avatar_url" :username="playerStore.player.name" />
          </UButton>
          <template #content>
            <div class="flex flex-col gap-1 p-1">
              <div
                v-for="option in profileOptions"
                :key="option.label"
                @click="option.onSelect"
                class="hover:bg-gray-700 pl-2 pr-3 py-1.5 rounded-sm cursor-pointer"
              >
                {{ option.label }}
              </div>
            </div>
          </template>
        </UPopover>

        <!-- login -->
        <UTooltip v-else :text="$t('nav.tooltip.login')">
          <UButton variant="ghost" @click="signIn">
            <IconSteam />
          </UButton>
        </UTooltip>

        <NavModal v-model="openNavigation" :navigation="navigation" />
      </div>
    </header>
  </div>
</template>
