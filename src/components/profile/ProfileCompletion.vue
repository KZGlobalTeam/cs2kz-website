<script setup lang="ts">
import type { Tier } from '@/types'

defineProps<{
  completion: {
    wrs: number
    top10: number
    top20: number
    top50: number
    pointsDistribution: number[]
    completedCourses: number[]
    totalCourses: number[]
  }
  selectedTier?: Tier
  selectedPoints?: number
}>()

const emits = defineEmits<{
  (e: 'selectTier', tier: Tier | undefined): void
  (e: 'selectPoints', points: number | undefined): void
}>()
</script>

<template>
  <div class="text-gray-300">
    <!-- title -->
    <p class="text-3xl font-semibold mb-2">
      {{ $t('profile.completion.title') }}
    </p>

    <div class="p-4 border border-gray-700 rounded-md">
      <!-- top records -->
      <p class="text-xl font-medium mb-2">
        {{ $t('profile.completion.topRecords') }}
      </p>
      <ProfileTopRecords
        class="mb-4"
        :wrs="completion.wrs"
        :top10="completion.top10"
        :top20="completion.top20"
        :top50="completion.top50"
      />

      <div class="flex flex-col lg:flex-row gap-4">
        <!-- completed courses by tier -->
        <div class="flex-1">
          <p class="text-xl font-medium mb-2">
            {{ $t('profile.completion.completionPerTier') }}
          </p>
          <ProfileChartCompletionByTier
            :completed-courses="completion.completedCourses"
            :total-courses="completion.totalCourses"
            :selected-tier="selectedTier"
            @select-tier="emits('selectTier', $event)"
          />
        </div>
        <!-- points distribution -->
        <div class="flex-1">
          <p class="text-xl font-medium mb-2">
            {{ $t('profile.completion.pointsDist') }}
          </p>
          <ProfileChartPointsDist
            class="mb-4"
            :points-distribution="completion.pointsDistribution"
            :selected-points="selectedPoints"
            @select-points="emits('selectPoints', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
