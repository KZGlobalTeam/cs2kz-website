<script setup lang="ts">
import { resolveComponent } from 'vue'

const IconDiscord = resolveComponent('IconDiscord')
const IconGithub = resolveComponent('IconGithub')
const IconBook = resolveComponent('IconBook')
const IconDashboard = resolveComponent('IconDashboard')

const items = [
  {
    label: 'Discord',
    icon: IconDiscord,
    href: 'https://www.discord.gg/csgokz',
  },
  {
    label: 'GitHub',
    icon: IconGithub,
    href: 'https://github.com/KZGlobalTeam',
  },
  {
    label: 'Docs',
    icon: IconBook,
    href: 'https://docs.cs2kz.org',
  },
  {
    label: 'Dashboard',
    icon: IconDashboard,
    href: 'https://dashboard.cs2kz.org',
  },
]

function goToLink(href: string) {
  window.open(href, '_blank')
}
</script>

<template>
  <UPopover mode="hover">
    <div class="cursor-default">
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
