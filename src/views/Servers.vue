<script setup lang="ts">
import { useServers } from '@/composables/servers'

const { servers, loading, query } = useServers()
</script>
<template>
  <div class="mx-auto justify-center px-2 lg:px-10 py-2 lg:py-4">
    <ServerQuery v-model:query="query" />
    <ServerTable :query="query" :loading="loading" :servers="servers" />
  </div>
</template>
