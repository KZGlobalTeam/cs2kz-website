<script setup lang="ts">
import { reactive, computed, toRef, watch } from 'vue'
import { useRatingLeaderboard } from '@/composables/rating-leaderboard'
import { useWRsLeaderboard } from '@/composables/wrs-leaderboard'
import { useRecords } from '@/composables/records'
import {
  getQueryValue,
  parseBooleanQueryValue,
  readQueryState,
  serializeBooleanQueryValue,
  syncQueryState,
} from '@/composables/query-state'
import type { QueryStateConfig } from '@/composables/query-state'
import type { LeaderboardQuery, RecordQuery } from '@/types'
import { useHead } from '@unhead/vue'
import { useRoute } from 'vue-router'

interface LeaderboardState {
  rankedOnly: boolean
}

const ratingQueryConfig = {
  offset: {
    name: 'page',
    defaultValue: 0,
    parse: (value) => {
      const page = Number(getQueryValue(value))
      return Number.isInteger(page) && page > 0 ? (page - 1) * 50 : 0
    },
    serialize: (value) => (Math.floor(value / 50) + 1).toString(),
  },
} satisfies QueryStateConfig<LeaderboardQuery>

const playerQueryConfig = {
  player: {
    name: 'wrPlayer',
    defaultValue: '',
    parse: (value) => getQueryValue(value) ?? '',
    serialize: (value) => value,
  },
  sort_by: {
    name: 'wrSortBy',
    defaultValue: 'submission-date',
    parse: (value) => {
      const sortBy = getQueryValue(value)
      return sortBy === 'time' || sortBy === 'submission-date' ? sortBy : undefined
    },
    serialize: (value) => value ?? 'none',
  },
  sort_order: {
    name: 'wrSortOrder',
    defaultValue: 'descending',
    parse: (value) => {
      const sortOrder = getQueryValue(value)
      return sortOrder === 'ascending' || sortOrder === 'descending' ? sortOrder : undefined
    },
    serialize: (value) => value ?? 'none',
  },
} satisfies QueryStateConfig<RecordQuery>

const leaderboardStateConfig = {
  rankedOnly: {
    name: 'ranked',
    defaultValue: true,
    parse: (value) => parseBooleanQueryValue(value, true),
    serialize: serializeBooleanQueryValue,
  },
} satisfies QueryStateConfig<LeaderboardState>

useHead({
  title: 'Leaderboards - CS2KZ',
  meta: [
    {
      name: 'description',
      content:
        'Compare CS2KZ player rankings, rating leaderboards, and world record leaders across the latest competitive stats.',
    },
    {
      property: 'og:title',
      content: 'Leaderboards - CS2KZ',
    },
    {
      property: 'og:description',
      content:
        'Compare CS2KZ player rankings, rating leaderboards, and world record leaders across the latest competitive stats.',
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:site_name',
      content: 'CS2KZ',
    },
  ],
})

const route = useRoute()
const leaderboardState = reactive<LeaderboardState>({
  rankedOnly: true,
  ...readQueryState<LeaderboardState>(route.query, leaderboardStateConfig),
})
const rankedOnly = toRef(leaderboardState, 'rankedOnly')
const initialRatingQuery = readQueryState<LeaderboardQuery>(route.query, ratingQueryConfig)
const initialPlayerQuery = readQueryState<RecordQuery>(route.query, playerQueryConfig)

const {
  leaderboard: raingLeaderboard,
  loading: ratingLoading,
  total: ratingTotal,
  query: ratingQuery,
} = useRatingLeaderboard(initialRatingQuery)
const { leaderboard: wrLeaderboard, loading: wrLoading, ranked: wrRanked } = useWRsLeaderboard()

const {
  records: playerRecords,
  loading: playerWrsLoading,
  total: playerWrsTotal,
  query: playerWrsQuery,
} = useRecords({ max_rank: 1, ranked: rankedOnly.value ? true : undefined, ...initialPlayerQuery })

syncQueryState(leaderboardState, leaderboardStateConfig)
syncQueryState(ratingQuery, ratingQueryConfig)
syncQueryState(playerWrsQuery, playerQueryConfig)

const playerWrs = computed({
  get() {
    if (playerWrsQuery.leaderboardType === 'overall') {
      // max_rank=1 and has_teleports=null doesn't guarantee overall wrs
      return playerRecords.value.filter((record) => record.nub_rank === 1)
    } else {
      return playerRecords.value
    }
  },
  set(value) {
    playerRecords.value = value
  },
})

const drawerOpen = computed({
  get: () => playerWrsQuery.player !== '',
  set: (open) => {
    if (!open) {
      playerWrsQuery.player = ''
    }
  },
})

watch(rankedOnly, (rankedOnly) => {
  const value = rankedOnly === true ? true : undefined
  wrRanked.value = value
  playerWrsQuery.ranked = value
})

function openDrawer(playerId: string) {
  if (playerWrsQuery.player !== playerId) {
    playerWrs.value = []
    playerWrsQuery.player = playerId
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-2 p-2 lg:p-4 flex flex-col max-h-[calc(100dvh-3rem)]">
    <div class="flex flex-wrap gap-3 justify-between text-gray-300 border border-zinc-800 rounded-md p-3">
      <MainSwitch />
    </div>

    <div class="mt-4 flex-1 min-h-0 grid gap-4 lg:grid-cols-2">
      <div class="border border-zinc-700 rounded-md bg-zinc-950/40 overflow-hidden h-full">
        <div
          class="flex items-center justify-between h-12 px-4 py-2 border-b border-zinc-700 text-lg font-semibold text-gray-100"
        >
          <span>{{ $t('leaderboards.rating.title') }}</span>
          <MainPagination v-model:query="ratingQuery" :total="ratingTotal" />
        </div>

        <div v-if="ratingLoading" class="flex justify-center py-8">
          <IconLoading class="inline" />
        </div>

        <div v-else-if="raingLeaderboard.length > 0" class="px-2 py-1 h-[calc(100%-3rem)] list-wrapper overflow-auto">
          <RatingLeaderboard :leaderboard="raingLeaderboard" :query="ratingQuery" />
        </div>

        <div v-else class="flex justify-center py-8">
          <p class="text-gray-500">
            {{ $t('common.noData') }}
          </p>
        </div>
      </div>

      <div class="border border-zinc-700 rounded-md bg-zinc-950/40 overflow-hidden h-full">
        <div
          class="flex items-center justify-between h-12 px-4 py-2 border-b border-zinc-700 text-lg font-semibold text-gray-100"
        >
          <span>{{ $t('leaderboards.wrs.title') }}</span>
          <UCheckbox v-model="rankedOnly" :label="$t('records.query.rankedOnly')" />
        </div>

        <div v-if="wrLoading" class="flex justify-center py-8">
          <IconLoading class="inline" />
        </div>

        <div v-else-if="wrLeaderboard.length > 0" class="px-2 py-1 h-[calc(100%-3rem)] list-wrapper overflow-auto">
          <WRLeaderboard :leaderboard="wrLeaderboard" @open-drawer="openDrawer" />
        </div>

        <div v-else class="flex justify-center py-8">
          <p class="text-gray-500">
            {{ $t('common.noData') }}
          </p>
        </div>
      </div>
    </div>

    <UDrawer v-model:open="drawerOpen" direction="right" :handle="false">
      <template #content>
        <RecordTable
          v-model:query="playerWrsQuery"
          type="player-wrs"
          :loading="playerWrsLoading"
          :total="playerWrsTotal"
          :records="playerWrs"
        />
      </template>
    </UDrawer>
  </div>
</template>
