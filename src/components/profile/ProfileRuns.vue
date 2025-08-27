<script setup lang="ts">
import { watch } from 'vue'
import type { Mode } from '@/types'
import { useRoute } from 'vue-router'
import { useRecords } from '@/composables/records'

const props = defineProps<{
  mode: Mode
}>()

const route = useRoute()

const { records, loading, total, query, incrementRecords } = useRecords({ player: route.params.steamId as string })

watch(
  () => props.mode,
  (mode) => {
    query.mode = mode
  },
)
</script>

<template>
  <div>
    <p class="text-3xl text-gray-300 font-semibold mb-2">{{ $t('profile.runs.title') }}</p>

    <RecordQuery v-model:query="query" />

    <RecordTable
      v-model:sort-by="query.sort_by"
      v-model:sort-order="query.sort_order"
      type="profile-runs"
      :loading="loading"
      :total="total"
      :query="query"
      :records="records"
      @intersect="incrementRecords"
      class="max-h-96 xl:max-h-120"
    />
  </div>
</template>
