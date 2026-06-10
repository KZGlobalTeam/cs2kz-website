<script setup lang="ts">
import type { RunningServer, ServerQuery } from '@/types'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  server: RunningServer
  query: ServerQuery
}>()

const toast = useToast()
const { t } = useI18n()

async function copyServerIp() {
  await navigator.clipboard.writeText(`connect ${props.server.host}:${props.server.port}`)
  toast.add({
    title: t('servers.toast.ipCopied'),
    color: 'success',
    progress: false,
    duration: 2000,
  })
}
</script>

<template>
  <div class="rounded-md ring-2 ring-gray-700">
    <TheImage
      class="w-64 h-36 rounded-tl-md rounded-tr-md"
      :src="
        server.current_map.isGlobal
          ? `https://github.com/kzglobalteam/cs2kz-images/raw/public/webp/medium/${server.current_map.name}/1.webp`
          : `https://github.com/vap222222/nonglobalmaps/raw/main/${server.current_map.name}.jpg`
      "
      alt="Map Image"
    ></TheImage>

    <div class="text-sm text-muted p-2">
      <div class="flex items-center gap-1">
        <UTooltip v-if="server.country" :text="server.country.name" :content="{ side: 'top' }">
          <img
            class="w-5 h-auto"
            alt="Country Flag"
            :src="`https://purecatamphetamine.github.io/country-flag-icons/3x2/${server.country.code.toUpperCase()}.svg`"
          />
        </UTooltip>
        <UTooltip :text="server.name" :content="{ side: 'top' }">
          <p class="italic max-w-54 truncate">{{ server.name }}</p>
        </UTooltip>
      </div>

      <div class="mt-1 flex items-center gap-1">
        <RouterLink
          v-if="server.current_map.isGlobal"
          class="text-base font-semibold text-slate-300 hover:text-slate-200"
          :to="`/maps/${server.current_map.name}`"
          >{{ server.current_map.name }}</RouterLink
        >
        <span v-else class="max-w-38 block truncate text-base font-semibold text-slate-300">{{
          server.current_map.name
        }}</span>

        <span v-if="!server.current_map.isGlobal" class="px-1 text-xs rounded-sm text-yellow-400 bg-yellow-800">
          {{ $t('servers.nonGlobal') }}
        </span>
        <span v-else class="px-1 text-xs rounded-sm text-green-400 bg-green-800">
          {{ $t('servers.global') }}
        </span>
      </div>

      <div class="mt-1 flex items-center justify-between">
        <span>{{ server.num_players }} / {{ server.max_players }}</span>
        <div class="flex items-center gap-1">
          <IconAdmin class="mt-0.5" />
          <RouterLink
            class="max-w-20 truncate text-cyan-600 whitespace-nowrap hover:text-cyan-400"
            :to="`/profile/${server.owner.id}`"
          >
            {{ server.owner.name }}
          </RouterLink>
        </div>

        <div class="flex items-center">
          <UButton size="xs" variant="ghost" square class="cursor-pointer" @click="copyServerIp">
            <IconCopy />
          </UButton>
          <UButton
            size="xs"
            variant="ghost"
            square
            :to="`steam://rungameid/730//+connect ${server.host}:${server.port}`"
            target="_blank"
          >
            <IconConnect />
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
