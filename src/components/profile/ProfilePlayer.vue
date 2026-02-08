<script setup lang="ts">
import { ref } from 'vue'
import { api, toLocal, seperateThousands, getRankByRating } from '@/utils'
import { useRoute } from 'vue-router'
import { useProfile } from '@/composables/profile'
import type { PlayerSteam } from '@/types'

const route = useRoute()

const avatarUrl = ref('')
const profileUrl = ref('')

const { profile } = useProfile(route.params.steamId as string)

getSteamProfile()

async function getSteamProfile() {
  try {
    const { data: player } = await api.get<PlayerSteam | undefined>(`/players/${route.params.steamId}/steam-profile`)
    avatarUrl.value = player?.avatar_url.replace(/_medium/, '_full') || ''
    profileUrl.value = player?.profile_url || ''
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <div class="flex gap-2 lg:gap-4 p-4 border border-gray-700 rounded-md lg:text-lg">
    <TheImage :src="avatarUrl" class="w-24 h-24 lg:w-32 lg:h-32 object-cover rounded-md ring-1 ring-slate-400" />

    <div class="flex flex-col gap-2 lg:gap-5">
      <div class="flex items-center gap-1">
        <p class="text-2xl font-semibold max-w-56 truncate" :class="profile ? 'text-cyan-600' : 'text-gray-700'">
          {{ profile ? profile.name : $t('common.unknown') }}
        </p>
        <UButton v-if="profile" square variant="ghost" :to="profileUrl" target="_blank">
          <IconSteam class="w-5 h-5" />
        </UButton>
      </div>

      <p>
        <span class="text-gray-500 mr-1">{{ $t('profile.info.joinedOn') }}: </span>
        <span class="font-semibold mr-1" :class="profile ? 'text-gray-400' : 'text-gray-700'">{{
          profile ? toLocal(profile.first_joined_at, true) : '-'
        }}</span>
      </p>

      <div class="flex items-center gap-2">
        <span class="text-gray-400 mr-1">{{ $t('profile.info.rank') }}:</span>

        <div class="flex items-center gap-1">
          <div
            v-if="profile"
            :style="{
              color: getRankByRating(profile.rating)[1],
              backgroundColor: `${getRankByRating(profile.rating)[1]}20`,
              border: `1px solid ${getRankByRating(profile.rating)[1]}`,
            }"
            class="flex justify-center items-center px-1 font-semibold text-sm rounded-md"
          >
            {{ getRankByRating(profile.rating)[0] }}
          </div>
          <span class="text-gray-600">/</span>
          <span class="font-medium">
            {{ profile ? seperateThousands(profile.rating) : '-' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
