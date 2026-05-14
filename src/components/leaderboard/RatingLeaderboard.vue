<script setup lang="ts">
import { computed } from 'vue'
import type { LeaderboardQuery, Player } from '@/types'
import { getRankByRating, seperateThousands } from '@/utils'

const props = defineProps<{
  leaderboard: Player[]
  query: LeaderboardQuery
}>()

const rows = computed(() => {
  return props.leaderboard.map((player, index) => {
    const rating = props.query.mode === 'classic' ? player.ckz_rating : player.vnl_rating
    const [rankName, rankColor] = getRankByRating(rating)

    return {
      player,
      rank: props.query.offset + index + 1,
      rankName,
      rankColor,
      rating,
    }
  })
})
</script>

<template>
  <div>
    <div
      class="grid grid-cols-[40px_1fr_1fr_1fr] gap-3 px-3 py-2 border-b border-gray-700 text-sm font-semibold text-gray-500"
    >
      <span>#</span>
      <span>{{ $t('leaderboards.title.player') }}</span>
      <span>{{ $t('leaderboards.title.rating') }}</span>
      <span>{{ $t('leaderboards.title.title') }}</span>
    </div>

    <ul class="divide-y divide-gray-800">
      <li
        v-for="row in rows"
        :key="row.player.id"
        class="grid grid-cols-[40px_1fr_1fr_1fr] gap-3 px-3 py-2 items-center"
      >
        <span class="text-gray-400">
          {{ row.rank }}
        </span>

        <RouterLink
          :to="`/profile/${row.player.id}`"
          class="truncate text-cyan-500 hover:text-cyan-400 transition-colors"
        >
          {{ row.player.name || $t('common.unknown') }}
        </RouterLink>

        <span class="text-gray-300 font-semibold" :style="{ color: `${row.rankColor}` }">{{
          seperateThousands(row.rating)
        }}</span>

        <div
          :style="{
            color: row.rankColor,
            backgroundColor: `${row.rankColor}20`,
            border: `1px solid ${row.rankColor}`,
          }"
          class="inline-flex justify-center items-center px-1 rounded-sm w-fit"
        >
          {{ row.rankName }}
        </div>
      </li>
    </ul>
  </div>
</template>
