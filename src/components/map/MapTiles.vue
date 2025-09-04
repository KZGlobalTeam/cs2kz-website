<script setup lang="ts">
import type { MapExt, MapQuery } from '@/types'

defineProps<{
  maps: MapExt[]
  query: MapQuery
}>()
</script>

<template>
  <div class="grid grid-cols-[repeat(auto-fill,14rem)] lg:grid-cols-[repeat(auto-fill,30rem)] justify-center gap-4">
    <MapCard v-for="map in maps" :key="map.id" :query="query" :map="map" />
  </div>
</template>
