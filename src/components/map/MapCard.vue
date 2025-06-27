<script setup lang="ts">
import type { MapCard, MapQuery } from '@/types'
import { useCourseQueryStore } from '@/stores/course-query'
import { useRouter } from 'vue-router'
import { toLocal } from '@/utils'

const router = useRouter()

const courseQueryStore = useCourseQueryStore()

const props = defineProps<{
  query: MapQuery
  map: MapCard
}>()

function goToCourse(name: string) {
  courseQueryStore.course = name
  courseQueryStore.mode = props.query.mode
  courseQueryStore.pro = props.query.pro
  router.push(`/maps/${props.map.name}`)
}
</script>

<template>
  <div
    class="card-container relative w-max rounded-md ring ring-blue-600/40 hover:ring-blue-600 hover:ring-2 hover:rounded-b-md"
  >
    <div class="flex items-center">
      <TheImage
        class="hidden lg:block w-64 h-36 rounded-bl-md rounded-tl-md cursor-pointer"
        :src="`https://github.com/kzglobalteam/cs2kz-images/raw/public/webp/medium/${map.name}/1.webp`"
        @click="goToCourse(map.courses[0].name)"
      />
      <div
        :style="{
          backgroundImage: `url(https://github.com/kzglobalteam/cs2kz-images/raw/public/webp/medium/${map.name}/1.webp)`,
        }"
        class="group w-[300px] h-36 px-2 pb-1 flex flex-col justify-between rounded-tr-md rounded-br-md relative bg-[length:200%_200%] bg-center before:content-[''] before:absolute before:inset-0 before:rounded-tr-md before:rounded-br-md before:bg-gradient-to-r before:from-[rgba(46,46,46,1)] before:to-[rgba(46,46,46,0.6)] before:z-0 before:transition-all"
      >
        <div class="relative w-full h-full">
          <div class="flex flex-col justify-between h-full group-hover:hidden">
            <div>
              <div class="flex gap-2 items-center mb-1">
                <p class="text-gray-100 text-lg font-medium">{{ map.name }}</p>

                <div
                  :class="map.state === 'approved' ? 'text-green-400 bg-green-300/20' : 'text-gray-300'"
                  class="px-1 text-xs border rounded-sm"
                >
                  {{ $t(`map.state.${map.state}`) }}
                </div>
              </div>

              <div class="flex items-center gap-1 mb-1">
                <IconDate />
                <span class="text-xs text-gray-200 leading-[14px]">
                  {{ toLocal(map.created_at).slice(0, 10) }}
                </span>
              </div>

              <div class="flex flex-wrap items-center text-sm">
                <span class="text-gray-400 mr-1">{{ $t('map.creator') }}:</span>
                <RouterLink :to="`/profile/${map.creator.id}`" class="text-cyan-600 hover:text-cyan-400">
                  {{ map.creator.name }}
                </RouterLink>
              </div>
            </div>

            <div class="flex gap-1">
              <div v-for="course in map.courses" :key="course.name">
                <div
                  :style="{
                    color: course.tierColor,
                    borderColor: course.tierColor,
                  }"
                  :class="`w-4 flex justify-center items-center text-sm rounded-[0.2rem] border bg-gray-700/50`"
                >
                  {{ course.tierNo }}
                </div>
              </div>
            </div>
          </div>

          <div
            class="hidden group-hover:block py-1 overflow-auto max-h-[144px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-thumb-rounded-md scrollbar-track-transparent"
          >
            <div
              v-for="course in map.courses"
              :key="course.name"
              class="flex items-center gap-2 p-1 hover:bg-gray-700 rounded-md cursor-pointer"
              @click="goToCourse(course.name)"
            >
              <div
                :class="course.ranked ? 'text-green-400 bg-green-300/20' : 'text-gray-300'"
                class="px-1 text-xs border rounded-sm"
              >
                {{ course.ranked ? 'RANKED' : 'UNRANKED' }}
              </div>
              <div
                :style="{
                  color: course.tierColor,
                  borderColor: course.tierColor,
                }"
                :class="`w-4 flex justify-center items-center text-xs rounded-[0.2rem] border bg-gray-700/50`"
              >
                {{ course.tierNo }}
              </div>
              <span class="text-gray-300">
                {{ course.name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* For browsers that support it */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: #4b5563 transparent;
}
/* For webkit browsers */
.scrollbar-thin::-webkit-scrollbar {
  width: 5px;
}
.scrollbar-thumb-rounded-full::-webkit-scrollbar-thumb {
  border-radius: 9999px;
}
.scrollbar-thumb-gray-600::-webkit-scrollbar-thumb {
  background-color: #4b5563;
}
.scrollbar-track-transparent::-webkit-scrollbar-track {
  background: transparent;
}
</style>
