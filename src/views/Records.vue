<script setup lang="ts">
import { useRecords } from '@/composables/records'

const { records, total, loading, query, incrementRecords } = useRecords()
</script>

<template>
  <div class="mx-auto p-2 lg:p-4 flex flex-col h-[calc(100dvh-(--spacing(12)))]">
    <div class="flex flex-wrap gap-3 justify-between text-gray-300 border border-gray-800 rounded-md p-3">
      <MainSwitch />

      <RecordQuery v-model:query="query" />
    </div>

    <RecordTable
      v-model:query="query"
      type="records"
      :loading="loading"
      :total="total"
      :records="records"
      @intersect="incrementRecords"
      class="flex-1 mt-4"
    />
  </div>
</template>
