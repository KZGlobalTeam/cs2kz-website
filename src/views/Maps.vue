<script setup lang="ts">
import { useMaps } from '@/composables/maps'
import { getQueryValue, readQueryState, syncQueryState } from '@/composables/query-state'
import type { QueryStateConfig } from '@/composables/query-state'
import type { MapQuery, Tier } from '@/types'
import { useHead } from '@unhead/vue'
import { useRoute } from 'vue-router'

const tiers: Tier[] = [
  'very-easy',
  'easy',
  'medium',
  'advanced',
  'hard',
  'very-hard',
  'extreme',
  'death',
  'unfeasible',
  'impossible',
]
const queryConfig = {
  name: {
    name: 'map',
    defaultValue: '',
    parse: (value) => getQueryValue(value) ?? '',
    serialize: (value) => value,
  },
  mapper: {
    name: 'mapper',
    defaultValue: '',
    parse: (value) => getQueryValue(value) ?? '',
    serialize: (value) => value,
  },
  randomName: {
    name: 'random',
    defaultValue: '',
    parse: (value) => getQueryValue(value) ?? '',
    serialize: (value) => value,
  },
  unfinishedOnly: {
    name: 'unfinished',
    defaultValue: false,
    parse: (value) => getQueryValue(value) === '1',
    serialize: (value) => (value ? '1' : '0'),
  },
  lengthRangeKeys: {
    name: 'length',
    defaultValue: [],
    parse: (value) => (Array.isArray(value) ? value : [value]).filter((item): item is string => item !== null),
    serialize: (value) => value,
  },
  tier: {
    name: 'tier',
    defaultValue: [],
    parse: (value) =>
      (Array.isArray(value) ? value : [value]).filter((item): item is Tier => tiers.includes(item as Tier)),
    serialize: (value) => value,
  },
} satisfies QueryStateConfig<MapQuery>

useHead({
  title: 'Maps - CS2KZ',
  meta: [
    {
      name: 'description',
      content:
        'Browse CS2KZ maps, filter by course settings, and discover new maps to play across the global map list.',
    },
    {
      property: 'og:title',
      content: 'Maps - CS2KZ',
    },
    {
      property: 'og:description',
      content:
        'Browse CS2KZ maps, filter by course settings, and discover new maps to play across the global map list.',
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
const initialQuery = readQueryState<MapQuery>(route.query, queryConfig)
const { maps, loading, query, lengthRanges, resetQuery, pickRandomMap } = useMaps(initialQuery)

syncQueryState(query, queryConfig)
</script>

<template>
  <div class="mx-auto p-2 lg:p-4 flex flex-col max-h-[calc(100dvh-3rem)]">
    <div class="flex flex-wrap gap-3 justify-between text-gray-300 border border-zinc-800 rounded-md p-3">
      <MainSwitch />

      <MapQuery
        v-model:query="query"
        :length-ranges="lengthRanges"
        @pick-random-map="pickRandomMap"
        @reset-query="resetQuery"
      />
    </div>

    <div v-if="loading" class="mt-4 flex justify-center">
      <IconLoading class="inline" />
    </div>

    <div
      v-else-if="maps.length > 0"
      class="mt-4 p-3 flex-1 list-wrapper overflow-auto border border-zinc-700 rounded-md"
    >
      <MapTiles :query="query" :loading="loading" :maps="maps" />
    </div>

    <div v-else class="mt-4 flex justify-center">
      <p class="text-gray-500">
        {{ $t('common.noData') }}
      </p>
    </div>
  </div>
</template>
