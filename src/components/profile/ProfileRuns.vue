<script setup lang="ts">
import { watch } from 'vue'
import type { Mode } from '@/types'
import { useRoute } from 'vue-router'
import { useRecords } from '@/composables/records'

const props = defineProps<{
  mode: Mode
}>()

const route = useRoute()

const { records, loading, query, incrementRecords } = useRecords({ player: route.params.steamId as string })

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

    <UCard>
      <RecordTable
        v-model:sort-by="query.sort_by"
        v-model:sort-order="query.sort_order"
        :query="query"
        :loading="loading"
        :records="records"
        @intersect="incrementRecords"
      />
    </UCard>
  </div>
</template>
