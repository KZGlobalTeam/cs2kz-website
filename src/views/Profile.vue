<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePlayerProfile } from '@/composables/player-profile'

const route = useRoute()
const steamId = computed(() => route.params.steamId as string)

const {
  profile,
  steamProfile,
  maps,
  mode,
  rankedOnly,
  recordQuery,
  unfinishedQuery,
  records,
  unfinishedCourses,
  loading,
  totalCourses,
  completedCourses,
  topRecords,
  pointsDistribution,
  resetRecordQuery,
  resetUnfinishedQuery,
  setTierFilter,
  setPointsFilter,
} = usePlayerProfile(steamId)
</script>

<template>
  <div class="hidden xl:block py-4 px-10 mx-auto text-gray-300">
    <div>
      <MainSwitch class="mb-5" />
      <ProfilePlayer class="mb-5" :loading="loading" :profile="profile" :steam-profile="steamProfile" :mode="mode" />
    </div>

    <div class="flex gap-5">
      <div class="w-3/7">
        <ProfileCompletion
          class="mb-5"
          :loading="loading"
          :top-records="topRecords"
          :points-distribution="pointsDistribution"
          :total-courses="totalCourses"
          :completed-courses="completedCourses"
          :selected-tier="recordQuery.tier"
          :selected-points="recordQuery.points"
          v-model:ranked-only="rankedOnly"
          @select-tier="setTierFilter"
          @select-points="setPointsFilter"
        />

        <ProfileMaps class="mb-5" :loading="loading" :maps="maps" />

        <ProfileUnfinished
          v-model:query="unfinishedQuery"
          :unfinished-courses="unfinishedCourses"
          :loading="loading"
          @reset-query="resetUnfinishedQuery"
        />
      </div>
      <div class="w-4/7">
        <ProfileRuns
          v-model:query="recordQuery"
          :records="records"
          :loading="loading"
          @reset-query="resetRecordQuery"
        />
      </div>
    </div>
  </div>

  <div class="block xl:hidden py-2 px-2 max-w-5xl mx-auto text-gray-300">
    <MainSwitch class="mb-5" />
    <ProfilePlayer class="mb-5" :loading="loading" :profile="profile" :steam-profile="steamProfile" :mode="mode" />

    <ProfileCompletion
      class="mb-5"
      :loading="loading"
      :top-records="topRecords"
      :points-distribution="pointsDistribution"
      :total-courses="totalCourses"
      :completed-courses="completedCourses"
      :selected-tier="recordQuery.tier"
      :selected-points="recordQuery.points"
      @select-tier="setTierFilter"
      @select-points="setPointsFilter"
    />

    <ProfileMaps class="mb-5" :loading="loading" :maps="maps" />

    <ProfileRuns
      class="mb-5"
      v-model:query="recordQuery"
      :records="records"
      :loading="loading"
      @reset-query="resetRecordQuery"
    />
    <ProfileUnfinished
      v-model:query="unfinishedQuery"
      :unfinished-courses="unfinishedCourses"
      :loading="loading"
      @reset-query="resetUnfinishedQuery"
    />
  </div>
</template>
