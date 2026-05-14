<script setup lang="ts">
import { ref } from 'vue'
import { useRatingLeaderboard } from '@/composables/rating-leaderboard'
import { useWRsLeaderboard } from '@/composables/wrs-leaderboard'
import { useRecords } from '@/composables/records'

const {
  leaderboard: raingLeaderboard,
  loading: ratingLoading,
  total: ratingTotal,
  query: ratingQuery,
} = useRatingLeaderboard()
const { leaderboard: wrLeaderboard, loading: wrLoading } = useWRsLeaderboard()

const {
  records: playerWrs,
  loading: playerWrsLoading,
  total: playerWrsTotal,
  query: playerWrsQuery,
} = useRecords({ max_rank: 1 })

const drawerOpen = ref(false)

function openDrawer(playerId: string) {
  playerWrs.value = []
  playerWrsQuery.player = playerId
  drawerOpen.value = true
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-2 p-2 lg:p-4 flex flex-col max-h-[calc(100dvh-3rem)]">
    <div class="flex flex-wrap gap-3 justify-between text-gray-300 border border-gray-800 rounded-md p-3">
      <MainSwitch />
    </div>

    <div class="mt-4 flex-1 min-h-0 grid gap-4 lg:grid-cols-2">
      <div class="border border-gray-700 rounded-md bg-gray-950/40 overflow-hidden h-full">
        <div
          class="flex items-center justify-between h-12 px-4 py-2 border-b border-gray-700 text-lg font-semibold text-gray-100"
        >
          <span>{{ $t('leaderboards.rating.title') }}</span>
          <MainPagination v-model:query="ratingQuery" :total="ratingTotal" />
        </div>

        <div v-if="ratingLoading" class="flex justify-center py-8">
          <IconLoading class="inline" />
        </div>

        <div v-else-if="raingLeaderboard.length > 0" class="px-2 py-1 h-[calc(100%-3rem)] overflow-auto">
          <RatingLeaderboard :leaderboard="raingLeaderboard" :query="ratingQuery" />
        </div>

        <div v-else class="flex justify-center py-8">
          <p class="text-gray-500">
            {{ $t('common.noData') }}
          </p>
        </div>
      </div>

      <div class="border border-gray-700 rounded-md bg-gray-950/40 overflow-hidden h-full">
        <div class="flex h-12 px-4 py-2 border-b border-gray-700 text-lg font-semibold text-gray-100">
          {{ $t('leaderboards.wrs.title') }}
        </div>

        <div v-if="wrLoading" class="flex justify-center py-8">
          <IconLoading class="inline" />
        </div>

        <div v-else-if="wrLeaderboard.length > 0" class="px-2 py-1 h-[calc(100%-3rem)] overflow-auto">
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
