<script setup lang="ts">
import { navigateTo } from "#app"
const config = useRuntimeConfig()
const { t, locale, locales, setLocale } = useI18n()
const player = usePlayer()

const availableLocales = computed(() => {
  return locales.value
    .filter((i) => i.code !== locale.value)
    .map((locale) => [
      {
        label: locale.name,
        click: () => {
          setLocale(locale.code)
        },
      },
    ]) as { label: string; click: () => void }[][]
})

const openNavigation = ref(false)

const options = computed(() => [
  [
    {
      label: t("nav.signOut"),
      click: signOut,
    },
  ],
])

const navigation = computed(() => {
  const routes = [
    {
      localePath: "nav.records",
      path: "/records",
    },
    {
      localePath: "nav.maps",
      path: "/maps",
    },
    {
      localePath: "nav.servers",
      path: "/servers",
    },
  ]

  if (player.value) {
    routes.splice(2, 0, {
      localePath: "nav.profile",
      path: `/profile/${player.value.id}`,
    })
  }

  return routes
})

function signIn() {
  const url = `${config.public.apiBase}/auth/web/login?redirect_to=${location.origin}`
  navigateTo(url, { external: true })
}

function signOut() {
  player.value = null
  $fetch("/auth/web/logout", {
    baseURL: config.public.apiBase,
    credentials: "include",
  })
}
</script>
<template>
  <div class="h-12 border-b border-gray-700">
    <header
      class="h-full xl:max-w-7xl px-2 md:px-6 lg:mx-auto grid grid-cols-2 lg:grid-cols-3 items-center bg-gray-900"
    >
      <!-- logo -->
      <div class="flex items-center">
        <nuxt-link to="/">
          <app-logo />
        </nuxt-link>
      </div>

      <!-- navigation -->
      <nav class="hidden lg:flex justify-center">
        <ol class="text-[1.125rem] flex gap-4 leading-5">
          <li v-for="item in navigation" :key="item.path">
            <UButton
              variant="ghost"
              :to="item.path"
              :ui="{ font: 'font-medium' }"
              active-class="bg-primary bg-opacity-30"
            >
              {{ $t(item.localePath) }}
            </UButton>
          </li>
        </ol>
      </nav>

      <div class="flex justify-end items-center">
        <ExternalLinks class="hidden lg:block" />

        <!-- switch locale -->
        <UButton variant="ghost" color="gray">
          <UDropdown :items="availableLocales" :popper="{ placement: 'bottom-start' }">
            <IconLocales />
          </UDropdown>
        </UButton>

        <!-- login -->
        <UButton v-if="player" variant="ghost" color="gray" @click="navigateTo(`/profile/${player.id}`)">
          <UDropdown :items="options" mode="hover" :popper="{ placement: 'bottom-start' }">
            <PlayerAvatar :avatar-url="player.avatar_url" :username="player.name" />
          </UDropdown>
        </UButton>

        <UTooltip v-else :text="$t('nav.tooltip.login')">
          <UButton variant="ghost" color="gray" @click="signIn">
            <IconSteam />
          </UButton>
        </UTooltip>

        <UButton square variant="ghost" color="gray" class="lg:hidden" @click="openNavigation = true">
          <IconBars />
        </UButton>
      </div>
    </header>
    <NavModal v-model="openNavigation" :navigation="navigation" />
  </div>
</template>
