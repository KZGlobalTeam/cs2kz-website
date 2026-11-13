<script setup lang="ts">
import type { MapCard, MapQuery } from '@/types'
import { toLocal } from '@/utils'
import { computed } from 'vue'

const props = defineProps<{
  query: MapQuery
  map: MapCard
}>()

const rankedCourses = computed(() => {
  return props.map.courses.filter((course) => course.state === 'ranked')
})

const unrankedCourses = computed(() => {
  return props.map.courses.filter((course) => course.state === 'unranked')
})
</script>

<template>
  <div class="relative w-max rounded-md ring ring-zinc-600/80 hover:ring-blue-600 hover:ring-2 hover:rounded-b-md">
    <div class="flex items-center">
      <RouterLink :to="`/maps/${map.name}`">
        <TheImage
          class="w-36 lg:w-64 h-36 object-cover rounded-bl-md rounded-tl-md cursor-pointer"
          :src="`https://github.com/kzglobalteam/cs2kz-images/raw/public/webp/medium/${map.name}/1.webp`"
          alt="Map Image"
      /></RouterLink>

      <div
        class="w-52 lg:w-64 h-36 px-1 pb-1 flex flex-col justify-between rounded-tr-md rounded-br-md relative bg-size-[200%_200%] bg-center before:content-[''] before:absolute before:inset-0 before:rounded-tr-md before:rounded-br-md before:bg-gradient-to-r before:from-[rgba(46,46,46,1)] before:to-[rgba(46,46,46,0.6)] before:z-0 before:transition-all"
      >
        <div class="relative w-full h-full">
          <div class="flex flex-col justify-between h-full">
            <div>
              <p class="text-gray-100 font-semibold">{{ map.name }}</p>

              <div class="my-1 leading-0">
                <IconHammer class="inline mr-1 mb-1" :width="1" />

                <div class="inline-flex flex-wrap items-center" v-for="(mapper, index) in map.mappers" :key="mapper.id">
                  <RouterLink
                    :to="`/profile/${mapper.id}`"
                    class="max-w-36 lg:max-w-44 truncate text-sm text-cyan-600 hover:text-cyan-400 leading-none"
                  >
                    {{ mapper.name }}
                  </RouterLink>
                  <span v-if="index < map.mappers.length - 1" class="text-gray-400 mx-1">·</span>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <IconDate />
                <span class="text-xs text-gray-300">
                  {{ toLocal(map.approved_at).slice(0, 10) }}
                </span>
              </div>
            </div>
            <div class="max-w-64 overflow-x-auto list-wrapper">
              <!-- ranked courses -->
              <div v-if="query.filterState === 'ranked' || query.filterState === 'all'">
                <div class="flex items-center gap-1">
                  <span class="shrink-0 whitespace-nowrap text-sm text-muted">{{ $t('map.filterState.ranked') }}:</span>
                  <div v-for="course in rankedCourses" :key="course.name">
                    <RouterLink
                      :to="`/maps/${map.name}?course=${course.name}`"
                      class="w-max px-1 py-0.5 flex justify-center items-center gap-1 text-xs rounded-sm border border-[#05df7250] bg-zinc-700/80 hover:bg-zinc-600 cursor-pointer"
                    >
                      <span>{{ course.name }}</span>
                      <span
                        class="border rounded-sm px-0.5"
                        :style="{
                          borderColor: `${course.tierColor}70`,
                          color: course.tierColor,
                        }"
                        >T{{ course.tierNo }}</span
                      >
                    </RouterLink>
                  </div>
                </div>
              </div>

              <!-- unranked courses -->
              <div
                v-if="(query.filterState === 'unranked' || query.filterState === 'all') && unrankedCourses.length > 0"
                class="mt-1"
              >
                <div class="flex items-center gap-1">
                  <span class="shrink-0 whitespace-nowrap text-sm text-muted">
                    {{ $t('map.filterState.unranked') }}:
                  </span>
                  <div v-for="course in unrankedCourses" :key="course.name">
                    <RouterLink
                      :to="`/maps/${map.name}?course=${course.name}`"
                      class="w-max px-1 py-0.5 flex justify-center items-center gap-1 text-xs rounded-sm border border-[#d1d5dc50] bg-zinc-700/80 hover:bg-zinc-600 cursor-pointer"
                    >
                      <span>{{ course.name }}</span>
                      <span
                        class="border rounded-sm px-0.5"
                        :style="{
                          borderColor: `${course.tierColor}70`,
                          color: course.tierColor,
                        }"
                        >T{{ course.tierNo }}</span
                      >
                    </RouterLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
