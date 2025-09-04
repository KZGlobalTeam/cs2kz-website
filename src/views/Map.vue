<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import type { Map, Course, CS2Filters } from '@/types'
import { useRoute, useRouter } from 'vue-router'
import { useRecords } from '@/composables/records'
import { api, getTierColor, getTierNumber, modeMap } from '@/utils'

type CS2Modes = 'ckz' | 'vnl'

const route = useRoute()
const router = useRouter()

const playerStore = usePlayerStore()

const mapStateColorMap = {
  wip: 'text-yellow-400 bg-yellow-300/50',
  pending: 'text-orange-400 bg-orange-300/50',
  approved: 'text-green-400 bg-green-300/50',
  completed: 'text-blue-400 bg-blue-300/50',
  graveyard: 'text-gray-400 bg-gray-400',
}

const map = ref<Map | null>(null)

const currentCourse = ref<Course | null>(null)

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
  query,
  total,
  incrementRecords,
} = useRecords({
  sort_by: 'time',
  sort_order: 'ascending',
  limit: 100,
  course: currentCourse.value?.id,
})

const { records: playerRecords, query: playerQuery } = useRecords({
  course: currentCourse.value?.id,
  player: playerStore.player?.id,
})

watch(
  () => route.params.course,
  (course) => {
    if (course) {
      const foundCourse = map.value?.courses.find((c) => c.local_id === Number(course))

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
    query.course = c.id
    playerQuery.course = c.id
  }
})

async function getMap() {
  try {
    const { data } = await api.get(`/maps`, { params: { name: route.params.name as string } })

    if (data.total === 0) {
      return
    }

    map.value = data.values[0] as Map

    if (route.params.course) {
      const foundCourse = map.value.courses.find((course) => course.local_id === Number(route.params.course))

      if (!foundCourse) {
        router.replace({ name: 'NotFound' })
      } else {
        currentCourse.value = foundCourse
      }
    } else {
      router.replace({ name: 'NotFound' })
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
        :src="`https://github.com/kzglobalteam/cs2kz-images/raw/public/webp/medium/${map.name}/${currentCourse.local_id}.webp`"
      />

      <div class="flex flex-col lg:h-[288px] lg:justify-between">
        <div>
          <!-- map name and workshop link -->
          <div class="flex items-center gap-2">
            <span class="text-3xl lg:text-5xl text-gray-200 font-medium">{{ map.name }}</span>
          </div>

          <div class="flex items-center gap-2 mt-2">
            <span :class="mapStateColorMap[map.state]" class="px-2 py-[0.1rem] text-lg rounded-sm">
              {{ $t(`map.state.${map.state}`) }}
            </span>
            <UButton
              square
              color="neutral"
              variant="outline"
              :to="`https://steamcommunity.com/sharedfiles/filedetails/?id=${map.workshop_id}`"
              target="_blank"
            >
              <IconSteam class="w-5 h-5" />
            </UButton>
          </div>

          <!-- mappers -->
          <div class="flex flex-wrap items-center text-xl mt-2">
            <span class="text-gray-400 mr-1">{{ `${$t('map.madeBy')}:` }}</span>
            <div v-for="(mapper, index) in currentCourse.mappers" :key="mapper.id">
              <RouterLink :to="`/profile/${mapper.id}`" class="text-cyan-500 hover:text-cyan-400">
                {{ mapper.name }}
              </RouterLink>
              <span v-if="index < currentCourse.mappers.length - 1" class="text-gray-300 mr-1">,</span>
            </div>
          </div>
        </div>

        <!-- courses -->
        <div class="flex flex-wrap gap-2 mt-2 lg:mt-0 text-lg">
          <div
            v-for="course in map.courses"
            :key="course.name"
            :class="{
              'text-gray-300 bg-gray-600': course.name === currentCourse.name,
              'text-gray-400 bg-gray-800': course.name !== currentCourse.name,
            }"
            class="group flex items-center gap-1 cursor-pointer hover:bg-gray-600 hover:text-gray-300 border-gray-400 rounded-md px-1"
            @click="router.push(`/maps/${map.name}/${course.local_id}`)"
          >
            <div
              class="w-2 h-2 rounded-full"
              :style="{
                backgroundColor: (course.filters as CS2Filters)[modeMap[query.mode] as CS2Modes].ranked
                  ? '#05df72'
                  : '#d1d5dc',
              }"
            ></div>

            <span
              :style="{
                color: getTierColor(
                  query.pro
                    ? (course.filters as CS2Filters)[modeMap[query.mode] as CS2Modes].pro_tier
                    : (course.filters as CS2Filters)[modeMap[query.mode] as CS2Modes].nub_tier,
                ),
              }"
              >{{
                query.pro
                  ? getTierNumber((course.filters as CS2Filters)[modeMap[query.mode] as CS2Modes].pro_tier)
                  : getTierNumber((course.filters as CS2Filters)[modeMap[query.mode] as CS2Modes].nub_tier)
              }}</span
            >
            <span
              class="group-hover:text-gray-400"
              :class="currentCourse.name === course.name ? 'text-gray-400' : 'text-gray-600'"
              >/</span
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
      <RankCard v-if="worldRecord" :record="worldRecord" :pro="query.pro" />
      <RankCard
        v-if="playerRecord && playerRecord.player.id !== worldRecord?.player.id"
        :record="playerRecord"
        :pro="query.pro"
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
