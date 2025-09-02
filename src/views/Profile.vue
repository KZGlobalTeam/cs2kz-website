<script setup lang="ts">
import { watch, reactive } from 'vue'
import { useProfile } from '@/composables/profile'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const mainQuery = reactive<{
  mode: 'classic' | 'vanilla-cs2'
  pro: boolean
}>({
  mode: 'classic',
  pro: false,
})

const { query: profileQuery, profile } = useProfile(route.params.steamId as string)

watch(mainQuery, (q) => {
  profileQuery.mode = q.mode
})

watch(profile, (val) => {
  if (val === null) {
    router.replace({ name: 'NotFound' })
  }
})
</script>
<template>
  <div v-if="profile !== 'pending' && profile !== null" class="py-2 lg:py-4 px-2 max-w-5xl mx-auto text-gray-300">
    <MainSwitch v-model:mode="mainQuery.mode" v-model:pro="mainQuery.pro" class="mb-5" />

    <ProfilePlayer :profile="profile" class="mb-5" />

    <ProfileCompletion :mode="mainQuery.mode" :pro="mainQuery.pro" class="mb-5" />

    <ProfileRuns :mode="mainQuery.mode" :pro="mainQuery.pro" />
  </div>
</template>
