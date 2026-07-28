<script setup lang="ts">
import type { RunningServer, ServerQuery } from '@/types'

defineProps<{
  servers: RunningServer[]
  loading: boolean
  query: ServerQuery
  guideHidden: boolean
}>()
</script>

<template>
  <div class="list-wrapper mx-auto w-max">
    <div
      class="grid grid-cols-1 gap-4 lg:gap-4 lg:place-items-center"
      :class="guideHidden ? 'xl:grid-cols-4' : 'xl:grid-cols-3'"
    >
      <ServerCard v-for="server in servers" :key="server.id" :query="query" :server="server" />
    </div>
  </div>
</template>
