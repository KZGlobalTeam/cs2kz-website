<script setup lang="ts">
import { computed } from 'vue'
import type { LeaderboardQuery, PlayerWithAvatar } from '@/types'
import { getTitleByRating, seperateThousands } from '@/utils'

const props = defineProps<{
  leaderboard: PlayerWithAvatar[]
  query: LeaderboardQuery
}>()

const rows = computed(() => {
  return props.leaderboard.map((player, index) => {
    const rating = props.query.mode === 'classic' ? player.ckz_rating : player.vnl_rating
    const [titleName, titleColor] = getTitleByRating(rating)

    return {
      player,
      rank: props.query.offset + index + 1,
      titleName,
      titleColor,
      rating,
    }
  })
})
</script>

<template>
  <div>
    <div
      class="grid grid-cols-[40px_1fr_60px_60px] gap-3 px-3 py-2 border-b border-zinc-700 text-sm font-semibold text-gray-500"
    >
      <span>#</span>
      <span>{{ $t('leaderboards.title.player') }}</span>
      <span>{{ $t('leaderboards.title.rating') }}</span>
      <span>{{ $t('leaderboards.title.title') }}</span>
    </div>

    <ul class="divide-y divide-zinc-800">
      <li
        v-for="row in rows"
        :key="row.player.id"
        class="grid grid-cols-[40px_1fr_60px_60px] h-12 gap-3 px-3 py-2 items-center"
      >
        <span class="text-gray-400">
          {{ row.rank }}
        </span>

        <RouterLink
          :to="`/profile/${row.player.id}`"
          class="flex items-center gap-2 min-w-0 text-cyan-500 hover:text-cyan-400 transition-colors"
        >
          <UAvatar v-if="row.player.playerAvatar" size="sm" :src="row.player.playerAvatar" :alt="row.player.name" />
          <span class="truncate">{{ row.player.name || $t('common.unknown') }}</span>
        </RouterLink>

        <span class="text-gray-300 font-semibold" :style="{ color: `${row.titleColor}` }">{{
          seperateThousands(row.rating)
        }}</span>

        <div
          :style="{
            color: row.titleColor,
            backgroundColor: `${row.titleColor}20`,
            border: `1px solid ${row.titleColor}`,
          }"
          class="inline-flex justify-center items-center px-1 rounded-sm w-fit"
        >
          {{ row.titleName }}
        </div>
      </li>
    </ul>
  </div>
</template>
