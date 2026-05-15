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
    <div
      class="grid grid-cols-[40px_1fr_auto] gap-3 px-4 py-2 border-b border-gray-700 text-sm font-semibold text-gray-500"
    >
      <span>#</span>
      <span>{{ $t('leaderboards.title.player') }}</span>
      <span>{{ $t('leaderboards.wrs.count') }}</span>
    </div>

    <ul class="divide-y divide-gray-800">
      <li
        v-for="(entry, index) in leaderboard"
        :key="entry.player.id"
        class="grid grid-cols-[40px_1fr_auto] h-12 gap-3 px-4 py-2 items-center"
      >
        <span class="text-gray-400">
          {{ index + 1 }}
        </span>
        <RouterLink
          :to="`/profile/${entry.player.id}`"
          class="truncate text-cyan-500 hover:text-cyan-400 transition-colors"
        >
          {{ entry.player.name || $t('common.unknown') }}
        </RouterLink>

        <button
          type="button"
          class="inline-flex rounded-md text-amber-400 px-2 py-1 hover:bg-amber-400/10 transition-colors cursor-pointer"
          @click="emits('openDrawer', entry.player.id)"
        >
          <p class="text-right font-semibold">{{ entry.count }}</p>
          <IconMedalFirst />
        </button>
      </li>
    </ul>
  </div>
</template>
