<script setup lang="ts">
import { ref } from 'vue'
import type { MapCard, MapQuery } from '@/types'
import { useRouter } from 'vue-router'
import { toLocal } from '@/utils'

const router = useRouter()

const currentCourseName = ref('')

defineProps<{
  query: MapQuery
  map: MapCard
}>()
</script>

<template>
  <div class="relative w-max rounded-md ring ring-blue-600/40 hover:ring-blue-600 hover:ring-2 hover:rounded-b-md">
    <div class="flex items-center">
      <div class="relative hidden lg:block">
        <TheImage
          class="w-64 h-36 rounded-bl-md rounded-tl-md cursor-pointer"
          :src="`https://github.com/kzglobalteam/cs2kz-images/raw/public/webp/medium/${map.name}/1.webp`"
          @click="router.push({ path: `/maps/${map.name}/1` })"
        />
        <IconCheckOutline class="absolute top-1 left-1" v-if="map.state === 'approved'" />
      </div>

      <div
        class="w-56 h-36 px-1 pb-1 flex flex-col justify-between rounded-tr-md rounded-br-md relative bg-[length:200%_200%] bg-center before:content-[''] before:absolute before:inset-0 before:rounded-tr-md before:rounded-br-md before:bg-gradient-to-r before:from-[rgba(46,46,46,1)] before:to-[rgba(46,46,46,0.6)] before:z-0 before:transition-all"
      >
        <div class="relative w-full h-full">
          <div class="flex flex-col justify-between h-full">
            <div>
              <p class="text-gray-100 font-semibold">{{ map.name }}</p>

              <div class="flex items-center gap-2 mb-1">
                <div class="flex items-center gap-1">
                  <IconHammer />
                  <div class="flex flex-wrap items-center text-sm">
                    <span class="text-gray-400 mr-1">{{ $t('map.madeBy') }}:</span>
                    <div v-for="(mapper, index) in map.mappers" :key="mapper.id">
                      <RouterLink :to="`/profile/${mapper.id}`" class="text-cyan-600 hover:text-cyan-400">
                        {{ mapper.name }}
                      </RouterLink>
                      <span v-if="index < map.mappers.length - 1" class="text-gray-400 mr-1">,</span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-1">
                  <IconDate />
                  <span class="text-xs text-gray-300">
                    {{ toLocal(map.approved_at).slice(0, 10) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-1">
              <div v-for="course in map.courses" :key="course.name">
                <div
                  class="w-max px-1 flex justify-center items-center gap-1 text-xs rounded-sm border border-gray-600 bg-gray-700/80 hover:bg-gray-600 cursor-pointer"
                  @click="router.push({ path: `/maps/${map.name}`, query: { course: course.name } })"
                  @mouseenter="currentCourseName = course.name"
                >
                  <div
                    class="w-2 h-2 rounded-full"
                    :style="{ backgroundColor: course.state === 'ranked' ? '#05df72' : '#d1d5dc' }"
                  ></div>
                  <span
                    :style="{
                      color: course.tierColor,
                    }"
                    >{{ course.tierNo }}</span
                  >
                  <span class="max-w-20 truncate">{{ course.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
