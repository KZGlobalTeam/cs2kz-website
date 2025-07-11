<script setup lang="ts">
import { useRecords } from '@/composables/records'

const { records, loading, query, total, incrementRecords } = useRecords()
</script>

<template>
  <div class="mx-auto px-2 lg:px-10 py-2 lg:py-4">
    <RecordQuery v-model:query="query" detailed />
    <InfiniteScroller
      :has-data="records.length > 0"
      :loading="loading"
      :has-more="records.length < total"
      @infinite="incrementRecords"
    >
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
