<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRecords } from '@/composables/records'
import { useCourses } from '@/composables/courses'
import { useRoute } from 'vue-router'
import { calcRanksAndPointsDist, calcCompletedCourses, calcTotalCourses } from '@/utils'

const route = useRoute()

const { records, query: completionQuery } = useRecords({ player: route.params.steamId as string, limit: 10000 })

const { courses } = useCourses({ limit: 10000 })

const ranksAndPoints = ref()
const completedCourses = ref()

watch(
  () => route.params.steamId,
  (steamId) => {
    completionQuery.player = steamId as string
  },
)

watch(
  records,
  (records) => {
    ranksAndPoints.value = calcRanksAndPointsDist(records, completionQuery.leaderboardType)
    completedCourses.value = calcCompletedCourses(records, completionQuery.leaderboardType)
  },
  { immediate: true },
)

const totalCourses = computed(() => calcTotalCourses(courses.value))
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
        :wrs="ranksAndPoints.wrs"
        :top10="ranksAndPoints.top10"
        :top20="ranksAndPoints.top20"
        :top50="ranksAndPoints.top50"
      />

      <div class="flex flex-col lg:flex-row gap-4">
        <!-- completed courses by tier -->
        <div class="flex-1">
          <p class="text-xl font-medium mb-2">
            {{ $t('profile.completion.completionPerTier') }}
          </p>
          <ProfileChartCompletionByTier :completed-courses="completedCourses" :total-courses="totalCourses" />
        </div>
        <!-- points distribution -->
        <div class="flex-1">
          <p class="text-xl font-medium mb-2">
            {{ $t('profile.completion.pointsDist') }}
          </p>
          <ProfileChartPointsDist class="mb-4" :points-dist="ranksAndPoints.pointsDist" />
        </div>
      </div>
    </div>
  </div>
</template>
