<script setup lang="ts">
import type { MapCard, MapQuery } from '@/types'
import { toLocal } from '@/utils'
import { computed, ref, watch } from 'vue'
import { useElementSize } from '@vueuse/core'
import { getPlayerAvatar, queuePlayerAvatars } from '@/composables/steam-avatars'

const props = defineProps<{
  query: MapQuery
  map: MapCard
}>()

// mappers are shown as overlapping avatars, so only as many as fit are rendered
const AVATAR_SIZE = 24 // UAvatar size="xs"
const AVATAR_OVERLAP = 6 // -space-x-1.5
const AVATAR_STEP = AVATAR_SIZE - AVATAR_OVERLAP
const ITEM_GAP = 4 // gap-1
const MORE_LABEL_WIDTH = 26 // room for a "+12" label

const mapperRow = ref<HTMLElement>()
const { width: mapperRowWidth } = useElementSize(mapperRow)

const avatarsWidth = (count: number) => (count > 0 ? AVATAR_SIZE + (count - 1) * AVATAR_STEP : 0)

const visibleMapperCount = computed(() => {
  const total = props.map.mappers.length
  const available = mapperRowWidth.value

  // the row has not been measured yet, render everything and let the overflow be clipped
  if (available === 0) {
    return total
  }

  if (avatarsWidth(total) <= available) {
    return total
  }

  for (let count = total - 1; count > 0; count--) {
    if (avatarsWidth(count) + ITEM_GAP + MORE_LABEL_WIDTH <= available) {
      return count
    }
  }

  return 1
})

const visibleMappers = computed(() => props.map.mappers.slice(0, visibleMapperCount.value))

const hiddenMappers = computed(() => props.map.mappers.slice(visibleMapperCount.value))

watch(
  () => props.map.mappers.map((mapper) => mapper.id),
  (playerIds) => queuePlayerAvatars(playerIds),
  { immediate: true },
)

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

              <div class="my-1 flex items-center gap-1">
                <IconHammer class="shrink-0" :width="1" />

                <div ref="mapperRow" class="flex min-w-0 flex-1 items-center overflow-hidden">
                  <div class="flex -space-x-1.5 items-center">
                    <RouterLink
                      v-for="mapper in visibleMappers"
                      :key="mapper.id"
                      :to="`/profile/${mapper.id}`"
                      :title="mapper.name"
                      :aria-label="mapper.name"
                      class="relative inline-flex shrink-0 rounded-full ring-2 ring-[#2e2e2e]"
                    >
                      <UAvatar :src="getPlayerAvatar(mapper.id)" :alt="mapper.name" size="xs" />
                    </RouterLink>
                  </div>

                  <span
                    v-if="hiddenMappers.length > 0"
                    :title="hiddenMappers.map((mapper) => mapper.name).join(', ')"
                    class="ml-1 shrink-0 text-xs leading-none text-gray-300"
                  >
                    +{{ hiddenMappers.length }}
                  </span>
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
              <div v-if="query.filterState === 'ranked' || query.filterState === 'both'">
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
                v-if="(query.filterState === 'unranked' || query.filterState === 'both') && unrankedCourses.length > 0"
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
