<script setup lang="ts">
import { useProfile } from '@/composables/profile'
import { useRoute } from 'vue-router'

const route = useRoute()

const { query, profile, loading } = useProfile(route.params.steamId as string)
</script>
<template>
  <div class="py-2 lg:py-4 px-2">
    <div v-if="profile" class="max-w-5xl mx-auto text-gray-300">
      <ModeSwitcher v-model:mode="query.mode" class="mb-5" />

      <ProfilePlayer :profile="profile" class="mb-10" />

      <ProfileCompletion :mode="query.mode" class="mb-10" />

      <ProfileRuns :mode="query.mode" class="mb-10" />
    </div>
    <div v-if="!loading && !profile" class="flex px-4 py-2 items-center bg-orange-400/40 gap-2 rounded-lg">
      <IconWarning />
      <p class="flex-1 text-amber-400">{{ $t('profile.notFound') }}</p>
    </div>
  </div>
</template>
