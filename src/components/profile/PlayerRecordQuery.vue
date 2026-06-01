<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDebouncedStringFilters } from '@/composables/debounced-string-filters'
import type { PlayerRecordQuery } from '@/types'
import { completionTiers, pointsDistLabels } from '@/utils'

const emits = defineEmits<{
  (e: 'resetQuery'): void
}>()

const query = defineModel<PlayerRecordQuery>('query', { required: true })
const { map, server } = useDebouncedStringFilters(query, ['map', 'server'])

const { t } = useI18n()

const rankItems = computed(() => [
  { label: t('records.query.maxRank.all'), value: undefined },
  { label: t('records.query.maxRank.wr'), value: 1 },
  { label: t('records.query.maxRank.top10'), value: 10 },
  { label: t('records.query.maxRank.top20'), value: 20 },
  { label: t('records.query.maxRank.top50'), value: 50 },
  { label: t('records.query.maxRank.top100'), value: 100 },
])

const tierItems = computed(() => [
  { label: t('common.tier.all'), value: undefined },
  ...completionTiers.map((tier) => ({
    label: t(`common.tier.${tier}`),
    value: tier,
  })),
])

const pointsItems = computed(() => [
  { label: t('profile.runs.query.pointsAll'), value: undefined },
  ...pointsDistLabels.map((label, value) => ({
    label,
    value,
  })),
])
</script>

<template>
  <div class="flex items-center flex-wrap lg:justify-end gap-2 lg:gap-4">
    <USelect
      v-model="query.rank"
      :ui="{ content: 'z-10' }"
      :items="rankItems"
      :placeholder="$t('profile.runs.query.rank')"
    />

    <USelect
      v-model="query.tier"
      :ui="{ content: 'z-10' }"
      :items="tierItems"
      :placeholder="$t('profile.runs.query.tier')"
    />

    <USelect
      v-model="query.points"
      :ui="{ content: 'z-10' }"
      :items="pointsItems"
      :placeholder="$t('profile.runs.query.points')"
    />

    <UInput v-model="map" :placeholder="$t('records.query.map')">
      <template #trailing>
        <IconMap />
      </template>
    </UInput>

    <UInput v-model="server" :placeholder="$t('records.query.server')">
      <template #trailing>
        <IconServer />
      </template>
    </UInput>

    <UButton color="neutral" variant="outline" @click="emits('resetQuery')">
      {{ $t('common.reset') }}
    </UButton>
  </div>
</template>
