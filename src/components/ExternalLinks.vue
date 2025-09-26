<script setup lang="ts">
import { resolveComponent, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const IconDiscord = resolveComponent('IconDiscord')
const IconGithub = resolveComponent('IconGithub')
const IconBook = resolveComponent('IconBook')
const IconDashboard = resolveComponent('IconDashboard')

const { t } = useI18n()

const items = computed(() => [
  {
    label: t('nav.tooltip.discord'),
    icon: IconDiscord,
    href: 'https://www.discord.gg/csgokz',
  },
  {
    label: t('nav.tooltip.github'),
    icon: IconGithub,
    href: 'https://github.com/KZGlobalTeam',
  },
  {
    label: t('nav.tooltip.docs'),
    icon: IconBook,
    href: 'https://docs.cs2kz.org',
  },
  {
    label: t('nav.tooltip.dashboard'),
    icon: IconDashboard,
    href: 'https://dashboard.cs2kz.org',
  },
])

function goToLink(href: string) {
  window.open(href, '_blank')
}
</script>

<template>
  <UPopover mode="click">
    <div class="cursor-pointer">
      <span>{{ $t('nav.links') }}</span> <IconDown class="inline" />
    </div>
    <template #content>
      <div class="flex flex-col gap-1 p-1">
        <div
          v-for="item in items"
          :key="item.label"
          @click="goToLink(item.href)"
          class="hover:bg-gray-700 flex items-center pl-2 pr-3 py-1 rounded-sm cursor-pointer"
        >
          <component :is="item.icon" class="w-4 h-4 mr-2" />
          <span class="text-sm">{{ item.label }}</span>
        </div>
      </div>
    </template>
  </UPopover>
</template>
