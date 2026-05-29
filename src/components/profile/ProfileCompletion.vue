<script setup lang="ts">
import type { Tier } from '@/types'

defineProps<{
  topRecords: {
    wrs: number
    top10: number
    top20: number
    top50: number
  }
  pointsDistribution: number[]
  completedCourses: number[]
  totalCourses: number[]
  loading: boolean
  selectedTier?: Tier
  selectedPoints?: number
}>()

const emits = defineEmits<{
  (e: 'selectTier', tier: Tier | undefined): void
  (e: 'selectPoints', points: number | undefined): void
}>()

const rankedOnly = defineModel<boolean>('rankedOnly')
</script>

<template>
  <div class="text-gray-300">
    <div class="flex items-center gap-4 mb-2">
      <!-- title -->
      <p class="text-3xl font-semibold">
        {{ $t('profile.completion.title') }}
      </p>
      <UButtonGroup size="xs" orientation="horizontal" class="mt-1">
        <UButton color="neutral" :variant="rankedOnly ? 'solid' : 'outline'" @click="rankedOnly = true">
          {{ $t('records.query.rankedOnly') }}
        </UButton>
        <UButton color="neutral" :variant="rankedOnly ? 'outline' : 'solid'" @click="rankedOnly = false">
          {{ $t('records.query.all') }}</UButton
        >
      </UButtonGroup>
    </div>

    <div v-if="loading" class="p-4 border border-gray-700 rounded-md flex justify-center items-center">
      <IconLoading />
    </div>
    <div v-else class="p-4 border border-gray-700 rounded-md">
      <!-- top records -->
      <p class="text-xl font-medium mb-2">
        {{ $t('profile.completion.topRecords') }}
      </p>
      <ProfileTopRecords
        class="mb-4"
        :wrs="topRecords.wrs"
        :top10="topRecords.top10"
        :top20="topRecords.top20"
        :top50="topRecords.top50"
      />

      <div class="flex flex-col lg:flex-row gap-4">
        <!-- completed courses by tier -->
        <div class="flex-1">
          <p class="text-xl font-medium mb-2">
            {{ $t('profile.completion.completionPerTier') }}
          </p>
          <ProfileChartCompletionByTier
            :completed-courses="completedCourses"
            :total-courses="totalCourses"
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
            :points-distribution="pointsDistribution"
            :selected-points="selectedPoints"
            @select-points="emits('selectPoints', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
