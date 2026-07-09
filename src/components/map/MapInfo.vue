<script setup lang="ts">
import type { MapState, LeaderboardType, Mode } from '@/types'

const mode = defineModel<Mode>('mode')
const leaderboardType = defineModel<LeaderboardType>('leaderboardType')

const props = defineProps<{
  name: string
  state: MapState
  workshopId: number
  courses: string[]
}>()

const courseOptions = props.courses.map((course) => ({ name: course, value: course }))

const activeCourseName = defineModel<string>('activeCourseName')

const stateColorMap = {
  approved: 'text-green-400 bg-green-300/50',
  'in-testing': 'text-orange-400 bg-orange-300/50',
  invalid: 'text-gray-400 bg-zinc-400',
}
</script>

<template>
  <div class="flex flex-wrap items-center">
    <div class="flex items-center gap-2">
      <p class="text-4xl text-gray-200 font-medium">{{ name }}</p>
      <div :class="stateColorMap[state]" class="px-2 rounded-sm">
        {{ $t(`map.state.${state}`) }}
      </div>
      <UButton
        square
        variant="ghost"
        :to="`https://steamcommunity.com/sharedfiles/filedetails/?id=${workshopId}`"
        target="_blank"
      >
        <IconSteam class="w-5 h-5" />
      </UButton>
    </div>

    <div class="flex items-center gap-2 md:ml-6">
      <p class="text-gray-200 text-lg">{{ `${$t('map.filters')}:` }}</p>
      <div class="flex items-center gap-2">
        <USelect v-model="activeCourseName" :items="courseOptions" />
        <USelect
          v-model="mode"
          :items="[
            { name: $t('common.mode.ckz'), value: 'classic' },
            { name: $t('common.mode.vnl'), value: 'vanilla' },
          ]"
        />
        <USelect
          v-model="leaderboardType"
          :items="[
            { name: $t('common.leaderboardType.overall'), value: 'overall' },
            { name: $t('common.leaderboardType.pro'), value: 'pro' },
          ]"
        />
      </div>
    </div>
  </div>
</template>
