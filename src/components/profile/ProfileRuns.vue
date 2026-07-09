<script setup lang="ts">
import type { PlayerRecordQuery, Record } from '@/types'

defineProps<{
  records: Record[]
  loading: boolean
}>()

const emits = defineEmits<{
  (e: 'resetQuery'): void
}>()

const query = defineModel<PlayerRecordQuery>('query', { required: true })
</script>

<template>
  <div>
    <!-- title -->
    <p class="text-3xl font-semibold mb-2">
      {{ $t('profile.runs.title') }}
    </p>

    <div class="flex flex-wrap gap-3 text-gray-300 border border-zinc-800 rounded-md p-3 mb-2">
      <PlayerRecordQuery v-model:query="query" @reset-query="emits('resetQuery')" />
    </div>

    <RecordTable v-model:query="query" type="profile-runs" :loading="loading" :records="records" />
  </div>
</template>
