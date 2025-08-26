<script setup lang="ts">
import { ref } from 'vue'
import { api, toLocal, seperateThousands } from '@/utils'
import type { Profile, PlayerSteam } from '@/types'
import { useRoute } from 'vue-router'

defineProps<{
  profile: Profile
}>()

const route = useRoute()

const avatarUrl = ref('')
const profileUrl = ref('')

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
        <p class="text-2xl font-semibold max-w-56 truncate text-cyan-600">{{ profile.name }}</p>
        <UButton square variant="ghost" :to="profileUrl" target="_blank">
          <IconSteam class="w-5 h-5" />
        </UButton>
      </div>

      <p>
        <span class="text-gray-400">{{ $t('profile.info.joinedOn') }}: </span>
        <span class="font-medium mr-1">{{ toLocal(profile.created_at, true) }}</span>
      </p>

      <div>
        <span class="mr-1 text-gray-400">{{ $t('profile.info.rating') }}:</span>
        <span class="font-semibold">
          {{ seperateThousands(profile.rating) }}
        </span>
      </div>
    </div>
  </div>
</template>
