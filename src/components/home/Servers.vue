<script setup lang="ts">
import { useServers } from '@/composables/servers'
import ServerQuery from '@/components/server/ServerQuery.vue'
import ServerTiles from '@/components/server/ServerTiles.vue'
import IconLoading from '@/components/icon/IconLoading.vue'

const { servers, availableRegions, loading, query, resetQuery, getServers } = useServers()
</script>

<template>
  <section class="flex flex-col max-h-[calc(100dvh-5rem)]">
    <span class="text-white text-xl font-semibold border-l-4 border-blue-600 pl-2">Global Servers</span>
    <div class="mt-2 hidden xl:flex justify-center items-center border border-gray-800 rounded-md p-3">
      <ServerQuery
        v-model:query="query"
        :available-regions="availableRegions"
        :loading="loading"
        @reset-query="resetQuery"
        @refresh="getServers"
      />
    </div>
    <div class="mt-2 block xl:hidden border border-gray-800 rounded-md p-3">
      <ServerQuery
        v-model:query="query"
        :available-regions="availableRegions"
        :loading="loading"
        @reset-query="resetQuery"
        @refresh="getServers"
      />
    </div>

    <div v-if="loading" class="mt-2 p-3 flex justify-center border border-gray-700 rounded-md">
      <IconLoading />
    </div>
    <div v-else class="mt-2 p-3 flex-1 list-wrapper overflow-auto border border-gray-700 rounded-md">
      <ServerTiles :query="query" :loading="loading" :servers="servers" />
    </div>
  </section>
</template>
