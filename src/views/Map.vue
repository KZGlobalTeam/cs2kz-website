<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useCourseQueryStore } from '@/stores/course-query'
import { usePlayerStore } from '@/stores/player'
import type { Map, Course, CS2Filters } from '@/types'
import { useRoute, useRouter } from 'vue-router'
import { useRecords } from '@/composables/records'
import { api, getTierColor, getTierNumber } from '@/utils'
import ModeSwitcher from '@/components/ModeSwitcher.vue'

const modeMap = {
  classic: 'ckz',
  'vanilla-cs2': 'vnl',
  kztimer: 'kzt',
  simplekz: 'skz',
  'vanilla-csgo': 'vnl',
}

type CS2Modes = 'ckz' | 'vnl'

const route = useRoute()
const router = useRouter()

const playerStore = usePlayerStore()

const courseQueryStore = useCourseQueryStore()

const mapStateColorMap = {
  wip: 'text-yellow-400 bg-yellow-300/50',
  pending: 'text-orange-400 bg-orange-300/50',
  approved: 'text-green-400 bg-green-300/50',
  completed: 'text-blue-400 bg-blue-300/50',
  graveyard: 'text-gray-400 bg-gray-400',
}

const activeCourseName = ref<string>()

const map = ref<Map | 'pending' | null>('pending')

const course = ref<Course | null>(null)

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
  course: course.value?.id,
  mode: courseQueryStore.mode,
  pro: courseQueryStore.pro,
})

const { records: playerRecords, query: playerQuery } = useRecords({
  course: course.value?.id,
  mode: courseQueryStore.mode,
  pro: courseQueryStore.pro,
  player: playerStore.player?.id,
})

watch(query, (newBaseQuery) => {
  playerQuery.course = newBaseQuery.course
  playerQuery.mode = newBaseQuery.mode
  playerQuery.pro = newBaseQuery.pro
})

watch(activeCourseName, (name) => {
  course.value = (map.value as Map).courses.find((course) => course.name === name)!
  query.course = course.value.id
})

async function getMap() {
  try {
    const { data } = await api.get(`/maps`, { params: { name: route.params.name as string } })

    if (data.total === 0) return

    map.value = data.values[0] as Map

    if (courseQueryStore.courseId !== -1) {
      course.value = map.value.courses.find((course) => course.id === courseQueryStore.courseId)!
    } else {
      course.value = map.value.courses[0]!
    }

    activeCourseName.value = course.value.name
  } catch (error) {
    console.log('[fetch error]', error)
    map.value = null
    router.replace({ name: 'NotFound' })
  }
}
</script>

<template>
  <div v-if="map !== 'pending' && map !== null && course !== null" class="max-w-6xl mx-auto px-2 lg:px-10 py-2 lg:py-4">
    <ModeSwitcher v-model:mode="query.mode" />

    <div class="flex flex-col xl:flex-row items-start gap-4 mt-4">
      <TheImage
        class="rounded-md ring-2 ring-blue-600/40"
        :src="`https://github.com/kzglobalteam/cs2kz-images/raw/public/webp/medium/${map.name}/1.webp`"
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
            <div v-for="(mapper, index) in course.mappers" :key="mapper.id">
              <RouterLink :to="`/profile/${mapper.id}`" class="text-cyan-500 hover:text-cyan-400">
                {{ mapper.name }}
              </RouterLink>
              <span v-if="index < course.mappers.length - 1" class="text-gray-300 mr-1">,</span>
            </div>
          </div>
        </div>

        <!-- courses -->
        <div class="flex flex-wrap gap-2 mt-2 lg:mt-0 text-lg">
          <div
            v-for="course in map.courses"
            :key="course.name"
            :class="{
              'text-gray-300 bg-gray-600': course.name === activeCourseName,
              'text-gray-400 bg-gray-800': course.name !== activeCourseName,
            }"
            class="group flex items-center gap-1 cursor-pointer hover:bg-gray-600 hover:text-gray-300 border-gray-400 rounded-md px-1"
            @click="activeCourseName = course.name"
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
              :class="course.name === activeCourseName ? 'text-gray-400' : 'text-gray-600'"
              >/</span
            >
            <span>{{ course.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ranking filters -->
    <div class="mt-4 pt-2 flex justify-between lg:justify-start items-center gap-4">
      <p class="text-2xl lg:text-3xl font-semibold">Course Ranking</p>
      <UButtonGroup orientation="horizontal">
        <UButton
          size="sm"
          :variant="query.pro ? 'outline' : 'solid'"
          :label="$t('common.leaderboardType.overall')"
          @click="query.pro = false"
        />
        <UButton
          size="sm"
          :variant="query.pro ? 'solid' : 'outline'"
          :label="$t('common.leaderboardType.pro')"
          @click="query.pro = true"
        />
      </UButtonGroup>
    </div>

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
