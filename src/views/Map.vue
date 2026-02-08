<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import type { Map, Course } from '@/types'
import { useRoute, useRouter } from 'vue-router'
import { useRecords } from '@/composables/records'
import { api, getTierColor, getTierNumber } from '@/utils'

const route = useRoute()
const router = useRouter()

const playerStore = usePlayerStore()

const mapStateColorMap = {
  'in-testing': 'text-orange-400 bg-orange-300/50',
  approved: 'text-green-400 bg-green-300/50',
  invalid: 'text-gray-400 bg-gray-400',
}

const map = ref<Map | null>(null)

const currentCourse = ref<Course | null>(null)

const activeCourseNumber = computed(() => {
  if (map.value && currentCourse.value) {
    return map.value.courses.findIndex((c) => c.name === currentCourse.value?.name) + 1
  } else {
    return 0
  }
})

const worldRecord = computed(() => (records.value.length > 0 ? records.value[0] : null))
const playerRecord = computed(() => {
  if (playerStore.player) {
    return playerRecords.value.length > 0 ? playerRecords.value[0] : null
  } else {
    return null
  }
})

await getMap()

const {
  records,
  loading: loadingRecords,
  total,
  query,
  incrementRecords,
} = useRecords({
  sort_by: 'time',
  sort_order: 'ascending',
  limit: 100,
  map: map.value?.name,
  course: currentCourse.value?.name,
})

const { records: playerRecords, query: playerQuery } = useRecords({
  map: map.value?.name,
  course: currentCourse.value?.name,
  player: playerStore.player?.id,
})

watch(
  () => route.query.course,
  (course) => {
    if (course) {
      const foundCourse = map.value?.courses.find((c) => c.name === course)

      if (!foundCourse) {
        router.replace({ name: 'NotFound' })
      } else {
        currentCourse.value = foundCourse
      }
    }
  },
)

watch(currentCourse, (c) => {
  if (c) {
    route.query.course = c.name
    query.course = c.name
    playerQuery.course = c.name
  }
})

async function getMap() {
  try {
    const { data } = await api.get(`/maps`, { params: { name: route.params.name as string } })

    if (data.total === 0) {
      return
    }

    map.value = data.values[0] as Map

    if (route.query.course) {
      const foundCourse = map.value.courses.find((course) => course.name === route.query.course)

      if (!foundCourse) {
        router.replace({ name: 'NotFound' })
      } else {
        currentCourse.value = foundCourse
      }
    } else {
      currentCourse.value = map.value.courses[0]
    }
  } catch (error) {
    console.log('[fetch error]', error)
    router.replace({ name: 'NotFound' })
  }
}
</script>

<template>
  <div v-if="map !== null && currentCourse !== null" class="max-w-6xl mx-auto px-2 lg:px-10 py-2 lg:py-4">
    <MainSwitch />

    <div class="flex flex-col xl:flex-row items-start gap-4 mt-4">
      <TheImage
        class="rounded-md ring-2 ring-blue-600/40"
        :src="`https://github.com/kzglobalteam/cs2kz-images/raw/public/webp/medium/${map.name}/${activeCourseNumber}.webp`"
      />

      <div class="flex flex-col lg:h-[288px] lg:justify-between">
        <div>
          <!-- map name and workshop link -->
          <div class="flex items-center gap-2">
            <span class="text-2xl lg:text-4xl text-gray-200 font-medium">{{ map.name }}</span>
          </div>

          <div class="flex items-center gap-2 mt-2">
            <span :class="mapStateColorMap[map.state]" class="px-2 py-[0.05rem] rounded-sm">
              {{ $t(`map.state.${map.state}`) }}
            </span>
            <UButton
              square
              color="neutral"
              variant="outline"
              :to="`https://steamcommunity.com/sharedfiles/filedetails/?id=${map.workshop_id}`"
              target="_blank"
            >
              <IconSteam class="w-4 h-4" />
            </UButton>
          </div>

          <!-- mappers -->
          <div class="flex flex-wrap items-center mt-2">
            <span class="text-gray-400 mr-1">{{ `${$t('map.madeBy')}:` }}</span>
            <div v-for="(mapper, index) in currentCourse.mappers" :key="mapper.id">
              <RouterLink :to="`/profile/${mapper.id}`" class="text-cyan-500 hover:text-cyan-400">
                {{ mapper.name }}
              </RouterLink>
              <span v-if="index < currentCourse.mappers.length - 1" class="text-gray-400 mr-1">,</span>
            </div>
          </div>
        </div>

        <!-- courses -->
        <div class="flex flex-wrap gap-2 mt-2 lg:mt-0">
          <div
            v-for="course in map.courses"
            :key="course.name"
            :class="{
              'text-gray-300 bg-gray-600': course.name === currentCourse.name,
              'text-gray-400 bg-gray-800': course.name !== currentCourse.name,
            }"
            class="group flex items-center gap-1 cursor-pointer hover:bg-gray-600 hover:text-gray-300 border-gray-400 rounded-md px-1"
            @click="router.push({ path: `/maps/${map.name}`, query: { course: course.name } })"
          >
            <div
              class="w-2 h-2 rounded-full"
              :style="{
                backgroundColor: course.filters[query.mode].state === 'ranked' ? '#05df72' : '#d1d5dc',
              }"
            ></div>

            <span
              :style="{
                color: getTierColor(
                  query.leaderboardType === 'pro'
                    ? course.filters[query.mode].pro_tier
                    : course.filters[query.mode].nub_tier,
                ),
              }"
              >{{
                query.leaderboardType === 'pro'
                  ? getTierNumber(course.filters[query.mode].pro_tier)
                  : getTierNumber(course.filters[query.mode].nub_tier)
              }}</span
            >
            <span
              class="group-hover:text-gray-400"
              :class="currentCourse.name === course.name ? 'text-gray-400' : 'text-gray-600'"
              >|</span
            >
            <span>{{ course.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ranking filters -->
    <p class="mt-4 text-2xl lg:text-3xl font-semibold">Course Ranking</p>

    <!-- ranking -->
    <div class="mt-2">
      <RankCard v-if="worldRecord" :record="worldRecord" :leaderboard-type="query.leaderboardType" :total="total" />
      <RankCard
        v-if="playerRecord && playerRecord.player.id !== worldRecord?.player.id"
        :record="playerRecord"
        :leaderboard-type="query.leaderboardType"
        :total="total"
        class="mt-2"
      />
      <RecordTable
        v-model:query="query"
        type="course-ranking"
        :loading="loadingRecords"
        :total="total"
        :records="records"
        @intersect="incrementRecords"
        class="mt-2 max-h-[90dvh]"
      />
    </div>
  </div>
</template>
