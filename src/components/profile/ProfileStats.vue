<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Mode, Player } from '@/types'
import { usePlayerProgression } from '@/composables/player-progression'

const props = defineProps<{
  steamId: string
  mode: Mode
  profile: Player | null
}>()

const { t } = useI18n()

const { loading, error, stats } = usePlayerProgression(
  () => props.steamId,
  () => props.mode,
  () => (props.mode === 'classic' ? props.profile?.ckz_rating : props.profile?.vnl_rating) ?? null,
)
</script>

<template>
  <div class="grid grid-cols-1 xl:grid-cols-2 gap-3 mb-3">
    <template v-if="loading">
      <div class="p-4 border border-zinc-700 rounded-md h-72 flex justify-center items-center">
        <IconLoading />
      </div>
      <div class="p-4 border border-zinc-700 rounded-md h-72 flex justify-center items-center">
        <IconLoading />
      </div>
    </template>

    <div v-else-if="error" class="xl:col-span-2 p-4 border border-zinc-700 rounded-md text-gray-500">
      {{ t('profile.loadError') }}
    </div>

    <template v-else>
      <ProfileRankJourney :stats="stats" />
      <ProfileActivityMap :stats="stats" />
    </template>
  </div>
</template>
