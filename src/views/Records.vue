<script setup lang="ts">
import { useRecords } from '@/composables/records'
import { getQueryValue, readQueryState, syncQueryState } from '@/composables/query-state'
import type { QueryStateConfig } from '@/composables/query-state'
import type { RecordQuery } from '@/types'
import { useHead } from '@unhead/vue'
import { useRoute } from 'vue-router'

const maxRanks = [1, 10, 20, 50, 100]
const queryConfig = {
  top: {
    name: 'top',
    defaultValue: true,
    parse: (value) => getQueryValue(value) !== '0',
    serialize: (value) => (value ? '1' : '0'),
  },
  ranked: {
    name: 'ranked',
    defaultValue: true,
    parse: (value) => (getQueryValue(value) === 'all' ? undefined : true),
    serialize: (value) => (value === undefined ? 'all' : '1'),
  },
  max_rank: {
    name: 'maxRank',
    defaultValue: 1,
    parse: (value) => {
      const rawValue = getQueryValue(value)
      if (rawValue === 'all') {
        return undefined
      }

      const rank = Number(rawValue)
      return maxRanks.includes(rank) ? rank : 1
    },
    serialize: (value) => (value === undefined ? 'all' : value.toString()),
  },
  map: {
    name: 'map',
    defaultValue: '',
    parse: (value) => getQueryValue(value) ?? '',
    serialize: (value) => value,
  },
  course: {
    name: 'course',
    defaultValue: '',
    parse: (value) => getQueryValue(value) ?? '',
    serialize: (value) => value,
  },
  player: {
    name: 'player',
    defaultValue: '',
    parse: (value) => getQueryValue(value) ?? '',
    serialize: (value) => value,
  },
  server: {
    name: 'server',
    defaultValue: '',
    parse: (value) => getQueryValue(value) ?? '',
    serialize: (value) => value,
  },
  sort_by: {
    name: 'sortBy',
    defaultValue: 'submission-date',
    parse: (value) => {
      const sortBy = getQueryValue(value)
      return sortBy === 'time' || sortBy === 'submission-date' ? sortBy : undefined
    },
    serialize: (value) => value ?? 'none',
  },
  sort_order: {
    name: 'sortOrder',
    defaultValue: 'descending',
    parse: (value) => {
      const sortOrder = getQueryValue(value)
      return sortOrder === 'ascending' || sortOrder === 'descending' ? sortOrder : undefined
    },
    serialize: (value) => value ?? 'none',
  },
} satisfies QueryStateConfig<RecordQuery>

useHead({
  title: 'Records - CS2KZ',
  meta: [
    {
      name: 'description',
      content:
        'Explore CS2KZ world records, filter top runs, and track the fastest times across maps, modes, and courses.',
    },
    {
      property: 'og:title',
      content: 'Records - CS2KZ',
    },
    {
      property: 'og:description',
      content:
        'Explore CS2KZ world records, filter top runs, and track the fastest times across maps, modes, and courses.',
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:site_name',
      content: 'CS2KZ',
    },
  ],
})

const route = useRoute()
const initialQuery = readQueryState<RecordQuery>(route.query, queryConfig)
const { records, total, loading, query, incrementRecords, resetQuery, getRecords } = useRecords(
  { max_rank: 1, ...initialQuery },
  { withAvatar: true },
)

syncQueryState(query, queryConfig)
</script>

<template>
  <div class="mx-auto p-2 lg:p-4 flex flex-col max-h-[calc(100dvh-3rem)]">
    <div class="flex flex-wrap gap-3 justify-between text-gray-300 border border-zinc-800 rounded-md p-3">
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
