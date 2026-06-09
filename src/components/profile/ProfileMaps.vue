<script setup lang="ts">
import type { Map } from '@/types'

defineProps<{
  maps: Map[]
}>()
</script>

<template>
  <div v-if="maps.length > 0" class="text-gray-300">
    <p class="text-3xl font-semibold mb-2">
      {{ $t('profile.maps.title') }}
    </p>

    <div class="p-4 border border-gray-700 rounded-md">
      <div class="grid grid-cols-[repeat(auto-fill,13rem)] justify-between gap-4">
        <RouterLink
          v-for="map in maps"
          :key="map.id"
          :to="`/maps/${map.name}`"
          class="group rounded-md overflow-hidden ring ring-blue-600/40 hover:ring-blue-600 hover:ring-2 transition"
        >
          <TheImage
            class="w-full h-28 object-cover"
            :src="`https://github.com/kzglobalteam/cs2kz-images/raw/public/webp/medium/${map.name}/1.webp`"
            alt="Map Image"
          />
          <div class="px-2 py-1 bg-gray-800">
            <p class="text-sm text-gray-100 font-semibold truncate">{{ map.name }}</p>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
