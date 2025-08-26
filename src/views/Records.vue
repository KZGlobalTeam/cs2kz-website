<script setup lang="ts">
import { useRecords } from '@/composables/records'

const { records, loading, query, incrementRecords } = useRecords()
</script>

<template>
  <div class="mx-auto px-2 lg:px-10 py-2 lg:py-4">
    <RecordQuery v-model:query="query" detailed />

    <div class="mt-4 lg:mt-6"></div>

    <UCard>
      <RecordTable
        v-model:sort-by="query.sort_by"
        v-model:sort-order="query.sort_order"
        detailed
        :query="query"
        :loading="loading"
        :records="records"
        @intersect="incrementRecords"
        class="h-96 xl:h-180"
      />
    </UCard>
  </div>
</template>
