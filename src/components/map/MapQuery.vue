<script setup lang="ts">
import type { MapQuery } from '@/types'
import { useI18n } from 'vue-i18n'
import { usePlayerStore } from '@/stores/player'

const playerStore = usePlayerStore()

const { t } = useI18n()
const query = defineModel<MapQuery>('query', { required: true })

const emits = defineEmits(['pickRandomMap', 'resetQuery'])
</script>

<template>
  <div class="flex items-center flex-wrap lg:justify-end gap-2 lg:gap-4">
    <UCheckbox v-if="playerStore.player" v-model="query.unfinishedOnly" :label="$t('maps.query.unfinishedOnly')" />

    <USelect
      class="w-36"
      v-model="query.tier"
      multiple
      :items="[
        { label: `1 - ${t('common.tier.veryEasy')}`, value: 'very-easy' },
        { label: `2 - ${t('common.tier.easy')}`, value: 'easy' },
        { label: `3 - ${t('common.tier.medium')}`, value: 'medium' },
        { label: `4 - ${t('common.tier.advanced')}`, value: 'advanced' },
        { label: `5 - ${t('common.tier.hard')}`, value: 'hard' },
        { label: `6 - ${t('common.tier.veryHard')}`, value: 'very-hard' },
        { label: `7 - ${t('common.tier.extreme')}`, value: 'extreme' },
        { label: `8 - ${t('common.tier.death')}`, value: 'death' },
        { label: `9 - ${t('common.tier.unfeasible')}`, value: 'unfeasible' },
        { label: `10 - ${t('common.tier.impossible')}`, value: 'impossible' },
      ]"
      :placeholder="$t('maps.query.selectTier')"
      :leading="true"
    >
    </USelect>

    <UButton variant="outline" color="neutral" @click="emits('pickRandomMap')">
      <IconShuffle />
    </UButton>

    <UInput v-model="query.name" :placeholder="$t('maps.query.map')">
      <template #trailing>
        <IconMap />
      </template>
    </UInput>

    <UInput v-model="query.mapper" :placeholder="$t('maps.query.mapper')">
      <template #trailing>
        <IconHammer />
      </template>
    </UInput>

    <UButton color="neutral" variant="outline" @click="emits('resetQuery')"> {{ $t('common.reset') }} </UButton>
  </div>
</template>
