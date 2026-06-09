<script setup lang="ts">
import { useRecords } from '@/composables/records'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Records - CS2KZ',
  meta: [
    {
      name: 'description',
      content:
        'Explore CS2KZ world records, filter top runs, and track the fastest times across maps, modes, and courses.',
    },
  ],
})

const { records, total, loading, query, incrementRecords, resetQuery, getRecords } = useRecords(
  { max_rank: 1 },
  { withAvatar: true },
)
</script>

<template>
  <div class="mx-auto p-2 lg:p-4 flex flex-col max-h-[calc(100dvh-3rem)]">
    <div class="flex flex-wrap gap-3 justify-between text-gray-300 border border-gray-800 rounded-md p-3">
      <MainSwitch />

      <RecordQuery
        v-model:query="query"
        :loading="loading"
        @reset-query="resetQuery({ max_rank: 1 })"
        @refresh="getRecords({ offset: 0 })"
      />
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
