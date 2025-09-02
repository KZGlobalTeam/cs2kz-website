<script setup lang="ts">
import { useMaps } from '@/composables/maps'

const { maps, loading, query, resetQuery } = useMaps()

function handlePickRandomMap() {
  const mapCount = maps.value.length
  if (mapCount > 0) {
    query.randomName = maps.value[Math.floor(Math.random() * mapCount)].name
  }
}
</script>

<template>
  <div class="mx-auto px-2 lg:px-10 py-2 lg:py-4 flex flex-col">
    <div class="flex flex-wrap gap-3 justify-between text-gray-300 border border-gray-800 rounded-md p-3">
      <MainSwitch v-model:mode="query.mode" v-model:pro="query.pro" />

      <MapQuery v-model:query="query" @pick-random-map="handlePickRandomMap" @reset-filters="resetQuery" />
    </div>

    <div v-if="loading" class="mt-8 flex justify-center">
      <IconLoading class="inline" />
    </div>

    <div v-else-if="maps.length > 0" class="overflow-y-visible">
      <MapTiles :query="query" :loading="loading" :maps="maps" />
    </div>

    <div v-else class="mt-8 flex justify-center">
      <p class="text-gray-500">
        {{ $t('common.noData') }}
      </p>
    </div>
  </div>
</template>
