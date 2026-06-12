<script setup lang="ts">
import { useRatingLeaderboard } from '@/composables/rating-leaderboard'
import RatingLeaderboard from '@/components/leaderboard/RatingLeaderboard.vue'

const {
  leaderboard: ratingLeaderboard,
  loading: ratingLoading,
  query: ratingQuery,
} = useRatingLeaderboard({
  limit: 20,
  mode: 'classic',
  syncStyleStore: false,
})
</script>

<template>
  <div class="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-gray-700">
    <div v-if="ratingLoading" class="flex items-center justify-center py-8">
      <IconLoading class="inline" />
    </div>

    <div v-else-if="ratingLeaderboard.length > 0" class="list-wrapper min-h-0 flex-1 overflow-auto px-2 py-1">
      <RatingLeaderboard :leaderboard="ratingLeaderboard" :query="ratingQuery" />
    </div>

    <div v-else class="flex justify-center py-8">
      <p class="text-gray-500">{{ $t('common.noData') }}</p>
    </div>
  </div>
</template>
