<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { usePlayerProfile } from '@/composables/player-profile'
import { getQueryValue, readQueryState, syncQueryState } from '@/composables/query-state'
import type { QueryStateConfig } from '@/composables/query-state'
import type { PlayerRecordQuery, Tier, UnfinishedCourseQuery } from '@/types'
import { useHead } from '@unhead/vue'

interface ProfileState {
  rankedOnly: boolean
}

const ranks = [1, 10, 20, 50, 100]
const tiers: Tier[] = [
  'very-easy',
  'easy',
  'medium',
  'advanced',
  'hard',
  'very-hard',
  'extreme',
  'death',
  'unfeasible',
  'impossible',
]
const recordQueryConfig = {
  map: {
    name: 'runMap',
    defaultValue: '',
    parse: (value) => getQueryValue(value) ?? '',
    serialize: (value) => value,
  },
  server: {
    name: 'runServer',
    defaultValue: '',
    parse: (value) => getQueryValue(value) ?? '',
    serialize: (value) => value,
  },
  rank: {
    name: 'runRank',
    defaultValue: undefined,
    parse: (value) => {
      const rank = Number(getQueryValue(value))
      return ranks.includes(rank) ? rank : undefined
    },
    serialize: (value) => value?.toString(),
  },
  tier: {
    name: 'runTier',
    defaultValue: undefined,
    parse: (value) => {
      const tier = getQueryValue(value) as Tier
      return tiers.includes(tier) ? tier : undefined
    },
    serialize: (value) => value,
  },
  points: {
    name: 'runPoints',
    defaultValue: undefined,
    parse: (value) => {
      const points = Number(getQueryValue(value))
      return Number.isInteger(points) && points >= 0 && points <= 10 ? points : undefined
    },
    serialize: (value) => value?.toString(),
  },
  sort_by: {
    name: 'runSortBy',
    defaultValue: 'submission-date',
    parse: (value) => {
      const sortBy = getQueryValue(value)
      return sortBy === 'time' || sortBy === 'submission-date' ? sortBy : undefined
    },
    serialize: (value) => value ?? 'none',
  },
  sort_order: {
    name: 'runSortOrder',
    defaultValue: 'descending',
    parse: (value) => {
      const sortOrder = getQueryValue(value)
      return sortOrder === 'ascending' || sortOrder === 'descending' ? sortOrder : undefined
    },
    serialize: (value) => value ?? 'none',
  },
} satisfies QueryStateConfig<PlayerRecordQuery>

const unfinishedQueryConfig = {
  tier: {
    name: 'unfinishedTier',
    defaultValue: undefined,
    parse: (value) => {
      const tier = getQueryValue(value) as Tier
      return tiers.includes(tier) ? tier : undefined
    },
    serialize: (value) => value,
  },
} satisfies QueryStateConfig<UnfinishedCourseQuery>

const profileStateConfig = {
  rankedOnly: {
    name: 'ranked',
    defaultValue: true,
    parse: (value) => getQueryValue(value) !== '0',
    serialize: (value) => (value ? '1' : '0'),
  },
} satisfies QueryStateConfig<ProfileState>

const route = useRoute()
const steamId = computed(() => route.params.steamId as string)
const initialRecordQuery = readQueryState<PlayerRecordQuery>(route.query, recordQueryConfig)
const initialUnfinishedQuery = readQueryState<UnfinishedCourseQuery>(route.query, unfinishedQueryConfig)
const initialProfileState = readQueryState<ProfileState>(route.query, profileStateConfig)

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
} = usePlayerProfile(steamId, {
  ...initialProfileState,
  recordQuery: initialRecordQuery,
  unfinishedQuery: initialUnfinishedQuery,
})

const profileState = reactive({ rankedOnly })

syncQueryState(profileState, profileStateConfig)
syncQueryState(recordQuery, recordQueryConfig)
syncQueryState(unfinishedQuery, unfinishedQueryConfig)

useHead({
  title: () => (profile.value ? `${profile.value.name}'s profile - CS2KZ` : 'Player Profile - CS2KZ'),
  meta: [
    {
      name: 'description',
      content: 'View CS2KZ player records, map completion, and performance stats.',
    },
    {
      property: 'og:title',
      content: 'Player Profile - CS2KZ',
    },
    {
      property: 'og:description',
      content: 'View CS2KZ player records, map completion, and performance stats.',
    },
    {
      property: 'og:type',
      content: 'profile',
    },
    {
      property: 'og:site_name',
      content: 'CS2KZ',
    },
  ],
})
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
