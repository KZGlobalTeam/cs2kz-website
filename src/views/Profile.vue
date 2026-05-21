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
  recordQuery,
  records,
  loading,
  completion,
  resetRecordQuery,
  setTierFilter,
  setPointsFilter,
} = usePlayerProfile(steamId)
</script>

<template>
  <div class="hidden xl:block py-4 px-10 mx-auto text-gray-300">
    <div>
      <MainSwitch class="mb-5" />
      <ProfilePlayer class="mb-5" :profile="profile" :steam-profile="steamProfile" :mode="mode" />
    </div>

    <div class="flex gap-5">
      <div class="w-3/7">
        <ProfileCompletion
          class="mb-5"
          :completion="completion"
          :selected-tier="recordQuery.tier"
          :selected-points="recordQuery.points"
          @select-tier="setTierFilter"
          @select-points="setPointsFilter"
        />

        <ProfileMaps class="mb-5" :maps="maps" />
      </div>
      <ProfileRuns
        class="w-4/7"
        v-model:query="recordQuery"
        :records="records"
        :loading="loading"
        @reset-query="resetRecordQuery"
      />
    </div>
  </div>

  <div class="block xl:hidden py-2 px-2 max-w-5xl mx-auto text-gray-300">
    <MainSwitch class="mb-5" />
    <ProfilePlayer class="mb-5" :profile="profile" :steam-profile="steamProfile" :mode="mode" />

    <ProfileCompletion
      class="mb-5"
      :completion="completion"
      :selected-tier="recordQuery.tier"
      :selected-points="recordQuery.points"
      @select-tier="setTierFilter"
      @select-points="setPointsFilter"
    />

    <ProfileMaps class="mb-5" :maps="maps" />
    <ProfileRuns v-model:query="recordQuery" :records="records" :loading="loading" @reset-query="resetRecordQuery" />
  </div>
</template>
