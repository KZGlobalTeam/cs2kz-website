<script setup lang="ts">
import { useServers } from '@/composables/servers'

const { servers, loading, total, query, incrementServers } = useServers()
</script>
<template>
  <div class="mx-auto justify-center p-2 lg:p-4 max-h-[calc(100dvh-3rem)]">
    <div class="flex flex-wrap gap-3 justify-center text-gray-300 border border-gray-800 rounded-md p-3">
      <ServerQuery v-model:query="query" />
    </div>
    <ServerTable :query="query" :loading="loading" :servers="servers" :total="total" @intersect="incrementServers" />
  </div>
</template>
