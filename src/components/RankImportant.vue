<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Record, LeaderboardType } from '@/types'
import { api, formatTime, toLocal, toLocalDistance } from '@/utils'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  leaderboardType: LeaderboardType
  record: Record
}>()

const { locale } = useI18n()

const wr = computed(() => {
  if (props.leaderboardType === 'overall') {
    return props.record.nub_rank === 1
  } else {
    return props.record.pro_rank === 1
  }
})

const emits = defineEmits(['toggle'])

const avatarUrl = ref('')

watch(
  () => props.record.player.id,
  (id) => {
    getAvatar(id)
  },
  { immediate: true },
)

async function getAvatar(steamId: string) {
  try {
    const { data } = await api.get(`/players/${steamId}/steam-profile`)
    avatarUrl.value = data?.avatar_url.replace(/_medium/, '_full') || ''
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <div
    class="overflow-x-auto flex items-center gap-4 p-3 rounded-md ring-2"
    :class="
      wr
        ? 'ring-yellow-200 bg-[length:600%_600%] bg-gradient-to-br from-yellow-400/20  via-indigo-400/20 to-yellow-400/20 '
        : 'ring-gray-700'
    "
  >
    <div class="relative">
      <RouterLink :to="`/profile/${record.player.id}`">
        <TheImage :src="avatarUrl" class="w-20 h-20 object-cover rounded-md ring-1 ring-slate-400" />
      </RouterLink>
      <IconMedalFirst v-if="wr" class="w-6 h-6 absolute top-[2px] left-[2px]" />
    </div>

    <div>
      <div class="flex w-36">
        <RouterLink
          :to="`/profile/${record.player.id}`"
          :class="wr ? 'text-yellow-600 hover:text-yellow-400' : 'text-cyan-600 hover:text-cyan-400'"
          class="text-xl font-medium whitespace-nowrap"
          >{{ record.player.name }}</RouterLink
        >
      </div>
      <p class="relative text-slate-300 text-lg">
        {{ `#${leaderboardType === 'overall' ? record.nub_rank : record.pro_rank}` }}
      </p>
    </div>

    <div class="flex items-center gap-4 ml-6">
      <div>
        <p class="text-gray-400">{{ $t('records.title.time') }}</p>
        <p class="text-gray-100 w-20">{{ formatTime(record.time) }}</p>
      </div>

      <div>
        <p class="text-gray-400">{{ $t('records.title.date') }}</p>
        <p class="text-gray-100 italic whitespace-nowrap w-32">
          <UTooltip :text="toLocal(record.submitted_at)">
            {{ toLocalDistance(record.submitted_at, locale) }}
          </UTooltip>
        </p>
      </div>

      <UTooltip v-if="wr" text="WR Progression">
        <UButton variant="ghost" color="info" square @click="emits('toggle')">
          <IconChart />
        </UButton>
      </UTooltip>
    </div>
  </div>
</template>
