<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRecords } from '@/composables/records'

const route = useRoute()

const { records, loading, total, query, incrementRecords, resetQuery } = useRecords({
  player: route.params.steamId as string,
})

watch(
  () => route.params.steamId,
  (steamId) => {
    query.player = steamId as string
  },
)
</script>

<template>
  <div>
    <p class="text-3xl text-gray-300 font-semibold mb-2">{{ $t('profile.runs.title') }}</p>

    <div class="flex flex-wrap gap-3 text-gray-300 border border-gray-800 rounded-md p-3 mb-2">
      <RecordQuery
        type="profile-runs"
        v-model:query="query"
        @reset-query="() => resetQuery({ player: route.params.steamId as string })"
      />
    </div>

    <RecordTable
      v-model:query="query"
      type="profile-runs"
      :loading="loading"
      :total="total"
      :records="records"
      @intersect="incrementRecords"
    />
  </div>
</template>
