<script setup lang="ts">
import { useMaps } from '@/composables/maps'
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const { maps, loading, query } = useMaps()
const router = useRouter()

const filteredMaps = computed(() => {
  return maps.value
    .map((map) => {
      return {
        ...map,
        courses: map.courses.filter((course) => {
          const tier = course.filters[query.mode][query.leaderboardType === 'overall' ? 'nub_tier' : 'pro_tier']
          return query.tier === undefined ? true : tier === query.tier
        }),
      }
    })
    .filter((map) => map.courses.length > 0)
})

const goToRandomMap = () => {
  if (filteredMaps.value.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredMaps.value.length)
    const randomMap = filteredMaps.value[randomIndex]
    router.push(`/maps/${randomMap.name}`)
  }
}
</script>

<template>
  <Main>
    <MapQuery v-model:query="query" @random-click="goToRandomMap" />

    <div v-if="loading" class="mt-8 flex justify-center">
      <IconLoading class="inline" />
    </div>

    <div v-else-if="maps.length > 0" class="overflow-y-visible">
      <MapTiles :query="query" :loading="loading" :maps="maps" />
    </div>

    <div v-else class="mt-8 flex justify-center">
      <p class="text-gray-500">
        {{ $t('common.noData') }}
      </p>
    </div>
  </Main>
</template>
