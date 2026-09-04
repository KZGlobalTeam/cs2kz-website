<script setup lang="ts">
import { useServers } from '@/composables/servers'
import { getQueryValue, readQueryState, syncQueryState } from '@/composables/query-state'
import type { QueryStateConfig } from '@/composables/query-state'
import ServerQuery from '@/components/server/ServerQuery.vue'
import ServerTiles from '@/components/server/ServerTiles.vue'
import IconLoading from '@/components/icon/IconLoading.vue'
import type { ServerQuery as ServerQueryState } from '@/types'
import { useRoute } from 'vue-router'

const queryConfig = {
  name: {
    name: 'server',
    defaultValue: '',
    parse: (value) => getQueryValue(value) ?? '',
    serialize: (value) => value,
  },
  map: {
    name: 'serverMap',
    defaultValue: '',
    parse: (value) => getQueryValue(value) ?? '',
    serialize: (value) => value,
  },
  region_code: {
    name: 'region',
    defaultValue: undefined,
    parse: (value) => getQueryValue(value) ?? undefined,
    serialize: (value) => value,
  },
  globalMapOnly: {
    name: 'globalOnly',
    defaultValue: false,
    parse: (value) => getQueryValue(value) === '1',
    serialize: (value) => (value ? '1' : '0'),
  },
  sortBy: {
    name: 'serverSort',
    defaultValue: 'num_players',
    parse: (value) => {
      const sortBy = getQueryValue(value)
      return sortBy === 'name' || sortBy === 'num_players' || sortBy === 'approved_at' ? sortBy : 'num_players'
    },
    serialize: (value) => value,
  },
  sortOrder: {
    name: 'serverOrder',
    defaultValue: 'descending',
    parse: (value) => (getQueryValue(value) === 'ascending' ? 'ascending' : 'descending'),
    serialize: (value) => value,
  },
} satisfies QueryStateConfig<ServerQueryState>

defineProps<{ guideHidden: boolean }>()

const route = useRoute()
const initialQuery = readQueryState<ServerQueryState>(route.query, queryConfig)
const { servers, availableRegions, loading, query, resetQuery, getServers } = useServers(initialQuery)

syncQueryState(query, queryConfig)
</script>

<template>
  <section class="flex flex-col max-h-[calc(100dvh-5rem)]">
    <span class="text-white text-xl font-semibold border-l-4 border-blue-600 pl-2">{{ $t('home.servers.title') }}</span>
    <div class="mt-2 hidden xl:flex justify-center items-center border border-zinc-800 rounded-md p-3">
      <ServerQuery
        v-model:query="query"
        :available-regions="availableRegions"
        :loading="loading"
        @reset-query="resetQuery"
        @refresh="getServers"
      />
    </div>
    <div class="mt-2 block xl:hidden border border-zinc-800 rounded-md p-3">
      <ServerQuery
        v-model:query="query"
        :available-regions="availableRegions"
        :loading="loading"
        @reset-query="resetQuery"
        @refresh="getServers"
      />
    </div>

    <div v-if="loading" class="mt-2 p-3 flex justify-center border border-zinc-700 rounded-md">
      <IconLoading />
    </div>
    <div v-else class="mt-2 p-3 flex-1 list-wrapper overflow-auto border border-zinc-700 rounded-md">
      <ServerTiles :query="query" :loading="loading" :servers="servers" :guide-hidden="guideHidden" />
    </div>
  </section>
</template>
