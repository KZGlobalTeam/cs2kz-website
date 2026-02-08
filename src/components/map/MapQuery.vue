<script setup lang="ts">
import { computed } from 'vue'
import type { MapQuery } from '@/types'
import { useI18n } from 'vue-i18n'
import { usePlayerStore } from '@/stores/player'

const playerStore = usePlayerStore()

const { t } = useI18n()
const query = defineModel<MapQuery>('query', { required: true })

const props = defineProps<{
  lengthRanges: { key: string; minMinutes: number; maxMinutes: number }[]
}>()

const lengthItems = computed(() =>
  props.lengthRanges.map((range) => ({
    label:
      range.minMinutes === 0
        ? t('maps.query.lengthUnderOne')
        : t('maps.query.lengthRange', { min: range.minMinutes, max: range.maxMinutes }),
    value: range.key,
  })),
)

const emits = defineEmits(['pickRandomMap', 'resetQuery'])
</script>

<template>
  <div class="flex items-center flex-wrap lg:justify-end gap-2 lg:gap-4">
    <UCheckbox v-if="playerStore.player" v-model="query.unfinishedOnly" :label="$t('maps.query.unfinishedOnly')" />

    <USelect
      class="w-40"
      v-model="query.lengthRangeKeys"
      multiple
      :items="lengthItems"
      :placeholder="$t('maps.query.selectLength')"
      :disabled="lengthItems.length === 0"
      :leading="true"
    >
    </USelect>

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

    <UInput v-model="query.name" :placeholder="$t('maps.query.map')">
      <template #trailing>
        <IconMap />
      </template>
    </UInput>

    <UInput v-model="query.mapper" :placeholder="$t('maps.query.mapper')">
      <template #trailing>
        <IconHammer :width="1.5" />
      </template>
    </UInput>

    <UButton variant="outline" color="neutral" @click="emits('pickRandomMap')">
      <IconShuffle />
    </UButton>

    <UButton color="neutral" variant="outline" @click="emits('resetQuery')"> {{ $t('common.reset') }} </UButton>
  </div>
</template>
