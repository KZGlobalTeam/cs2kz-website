<script setup lang="ts">
import type { ServerQuery } from '@/types'

const query = defineModel<ServerQuery>('query', { required: true })

defineProps<{
  availableRegions: { name: string; code: string }[]
}>()

const emits = defineEmits(['resetQuery'])
</script>

<template>
  <div
    class="lg:w-max mx-auto p-2 lg:p-4 flex flex-wrap items-center lg:justify-center gap-2 lg:gap-8 border border-gray-700 rounded-md"
  >
    <UCheckbox v-model="query.globalMapOnly" :label="$t('servers.query.globalMapsOnly')" />

    <UInput v-model="query.name" :placeholder="$t('servers.query.name')">
      <template #trailing>
        <IconServer />
      </template>
    </UInput>

    <UInput v-model="query.map" :placeholder="$t('servers.query.map')">
      <template #trailing>
        <IconMap />
      </template>
    </UInput>

    <UInput v-model="query.owner" :placeholder="$t('servers.query.ownedBy')">
      <template #trailing>
        <IconAdmin />
      </template>
    </UInput>

    <USelect
      v-if="availableRegions.length > 0"
      v-model="query.region_code"
      :items="availableRegions"
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
  </div>
</template>
