<script setup lang="ts">
import { resolveComponent, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const IconQQ = resolveComponent('IconQQ')
const IconDiscord = resolveComponent('IconDiscord')
const IconGithub = resolveComponent('IconGithub')
const IconForum = resolveComponent('IconForum')
const IconBook = resolveComponent('IconBook')
const IconDashboard = resolveComponent('IconDashboard')
const IconPhone = resolveComponent('IconPhone')

const { t, locale } = useI18n()

const items = computed(() => [
  locale.value === 'zh' && {
    label: t('nav.tooltip.qq'),
    icon: IconQQ,
    href: 'https://qun.qq.com/universal-share/share?ac=1&authKey=DffST7WGLsQMAe8pKrazYaNhR8dkCHmD4iUjphiKc4AfrZpOzzvtKOpWIJv33alt&busi_data=eyJncm91cENvZGUiOiI4NzAzNDAzNTgiLCJ0b2tlbiI6InlCOE4xdlBoUVlDWm4zamNCNHk3TEN3NXVUOUFWaVgzQmovcUJUTVZ3Sm03eFFQYUVyYVlRR2VTZHhmd3JJMFAiLCJ1aW4iOiIxOTg2MDk3NTE0In0%3D&data=wkdGtDWwk_oyivv3_EWTgR2rMGV0pc5V9OgaPkK85kbZr2bJOfWV_Uk4N_HJMXwbFsluDIBAvrr1U95nXf95wA&svctype=4&tempid=h5_group_info',
  },
  {
    label: t('nav.tooltip.kreedzDiscord'),
    icon: IconDiscord,
    href: 'https://www.discord.gg/csgokz',
  },
  {
    label: t('nav.tooltip.mappingDiscord'),
    icon: IconDiscord,
    href: 'https://discord.gg/V4qXddCKN',
  },
  {
    label: t('nav.tooltip.docs'),
    icon: IconBook,
    href: 'https://docs.cs2kz.org',
  },
  {
    label: t('nav.tooltip.forum'),
    icon: IconForum,
    href: 'https://forum.global-kz.net/',
  },
  {
    label: t('nav.tooltip.github'),
    icon: IconGithub,
    href: 'https://github.com/KZGlobalTeam',
  },
  {
    label: t('nav.tooltip.app'),
    icon: IconPhone,
    href: 'https://play.google.com/store/apps/details?id=com.cs2.cs2kz',
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
          class="hover:bg-zinc-700 flex items-center pl-2 pr-3 py-1 rounded-sm cursor-pointer"
        >
          <component :is="item.icon" class="w-4 h-4 mr-2" />
          <span class="text-sm">{{ item.label }}</span>
        </div>
      </div>
    </template>
  </UPopover>
</template>
