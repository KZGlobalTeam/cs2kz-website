<script setup lang="ts">
import { useRecords } from '@/composables/records'

const { records, loading, query } = useRecords({ max_rank: 1 })

function loadRecords() {
  if (records.value.length > 0) {
    query.limit += 30
  }
}
</script>
<template>
  <div class="mx-auto px-2 lg:px-10 py-2 lg:py-4">
    <RecordQuery v-model:query="query" detailed />
    <InfiniteScroller :has-data="records.length > 0" :loading="loading" @infinite="loadRecords">
      <RecordTable
        v-model:sort-by="query.sort_by"
        v-model:sort-order="query.sort_order"
        class="mt-4 lg:mt-6"
        detailed
        :query="query"
        :loading="loading"
        :records="records"
      />
    </InfiniteScroller>
  </div>
</template>
