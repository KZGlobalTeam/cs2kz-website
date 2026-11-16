<script setup lang="ts">
import type { LeaderboardType, Mode } from '@/types'
import { formatTime, uuidToLocal } from '@/utils'
import { getPlayerAvatar } from '@/composables/steam-avatars'
import { useWrProgression } from '@/composables/wr-progression'

const props = defineProps<{
  map: string
  course: string
  mode: Mode
  leaderboardType: LeaderboardType
  ranked?: boolean
}>()

const { loading, progression, processed, total } = useWrProgression({
  map: () => props.map,
  course: () => props.course,
  mode: () => props.mode,
  leaderboardType: () => props.leaderboardType,
  ranked: () => props.ranked,
})

function formatGain(seconds: number) {
  return seconds.toFixed(3).padStart(6, '0')
}
</script>

<template>
  <div class="rounded-md border border-zinc-700/60 bg-zinc-900/60 p-2">
    <p class="font-medium text-gray-200">{{ $t('map.wrProgression') }}</p>

    <div v-if="loading" class="flex flex-wrap items-center justify-center gap-2 py-8 text-gray-400">
      <IconLoading class="inline" />
      <span>{{ $t('map.wrProgressionLoading') }}</span>
      <span v-if="total > 0" class="text-xs text-gray-500">{{ processed }} / {{ total }}</span>
    </div>

    <div v-else-if="progression.length === 0" class="flex justify-center py-8">
      <p class="text-gray-500">{{ $t('map.wrProgressionEmpty') }}</p>
    </div>

    <div v-else class="list-wrapper mt-3 overflow-x-auto pb-1">
      <ol class="flex min-w-max py-1" :aria-label="$t('map.wrProgression')">
        <li
          v-for="(record, index) in progression"
          :key="record.id"
          class="relative flex w-40 shrink-0 flex-col items-center px-1 text-center"
        >
          <!-- timeline line, connecting this node to the next (older) one -->
          <span
            v-if="index < progression.length - 1"
            class="absolute left-1/2 top-5 h-0.5 w-full bg-zinc-700"
            aria-hidden="true"
          />

          <div class="relative z-10 rounded-full bg-zinc-900 p-0.5 ring-1 ring-zinc-700">
            <UAvatar :src="getPlayerAvatar(record.player.id)" :alt="record.player.name" size="md" />
          </div>

          <span class="mt-1.5 text-[11px] leading-3 text-gray-500">{{ uuidToLocal(record.id, true) }}</span>

          <RouterLink
            :to="`/profile/${record.player.id}`"
            class="mt-1 w-full truncate text-sm font-semibold"
            :class="index === 0 ? 'text-yellow-400 hover:text-yellow-300' : 'text-cyan-600 hover:text-cyan-400'"
            :title="record.player.name"
          >
            {{ record.player.name || $t('common.unknown') }}
          </RouterLink>

          <span class="text-sm whitespace-nowrap text-gray-200">{{ formatTime(record.time) }}</span>

          <span v-if="record.timeImproved > 0" class="text-xs font-semibold text-green-400">
            (-{{ formatTime(record.timeImproved) }})
          </span>
          <span v-else class="text-xs text-gray-500">{{ $t('map.wrProgressionFirst') }}</span>
        </li>
      </ol>
    </div>
  </div>
</template>
