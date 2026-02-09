<script setup lang="ts">
import type { MapCard, MapQuery } from '@/types'
import { toLocal } from '@/utils'

defineProps<{
  query: MapQuery
  map: MapCard
}>()
</script>

<template>
  <div class="relative w-max rounded-md ring ring-blue-600/40 hover:ring-blue-600 hover:ring-2 hover:rounded-b-md">
    <div class="flex items-center">
      <RouterLink :to="`/maps/${map.name}`">
        <TheImage
          class="w-64 h-36 rounded-bl-md rounded-tl-md cursor-pointer"
          :src="`https://github.com/kzglobalteam/cs2kz-images/raw/public/webp/medium/${map.name}/1.webp`"
      /></RouterLink>

      <div
        class="w-56 h-36 px-1 pb-1 flex flex-col justify-between rounded-tr-md rounded-br-md relative bg-[length:200%_200%] bg-center before:content-[''] before:absolute before:inset-0 before:rounded-tr-md before:rounded-br-md before:bg-gradient-to-r before:from-[rgba(46,46,46,1)] before:to-[rgba(46,46,46,0.6)] before:z-0 before:transition-all"
      >
        <div class="relative w-full h-full">
          <div class="flex flex-col justify-between h-full">
            <div>
              <p class="text-gray-100 font-semibold">{{ map.name }}</p>

              <div class="mb-1">
                <IconHammer class="inline mr-1" :width="1" />

                <span class="max-w-30 truncate leading-4" v-for="(mapper, index) in map.mappers" :key="mapper.id">
                  <RouterLink :to="`/profile/${mapper.id}`" class="text-sm text-cyan-600 hover:text-cyan-400">
                    {{ mapper.name }}
                  </RouterLink>
                  <span v-if="index < map.mappers.length - 1" class="text-gray-400 mr-1">,</span></span
                >
              </div>
              <div class="flex items-center gap-1">
                <IconDate />
                <span class="text-xs text-gray-300">
                  {{ toLocal(map.approved_at).slice(0, 10) }}
                </span>
              </div>
            </div>

            <div class="courses flex flex-wrap gap-1 max-h-32 overflow-auto">
              <div v-for="course in map.courses" :key="course.name">
                <RouterLink
                  :to="`/maps/${map.name}?course=${course.name}`"
                  class="w-max px-1 flex justify-center items-center gap-1 text-xs rounded-sm border border-gray-600 bg-gray-700/80 hover:bg-gray-600 cursor-pointer"
                >
                  <span
                    class="inline-block w-2 h-2 rounded-full"
                    :style="{ backgroundColor: course.state === 'ranked' ? '#05df72' : '#d1d5dc' }"
                  ></span>
                  <span
                    :style="{
                      color: course.tierColor,
                    }"
                    >{{ course.tierNo }}</span
                  >
                  <span>{{ course.name }}</span>
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css">
.courses::-webkit-scrollbar {
  width: 2px;
  height: 2px;
}

.courses::-webkit-scrollbar-track {
  background: #212121;
}

.courses::-webkit-scrollbar-thumb {
  background: #343434;
  border-radius: 5px;
}

.courses::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
