<script setup lang="ts">
import { ref } from 'vue'
import { toLocal, seperateThousands } from '@/utils'
import { useRoute } from 'vue-router'
import { useProfile } from '@/composables/profile'

const route = useRoute()

const avatarUrl = ref('')
const profileUrl = ref('')

const { profile } = useProfile(route.params.steamId as string)
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
        <span class="text-gray-500">{{ $t('profile.info.joinedOn') }}: </span>
        <span class="font-medium mr-1 text-gray-400">{{
          profile ? toLocal(profile.created_at, true) : $t('common.unknown')
        }}</span>
      </p>

      <div>
        <span class="mr-1 text-gray-500">{{ $t('profile.info.rating') }}:</span>
        <span class="font-semibold">
          {{ profile ? seperateThousands(profile.rating) : $t('common.unknown') }}
        </span>
      </div>
    </div>
  </div>
</template>
