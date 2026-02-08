<script setup lang="ts">
import { useRecords } from '@/composables/records'

const { records, total, loading, query, incrementRecords, resetQuery } = useRecords({ max_rank: 1 })
</script>

<template>
  <div class="mx-auto p-2 lg:p-4 flex flex-col max-h-[calc(100dvh-3rem)]">
    <div class="flex flex-wrap gap-3 justify-between text-gray-300 border border-gray-800 rounded-md p-3">
      <MainSwitch />

      <RecordQuery type="records" v-model:query="query" @reset-query="() => resetQuery({ max_rank: 1 })" />
    </div>

    <RecordTable
      class="flex-1 mt-4"
      v-model:query="query"
      type="records"
      :loading="loading"
      :total="total"
      :records="records"
      @intersect="incrementRecords"
    />
  </div>
</template>
