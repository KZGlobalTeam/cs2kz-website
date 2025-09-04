<script setup lang="ts">
import type { MapExt, MapQuery } from '@/types'

defineProps<{
  maps: MapExt[]
  query: MapQuery
}>()
</script>

<template>
  <div class="mt-8 p-1 mx-auto w-max">
    <div class="grid grid-cols-1 2xl:grid-cols-2 gap-4 2xl:gap-10 2xl:place-items-center">
      <MapCard v-for="map in maps" :key="map.id" :query="query" :map="map" />
    </div>
  </div>
</template>
