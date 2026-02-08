<script setup lang="ts">
import { useMaps } from '@/composables/maps'

const { maps, loading, query, lengthRanges, resetQuery, pickRandomMap } = useMaps()
//
</script>

<template>
  <div class="mx-auto p-2 lg:p-4 flex flex-col max-h-[calc(100dvh-3rem)]">
    <div class="flex flex-wrap gap-3 justify-between text-gray-300 border border-gray-800 rounded-md p-3">
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

    <div v-else-if="maps.length > 0" class="mt-4 p-3 flex-1 overflow-auto border border-gray-700 rounded-md">
      <MapTiles :query="query" :loading="loading" :maps="maps" />
    </div>

    <div v-else class="mt-4 flex justify-center">
      <p class="text-gray-500">
        {{ $t('common.noData') }}
      </p>
    </div>
  </div>
</template>
