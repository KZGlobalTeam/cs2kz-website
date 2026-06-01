<script setup lang="ts">
import { useDebouncedStringFilters } from '@/composables/debounced-string-filters'
import type { RecordQuery } from '@/types'

defineProps<{
  loading: boolean
}>()

const emits = defineEmits(['resetQuery', 'refresh'])

const query = defineModel<RecordQuery>('query', { required: true })
const { map, course, player, server } = useDebouncedStringFilters(query, ['map', 'course', 'player', 'server'])
</script>

<template>
  <div class="flex items-center flex-wrap lg:justify-end gap-2 lg:gap-4">
    <UCheckbox v-model="query.top" :label="$t('records.query.pbOnly')" />
    <UCheckbox
      :model-value="query.ranked === true"
      :label="$t('records.query.rankedOnly')"
      @update:model-value="(value) => (query.ranked = value === true ? true : undefined)"
    />

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

    <UInput v-model="map" :placeholder="$t('records.query.map')">
      <template #trailing>
        <IconMap />
      </template>
    </UInput>

    <UInput v-model="course" :placeholder="$t('records.query.course')">
      <template #trailing>
        <IconCourse />
      </template>
    </UInput>

    <UInput v-model="player" :placeholder="$t('records.query.player')">
      <template #trailing>
        <IconPlayer />
      </template>
    </UInput>

    <UInput v-model="server" :placeholder="$t('records.query.server')" class="hidden lg:block">
      <template #trailing>
        <IconServer />
      </template>
    </UInput>

    <UButton color="neutral" variant="outline" @click="emits('resetQuery')"> {{ $t('common.reset') }} </UButton>
    <UButton color="neutral" variant="outline" :loading="loading" @click="emits('refresh')">
      {{ $t('pagination.refresh') }}
    </UButton>
  </div>
</template>
