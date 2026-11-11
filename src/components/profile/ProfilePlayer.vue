<script setup lang="ts">
import { computed } from 'vue'
import type { Mode, Player, PlayerSteam } from '@/types'
import { getTitleByRating, seperateThousands, toLocal } from '@/utils'
import { useRankingStore } from '@/stores/ranking'

const props = defineProps<{
  profile: Player | null
  steamProfile: PlayerSteam | null
  mode: Mode
  loading: boolean
}>()

const rankingStore = useRankingStore()

const avatarUrl = computed(() => props.steamProfile?.avatar_url.replace(/_medium/, '_full') || '')
const profileUrl = computed(() => props.steamProfile?.profile_url || '')
const rating = computed(() => (props.mode === 'classic' ? props.profile?.ckz_rating : props.profile?.vnl_rating) || 0)
const title = computed(() => getTitleByRating(rating.value))

const globalRank = computed(() => {
  if (props.mode === 'classic') {
    if (rankingStore.ckzRanking !== null) {
      return rankingStore.ckzRanking.findIndex((player) => player.id === props.profile?.id) + 1
    } else {
      return null
    }
  } else {
    if (rankingStore.vnlRanking !== null) {
      return rankingStore.vnlRanking.findIndex((player) => player.id === props.profile?.id) + 1
    } else {
      return null
    }
  }
})
</script>

<template>
  <div class="flex gap-2 lg:gap-4 p-4 border border-zinc-700 rounded-md lg:text-lg">
    <TheImage
      v-if="avatarUrl"
      :src="avatarUrl"
      alt="Player Avatar"
      class="w-24 h-24 lg:w-32 lg:h-32 object-cover rounded-md ring-1 ring-slate-400"
    />

    <div v-if="loading" class="w-20 flex justify-center items-center">
      <IconLoading />
    </div>

    <div v-else class="flex flex-col gap-1">
      <div class="flex items-center gap-1">
        <p
          class="text-2xl font-semibold max-w-56 xl:max-w-fit truncate"
          :class="profile ? 'text-cyan-600' : 'text-gray-700'"
        >
          {{ profile ? profile.name : $t('common.unknown') }}
        </p>
        <UButton v-if="profile" square variant="ghost" :to="profileUrl" target="_blank">
          <IconSteam class="w-5 h-5" />
        </UButton>
      </div>

      <p>
        <span class="text-gray-400 mr-1">{{ $t('profile.info.joinedOn') }}: </span>
        <span class="font-semibold mr-1" :class="profile ? 'text-gray-400' : 'text-gray-700'">{{
          profile ? toLocal(profile.first_joined_at, true) : '-'
        }}</span>
      </p>

      <p v-if="globalRank">
        <span class="text-gray-400 mr-1">{{ $t('profile.info.globalRank') }}: </span>
        <span v-if="globalRank === 1" class="text-yellow-400 font-bold">{{ `# ${globalRank}` }}</span>
        <span v-else-if="globalRank < 20" class="text-red-400 font-semibold">{{ `#${globalRank}` }}</span>
        <span v-else-if="globalRank < 100" class="text-purple-400 font-semibold">{{ `#${globalRank}` }}</span>
        <span v-else-if="globalRank < 500" class="text-orange-400 font-semibold">{{ `#${globalRank}` }}</span>
        <span v-else class="text-gray-400">{{ `#${globalRank}` }}</span>
      </p>

      <div class="flex items-center gap-2">
        <span class="text-gray-400 mr-1">{{ $t('profile.info.rating') }}:</span>

        <div class="flex items-center gap-1">
          <div
            v-if="profile"
            :style="{
              color: title[1],
              backgroundColor: `${title[1]}20`,
              border: `1px solid ${title[1]}`,
            }"
            class="flex justify-center items-center px-1 font-semibold text-sm rounded-md"
          >
            {{ title[0] }}
          </div>
          <span class="text-gray-600">/</span>
          <span class="font-medium">
            {{ profile ? seperateThousands(rating) : '-' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
