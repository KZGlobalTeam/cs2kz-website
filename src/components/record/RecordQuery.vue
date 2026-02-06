<script setup lang="ts">
import { watch } from 'vue'
import { debounce } from 'radash'
import type { RecordQuery } from '@/types'

const query = defineModel<RecordQuery>('query', { required: true })

watch([() => query.value.player, () => query.value.course, () => query.value.server], ([player, course, server]) => {
  updateStringQueries(player, course, server)
})

const updateStringQueries = debounce({ delay: 300 }, (player, course, server) => {
  query.value.player = player
  query.value.course = course
  query.value.server = server
})
</script>

<template>
  <div class="flex items-center flex-wrap lg:justify-end gap-2 lg:gap-4">
    <div class="hidden lg:flex items-center gap-2">
      <p>{{ $t('records.query.pbOnly') }}</p>
      <USwitch v-model="query.top" size="lg" />
    </div>

    <USelect
      v-model="query.max_rank"
      :ui="{ content: 'z-10' }"
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

    <UInput v-model="query.map" :placeholder="$t('records.query.map')">
      <template #trailing>
        <IconMap />
      </template>
    </UInput>

    <UInput v-model="query.course" :placeholder="$t('records.query.course')">
      <template #trailing>
        <IconCourse />
      </template>
    </UInput>

    <UInput v-model="query.player" :placeholder="$t('records.query.player')">
      <template #trailing>
        <IconPlayer />
      </template>
    </UInput>

    <UInput v-model="query.server" :placeholder="$t('records.query.server')" class="hidden lg:block">
      <template #trailing>
        <IconServer />
      </template>
    </UInput>
  </div>
</template>
