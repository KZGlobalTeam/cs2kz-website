<script setup lang="ts">
import { watch } from 'vue'
import { useProfile } from '@/composables/profile'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const { query, profile } = useProfile(route.params.steamId as string)

watch(profile, (val) => {
  if (val === null) {
    router.replace({ name: 'NotFound' })
  }
})
</script>
<template>
  <div v-if="profile !== 'pending' && profile !== null" class="py-2 lg:py-4 px-2 max-w-5xl mx-auto text-gray-300">
    <ModeSwitcher v-model:mode="query.mode" class="mb-5" />

    <ProfilePlayer :profile="profile" class="mb-10" />

    <ProfileCompletion :mode="query.mode" class="mb-10" />

    <ProfileRuns :mode="query.mode" class="mb-10" />
  </div>
</template>
