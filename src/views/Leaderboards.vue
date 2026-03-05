<script setup lang="ts">
import { useLeaderboard } from '@/composables/leaderboard'

const { leaderboard, loading, total, query } = useLeaderboard()
</script>

<template>
  <div class="max-w-2xl mx-auto px-2 p-2 lg:p-4 flex flex-col max-h-[calc(100dvh-3rem)]">
    <div class="flex flex-wrap gap-3 justify-between text-gray-300 border border-gray-800 rounded-md p-3">
      <MainSwitch mode-only />
      <MainPagination v-model:query="query" :total="total" />
    </div>

    <div v-if="loading" class="mt-4 flex justify-center">
      <IconLoading class="inline" />
    </div>

    <div
      v-else-if="leaderboard.length > 0"
      class="mt-4 px-2 py-1 flex-1 overflow-auto border border-gray-700 rounded-md"
    >
      <Leaderboard :leaderboard="leaderboard" :query="query" />
    </div>

    <div v-else class="mt-4 flex justify-center">
      <p class="text-gray-500">
        {{ $t('common.noData') }}
      </p>
    </div>
  </div>
</template>
