<script setup lang="ts">
import type { PlayerWrEntry } from '@/composables/wrs-leaderboard'

defineProps<{
  leaderboard: PlayerWrEntry[]
}>()

const emits = defineEmits<{
  openDrawer: [playerId: string]
}>()
</script>

<template>
  <div class="overflow-auto">
    <div class="grid grid-cols-[1fr_auto] gap-3 px-4 py-2 border-b border-gray-700 text-sm font-semibold text-gray-500">
      <span>{{ $t('leaderboards.title.player') }}</span>
      <span>{{ $t('leaderboards.wrs.count') }}</span>
    </div>

    <ul class="divide-y divide-gray-800">
      <li
        v-for="entry in leaderboard"
        :key="entry.player.id"
        class="grid grid-cols-[1fr_auto] gap-3 px-4 py-3 items-center"
      >
        <RouterLink
          :to="`/profile/${entry.player.id}`"
          class="truncate text-cyan-500 hover:text-cyan-400 transition-colors"
        >
          {{ entry.player.name || $t('common.unknown') }}
        </RouterLink>

        <button
          type="button"
          class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-amber-400 hover:bg-amber-400/10 transition-colors cursor-pointer"
          @click="emits('openDrawer', entry.player.id)"
        >
          <span class="font-semibold">{{ entry.count }}</span>
          <IconMedalFirst />
        </button>
      </li>
    </ul>
  </div>
</template>
