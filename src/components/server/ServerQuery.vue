<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDebouncedStringFilters } from '@/composables/debounced-string-filters'
import type { ServerQuery } from '@/types'

const query = defineModel<ServerQuery>('query', { required: true })
const { name, map } = useDebouncedStringFilters(query, ['name', 'map', 'owner'])

defineProps<{
  loading?: boolean
}>()

const emits = defineEmits(['resetQuery', 'refresh'])

const { t, te } = useI18n()

const continentOptions = [
  { name: 'Asia', code: 'AS' },
  { name: 'Europe', code: 'EU' },
  { name: 'Oceania', code: 'OC' },
  { name: 'North America', code: 'NA' },
  { name: 'South America', code: 'SA' },
  { name: 'Africa', code: 'AF' },
]

const localizedContinentOptions = computed(() => {
  return continentOptions.map((continent) => {
    const key = `servers.regions.${continent.code}`
    return {
      ...continent,
      name: te(key) ? t(key) : continent.name,
    }
  })
})
</script>

<template>
  <div class="flex items-center flex-wrap justify-center gap-2 lg:gap-4">
    <UCheckbox v-model="query.globalMapOnly" :label="$t('servers.query.globalMapsOnly')" />

    <UInput v-model="name" :placeholder="$t('servers.query.name')">
      <template #trailing>
        <IconServer />
      </template>
    </UInput>

    <UInput v-model="map" :placeholder="$t('servers.query.map')">
      <template #trailing>
        <IconMap />
      </template>
    </UInput>

    <USelect
      v-if="localizedContinentOptions.length > 0"
      v-model="query.continentCode"
      :items="localizedContinentOptions"
      label-key="name"
      value-key="code"
      :placeholder="$t('servers.query.selectRegion')"
      :ui="{ content: 'min-w-fit' }"
    >
    </USelect>

    <UButtonGroup orientation="horizontal">
      <UButton
        variant="outline"
        color="neutral"
        @click="query.sortOrder = query.sortOrder === 'ascending' ? 'descending' : 'ascending'"
      >
        <IconUp v-if="query.sortOrder === 'ascending'" />
        <IconDown v-else />
      </UButton>
      <USelect
        variant="outline"
        color="neutral"
        v-model="query.sortBy"
        :ui="{ base: 'w-32' }"
        :items="[
          { label: $t('servers.query.sort.playerCount'), value: 'num_players' },
          { label: $t('servers.query.sort.name'), value: 'name' },
          { label: $t('servers.query.sort.date'), value: 'approved_at' },
        ]"
      />
    </UButtonGroup>

    <UButton color="neutral" variant="outline" @click="emits('resetQuery')"> {{ $t('common.reset') }} </UButton>
    <UButton color="neutral" variant="outline" :loading="loading" @click="emits('refresh')">
      {{ $t('pagination.refresh') }}
    </UButton>
  </div>
</template>
