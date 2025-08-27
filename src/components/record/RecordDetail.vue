<script setup lang="ts">
import { computed } from 'vue'
import type { Record } from '@/types'
import { getTierColor, getTierNumber, formatTime, toLocal, seperateThousands, isNubRecord } from '@/utils'

const filterTier = computed(() => {
  const key = isNubRecord(props.record) ? 'nub_tier' : 'pro_tier'
  return props.record.course[key]
})

const props = defineProps<{
  type: 'records' | 'profile-runs' | 'course-ranking'
  record: Record
}>()
</script>

<template>
  <div class="flex items-center gap-3 text-gray-300">
    <TheImage
      v-if="type === 'records' || type === 'profile-runs'"
      :src="`https://github.com/kzglobalteam/cs2kz-images/raw/public/webp/medium/${record.map.name}/1.webp`"
      class="w-64 h-36 rounded-md ring-1 ring-slate-400"
    />
    <div class="grid grid-cols-[1fr_1fr_1fr_1fr] gap-x-10 gap-y-3">
      <div v-if="type === 'records' || type === 'profile-runs'" class="grid-item">
        <p class="item-key">{{ $t('records.title.map') }}:</p>
        <RouterLink :to="`/maps/${record.map.name}`" class="text-slate-300 font-semibold hover:text-slate-200">
          {{ record.map.name }}
        </RouterLink>
      </div>

      <div v-if="type === 'records' || type === 'profile-runs'" class="grid-item">
        <p class="item-key">{{ $t('records.title.course') }}:</p>
        <RouterLink :to="`/maps/${record.map.name}?course=${record.course.name}`" class="hover:text-slate-300">
          {{ record.course.name }}
        </RouterLink>
      </div>

      <div v-if="type === 'records' || type === 'profile-runs'" class="grid-item col-span-2">
        <p class="item-key">{{ $t('records.title.tier') }}:</p>
        <p class="font-medium" :style="{ color: getTierColor(filterTier) }">
          {{ getTierNumber(filterTier) }}
        </p>
      </div>

      <div class="grid-item">
        <p class="item-key">{{ $t('records.title.player') }}:</p>
        <RouterLink :to="`/profile/${record.player.id}`" class="text-cyan-600 whitespace-nowrap hover:text-cyan-400">
          {{ record.player.name }}
        </RouterLink>
      </div>

      <div class="grid-item">
        <p class="item-key">{{ $t('records.title.time') }}:</p>
        <p class="text-slate-300">{{ formatTime(record.time) }}</p>
      </div>

      <div class="grid-item col-span-2">
        <p class="item-key whitespace-nowrap">{{ $t('records.title.date') }}:</p>
        <p class="whitespace-nowrap">{{ toLocal(record.created_at) }}</p>
      </div>

      <div class="grid-item">
        <p class="item-key">{{ $t('records.title.teleports') }}:</p>
        <p>{{ record.teleports }}</p>
      </div>

      <div class="grid-item col-span-3">
        <p class="item-key">{{ $t('records.title.server') }}:</p>
        <p class="italic">{{ record.server.name }}</p>
      </div>

      <div class="grid-item">
        <p class="item-key">{{ $t('records.title.nubRank') }}:</p>
        <p>{{ record.nub_rank || '-' }}</p>
      </div>

      <div class="grid-item">
        <p class="item-key">{{ $t('records.title.nubPoints') }}:</p>
        <p>{{ record.nub_points ? seperateThousands(record.nub_points) : '-' }}</p>
      </div>

      <div class="grid-item">
        <p class="item-key">{{ $t('records.title.proRank') }}:</p>
        <p>{{ record.pro_rank || '-' }}</p>
      </div>

      <div class="grid-item">
        <p class="item-key">{{ $t('records.title.proPoints') }}:</p>
        <p>{{ record.pro_points ? seperateThousands(record.pro_points) : '-' }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.item-key {
  color: rgb(78, 85, 95);
}
</style>
