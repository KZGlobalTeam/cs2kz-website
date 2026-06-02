<script setup lang="ts">
import type { UnfinishedMapRow } from '@/types'

defineProps<{
  maps: UnfinishedMapRow[]
  loading: boolean
}>()
</script>

<template>
  <div class="border border-gray-700 rounded-md overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-700 text-gray-300">
        <thead class="bg-gray-900/70">
          <tr>
            <th class="w-72 px-4 py-3 text-left text-sm font-semibold text-gray-100">
              {{ $t('records.title.map') }}
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-100">
              {{ $t('profile.unfinished.table.courses') }}
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-700 bg-gray-950/30">
          <tr v-if="loading">
            <td colspan="2" class="px-4 py-6">
              <div class="flex justify-center items-center">
                <IconLoading />
              </div>
            </td>
          </tr>

          <tr v-else-if="maps.length === 0">
            <td colspan="2" class="px-4 py-6 text-center text-gray-400">
              {{ $t('common.noData') }}
            </td>
          </tr>

          <tr v-for="map in maps" v-else :key="map.id">
            <td class="px-4 py-2 align-center">
              <RouterLink
                :to="`/maps/${map.name}`"
                class="group flex items-center gap-3 text-slate-300 hover:text-slate-200"
              >
                <TheImage
                  :src="`https://github.com/kzglobalteam/cs2kz-images/raw/public/webp/thumbnail/${map.name}/1.webp`"
                  class="w-24 h-auto object-cover rounded-sm ring-1 ring-gray-700 shrink-0"
                />
                <span class="font-semibold text-lg">{{ map.name }}</span>
              </RouterLink>
            </td>
            <td class="px-4 py-4 align-center">
              <ProfileUnfinishedCourseTags :map-name="map.name" :courses="map.courses" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
