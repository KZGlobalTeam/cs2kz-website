<script setup lang="ts">
import { useServers } from '@/composables/servers'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Servers - CS2KZ',
  meta: [
    {
      name: 'description',
      content:
        'Find active CS2KZ servers, browse regions, and choose where to play based on current server availability.',
    },
  ],
})

const { servers, availableRegions, loading, query, resetQuery, getServers } = useServers()
</script>
<template>
  <div class="mx-auto p-2 lg:p-4 flex flex-col max-h-[calc(100dvh-3rem)]">
    <div class="flex justify-center items-center text-gray-300 border border-gray-800 rounded-md p-3">
      <ServerQuery
        v-model:query="query"
        :available-regions="availableRegions"
        :loading="loading"
        @reset-query="resetQuery"
        @refresh="getServers"
      />
    </div>
    <div v-if="loading" class="mt-4 p-3 flex justify-center border border-gray-700 rounded-md">
      <IconLoading />
    </div>
    <div v-else class="mt-4 p-3 flex-1 list-wrapper overflow-auto border border-gray-700 rounded-md">
      <ServerTiles :query="query" :loading="loading" :servers="servers" />
    </div>
  </div>
</template>
