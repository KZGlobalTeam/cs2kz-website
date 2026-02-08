<script setup lang="ts">
import type { RunningServer, ServerQuery } from '@/types'

defineProps<{
  servers: RunningServer[]
  loading: boolean
  query: ServerQuery
}>()
</script>

<template>
  <div class="mx-auto w-max">
    <div class="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-6 gap-4 lg:gap-10 lg:place-items-center">
      <ServerCard v-for="server in servers" :key="server.id" :query="query" :server="server" />
    </div>
  </div>
</template>
