<script setup lang="ts">
import type { CourseExt } from '@/types'

defineProps<{
  mapName: string
  courses: CourseExt[]
}>()
</script>

<template>
  <div class="flex flex-wrap gap-1.5">
    <div v-for="course in courses" :key="course.name">
      <UTooltip :ui="{ content: 'h-max' }">
        <template #content>
          <div class="flex flex-col">
            <div>
              <span class="text-gray-300">{{ $t('common.sortBy.tier') }}</span>
              <span class="mx-1 text-gray-400">:</span>
              <span :style="{ color: course.tierColor }">{{ course.tierNo }}</span>
              <span class="mx-0.5 text-gray-500">-</span>
              <span :style="{ color: course.tierColor }">{{ $t(`common.tier.${course.tier}`) }}</span>
            </div>
            <div>
              <span class="text-gray-300">{{ $t('map.filterState.name') }}</span>
              <span class="mx-1 text-gray-400">:</span>
              <span :style="{ color: course.state === 'ranked' ? '#05df72' : '#d1d5dc' }">
                {{ $t(`map.filterState.${course.state}`) }}
              </span>
            </div>
          </div>
        </template>

        <RouterLink
          :to="`/maps/${mapName}?course=${course.name}`"
          class="w-max px-1.5 py-1 flex justify-center items-center gap-1 text-xs rounded-sm border border-zinc-600 bg-zinc-700/80 hover:bg-zinc-600 cursor-pointer"
        >
          <span
            class="inline-block w-2 h-2 rounded-full"
            :style="{ backgroundColor: course.state === 'ranked' ? '#05df72' : '#d1d5dc' }"
          ></span>
          <span :style="{ color: course.tierColor }">{{ course.tierNo }}</span>
          <span>{{ course.name }}</span>
        </RouterLink>
      </UTooltip>
    </div>
  </div>
</template>
