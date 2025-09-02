<script setup lang="ts">
import { watch } from 'vue'
import type { Mode } from '@/types'
import { useRoute } from 'vue-router'
import { useRecords } from '@/composables/records'

const props = defineProps<{
  mode: Mode
  pro: boolean
}>()

const route = useRoute()

const { records, loading, total, query, incrementRecords } = useRecords({ player: route.params.steamId as string })

watch([() => props.mode, () => props.pro], ([m, p]) => {
  query.mode = m
  query.pro = p
})
</script>

<template>
  <div>
    <p class="text-3xl text-gray-300 font-semibold mb-2">{{ $t('profile.runs.title') }}</p>

    <div class="flex flex-wrap gap-3 text-gray-300 border border-gray-800 rounded-md p-3 mb-2">
      <RecordQuery v-model:query="query" />
    </div>

    <RecordTable
      v-model:query="query"
      type="profile-runs"
      :loading="loading"
      :total="total"
      :records="records"
      @intersect="incrementRecords"
      class="max-h-96 xl:max-h-120"
    />
  </div>
</template>
