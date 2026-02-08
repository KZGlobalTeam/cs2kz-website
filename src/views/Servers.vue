<script setup lang="ts">
import { useServers } from '@/composables/servers'

const { servers, availableRegions, loading, query, resetQuery } = useServers()
</script>
<template>
  <div class="mx-auto p-2 lg:p-4 flex flex-col max-h-[calc(100dvh-3rem)]">
    <div class="flex justify-center items-center text-gray-300 border border-gray-800 rounded-md p-3">
      <ServerQuery v-model:query="query" :available-regions="availableRegions" @reset-query="resetQuery" />
    </div>
    <div class="mt-4 p-3 flex-1 overflow-auto border border-gray-700 rounded-md">
      <ServerTiles :query="query" :loading="loading" :servers="servers" />
    </div>
  </div>
</template>
