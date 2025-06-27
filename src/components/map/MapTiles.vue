<script setup lang="ts">
import type { CS2Filters, Map, MapQuery } from '@/types'
import { computed } from 'vue'
import { getTierColor, getTierNumber } from '@/utils'

const props = defineProps<{
  maps: Map[]
  loading: boolean
  query: MapQuery
}>()

const modeMap = {
  classic: 'ckz',
  'vanilla-cs2': 'vnl',
  kztimer: 'kzt',
  simplekz: 'skz',
  'vanilla-csgo': 'vnl',
}

type CS2Modes = 'ckz' | 'vnl'

const transformedMaps = computed(() =>
  props.maps
    .map((map) => {
      return {
        id: map.id,
        name: map.name,
        state: map.state,
        creator: map.created_by,
        courses: map.courses
          .map((course) => {
            const modeKey = modeMap[props.query.mode] as CS2Modes

            const tier = (course.filters as CS2Filters)[modeKey][props.query.pro ? 'nub_tier' : 'pro_tier']

            return {
              name: course.name,
              tier,
              tierNo: getTierNumber(tier),
              tierColor: getTierColor(tier),
              ranked: (course.filters as CS2Filters)[modeKey].ranked,
            }
          })
          .filter((course) => (props.query.tier === undefined ? true : course.tier === props.query.tier))
          .sort((a, b) => a.tierNo - b.tierNo),
        created_at: map.created_at,
      }
    })
    .filter((map) => map.courses.length > 0),
)
</script>

<template>
  <div class="mt-8 p-1 mx-auto w-max">
    <div class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-10 lg:place-items-center">
      <MapCard v-for="map in transformedMaps" :key="map.id" :query="query" :map="map" />
    </div>
  </div>
</template>
