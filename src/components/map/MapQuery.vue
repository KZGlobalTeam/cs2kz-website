<script setup lang="ts">
import type { MapQuery } from '@/types'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const query = defineModel<MapQuery>('query', { required: true })

const emit = defineEmits<{
  randomClick: []
}>()
</script>

<template>
  <div class="p-2 lg:p-4 grid grid-cols-1 lg:grid-cols-4 gap-2 lg:gap-8 border border-gray-700 rounded-md">
    <ModeSwitcher v-model:mode="query.mode" />
    <div class="col-span-3 flex items-center flex-wrap lg:justify-end gap-2 lg:gap-4">
      <UButtonGroup orientation="horizontal">
        <UButton
          :variant="query.leaderboardType === 'overall' ? 'solid' : 'outline'"
          :label="$t('common.leaderboardType.overall')"
          @click="query.leaderboardType = 'overall'"
        />
        <UButton
          :variant="query.leaderboardType === 'pro' ? 'solid' : 'outline'"
          :label="$t('common.leaderboardType.pro')"
          @click="query.leaderboardType = 'pro'"
        />
      </UButtonGroup>

      <USelect
        v-model="query.tier"
        class="min-w-[140px]"
        :content="{ class: 'max-h-none' }"
        :items="[
          { label: t('common.tier.all'), value: undefined },
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

      <UInput v-model="query.name" :placeholder="$t('maps.query.searchby')">
        <template #trailing>
          <IconMap />
        </template>
      </UInput>

      <UTooltip text="Pick a random map with applied filters">
        <UButton @click="emit('randomClick')" variant="ghost" square class="cursor-pointer">
          <IconDice />
        </UButton>
      </UTooltip>
    </div>
  </div>
</template>
