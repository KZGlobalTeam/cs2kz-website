<script setup lang="ts">
import { reactive } from 'vue'
import type { Mode } from '@/types'

const mainQuery = reactive<{
  mode: Mode
  pro: boolean
}>({
  mode: 'classic',
  pro: false,
})
</script>
<template>
  <div class="py-2 lg:py-4 px-2 max-w-5xl mx-auto text-gray-300">
    <MainSwitch v-model:mode="mainQuery.mode" v-model:pro="mainQuery.pro" class="mb-5" />

    <ProfilePlayer class="mb-5" />

    <ProfileCompletion :mode="mainQuery.mode" :pro="mainQuery.pro" class="mb-5" />

    <ProfileRuns :mode="mainQuery.mode" :pro="mainQuery.pro" />
  </div>
</template>
