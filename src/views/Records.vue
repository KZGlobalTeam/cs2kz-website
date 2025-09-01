<script setup lang="ts">
import { useRecords } from '@/composables/records'

const { records, total, loading, query, incrementRecords } = useRecords()
</script>

<template>
  <div class="mx-auto px-2 lg:px-10 py-2 lg:py-4 flex flex-col h-[calc(100dvh-(--spacing(12)))]">
    <RecordQuery v-model:query="query" detailed />

    <div class="mt-4 lg:mt-6"></div>

    <RecordTable
      v-model:query="query"
      type="records"
      :loading="loading"
      :total="total"
      :records="records"
      @intersect="incrementRecords"
      class="flex-1"
    />
  </div>
</template>
