<script setup lang="ts">
import type { RunningServer, ServerQuery } from '@/types'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { getTierColor, getTierNumber } from '@/utils'

const props = defineProps<{
  server: RunningServer
  query: ServerQuery
}>()

const toast = useToast()
const { t } = useI18n()
const mapTier = computed(() => props.server.current_map.tier)
const mapTierColor = computed(() => (mapTier.value ? getTierColor(mapTier.value) : undefined))
const mapTierNumber = computed(() => (mapTier.value ? getTierNumber(mapTier.value) : undefined))

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
  <div class="rounded-md ring-2 ring-zinc-700">
    <div class="relative">
      <TheImage
        class="w-64 h-36 rounded-tl-md rounded-tr-md"
        :src="
          server.current_map.isGlobal
            ? `https://github.com/kzglobalteam/cs2kz-images/raw/public/webp/medium/${server.current_map.name}/1.webp`
            : `https://github.com/vap222222/nonglobalmaps/raw/main/${server.current_map.name}.jpg`
        "
        alt="Map Image"
      ></TheImage>

      <div
        class="absolute inset-x-0 bottom-0 flex items-end bg-gradient-to-t from-black/85 via-black/45 to-transparent p-2"
      >
        <div class="flex flex-wrap items-center gap-1">
          <RouterLink
            v-if="server.current_map.isGlobal"
            class="max-w-38 truncate text-base font-semibold text-slate-100 hover:text-white"
            :to="`/maps/${server.current_map.name}`"
          >
            {{ server.current_map.name }}
          </RouterLink>
          <span v-else class="max-w-38 truncate text-base font-semibold text-slate-100">
            {{ server.current_map.name }}
          </span>

          <span
            v-if="mapTier && mapTierColor && mapTierNumber"
            class="rounded-sm border px-1 text-xs font-semibold"
            :style="{
              color: mapTierColor,
              backgroundColor: `${mapTierColor}44`,
            }"
          >
            T{{ mapTierNumber }}
          </span>

          <span v-if="!server.current_map.isGlobal" class="px-1 text-xs rounded-sm text-yellow-300 bg-yellow-900/90">
            {{ $t('servers.nonGlobal') }}
          </span>
          <span v-else class="px-1 border text-xs rounded-sm text-green-300 bg-green-900/90">
            {{ $t('servers.global') }}
          </span>
        </div>
      </div>
    </div>

    <div class="text-sm text-muted p-1.5">
      <div class="flex items-center gap-1">
        <UTooltip v-if="server.country" :text="server.country.name" :content="{ side: 'top' }">
          <TheImage
            class="w-5 h-auto"
            alt="Country Flag"
            :src="`https://purecatamphetamine.github.io/country-flag-icons/3x2/${server.country.code.toUpperCase()}.svg`"
          />
        </UTooltip>
        <UTooltip :text="server.name" :content="{ side: 'top' }">
          <p class="italic max-w-54 truncate">{{ server.name }}</p>
        </UTooltip>
      </div>

      <div class="flex items-center justify-between">
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
