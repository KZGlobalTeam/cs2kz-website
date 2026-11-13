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
      <RouterLink
        :to="`/maps/${mapName}?course=${course.name}`"
        :class="course.state === 'ranked' ? 'border-[#05df7250]' : 'border-[#d1d5dc50]'"
        class="w-max px-1 py-0.5 text-sm flex justify-center items-center gap-1 rounded-sm border bg-zinc-700/80 hover:bg-zinc-600 cursor-pointer"
      >
        <span class="inline-block max-w-32 truncate">{{ course.name }}</span>
        <span
          class="border rounded-sm px-0.5"
          :style="{
            borderColor: `${course.tierColor}70`,
            color: course.tierColor,
          }"
          >T{{ course.tierNo }}</span
        >
      </RouterLink>
    </div>
  </div>
</template>
