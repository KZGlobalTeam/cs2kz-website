<script setup lang="ts">
import type { MapResponse, PlayerResponse, ServerResponse, RecordQuery } from '@/types'
import { api } from '@/utils'
import RecordSearchFilter from './RecordSearchFilter.vue'
import { useRoute } from 'vue-router'

const query = defineModel<RecordQuery>('query', { required: true })

const route = useRoute()

async function fetchMapSearchResults(search: string) {
  const { data } = await api.get<MapResponse>('/maps', {
    params: { name: search, game: 'cs2' },
  })

  return data.values.flatMap((map) => {
    return map.courses.map((course) => ({
      map: map.name,
      courseName: course.name,
      courseId: course.id,
    }))
  })
}

async function fetchPlayerSearchResults(search: string) {
  const { data } = await api.get<PlayerResponse>('/players', {
    params: { name: search },
  })

  return data.values.map((player) => ({
    playerId: player.id,
    playerName: player.name,
  }))
}

async function fetchServerSearchResults(search: string) {
  const { data } = await api.get<ServerResponse>('/servers', {
    params: { name: search, game: 'cs2' },
  })

  return data.values.map((server) => ({
    serverId: server.id,
    serverName: server.name,
  }))
}
</script>

<template>
  <div class="flex items-center flex-wrap lg:justify-end gap-2 lg:gap-4">
    <div class="hidden lg:flex items-center gap-2">
      <p>{{ $t('records.query.pbOnly') }}</p>
      <USwitch v-model="query.top" size="lg" />
    </div>

    <USelect
      v-model="query.max_rank"
      :ui="{ content: 'z-[2]' }"
      :items="[
        { label: $t('records.query.maxRank.all'), value: undefined },
        { label: $t('records.query.maxRank.wr'), value: 1 },
        { label: $t('records.query.maxRank.top10'), value: 10 },
        { label: $t('records.query.maxRank.top20'), value: 20 },
        { label: $t('records.query.maxRank.top50'), value: 50 },
        { label: $t('records.query.maxRank.top100'), value: 100 },
      ]"
      :placeholder="$t('records.query.maxRank.placeholder')"
    />

    <RecordSearchFilter
      placeholder-path="records.query.map"
      :fetch-results="fetchMapSearchResults"
      @cleared="query.course = undefined"
    >
      <template #trailing-icon>
        <IconMap />
      </template>

      <template #results="{ results }">
        <div class="flex flex-col gap-1 p-1">
          <div
            v-for="result in results"
            :key="result.courseId"
            @click="query.course = result.courseId"
            class="hover:bg-gray-800 pl-2 pr-3 py-1.5 rounded-sm cursor-pointer flex items-center gap-1"
          >
            <span class="text-gray-200 font-semibold">{{ result.map }}</span>
            <span class="text-gray-600">/</span>
            <span class="text-gray-300"> {{ result.courseName }}</span>
          </div>
        </div>
      </template>
    </RecordSearchFilter>

    <RecordSearchFilter
      v-if="route.name !== 'Profile'"
      placeholder-path="records.query.player"
      :fetch-results="fetchPlayerSearchResults"
      @cleared="query.player = undefined"
    >
      <template #trailing-icon>
        <IconPlayer />
      </template>

      <template #results="{ results }">
        <div class="flex flex-col gap-1 p-1">
          <div
            v-for="result in results"
            :key="result.playerId"
            @click="query.player = result.playerId"
            class="hover:bg-gray-800 pl-2 pr-3 py-1 rounded-sm cursor-pointer"
          >
            <span class="text-gray-300"> {{ result.playerName }}</span>
          </div>
        </div>
      </template>
    </RecordSearchFilter>

    <RecordSearchFilter
      placeholder-path="records.query.server"
      :fetch-results="fetchServerSearchResults"
      @cleared="query.server = undefined"
    >
      <template #trailing-icon>
        <IconServer />
      </template>

      <template #results="{ results }">
        <div class="flex flex-col gap-1 p-1">
          <div
            v-for="result in results"
            :key="result.serverId"
            @click="query.server = result.serverId"
            class="hover:bg-gray-800 pl-2 pr-3 py-1.5 rounded-sm cursor-pointer"
          >
            <span class="text-gray-300"> {{ result.serverName }}</span>
          </div>
        </div>
      </template>
    </RecordSearchFilter>
  </div>
</template>
