<script setup lang="ts">
defineProps<{
  wrs: number
  top10: number
  top20: number
  top50: number
}>()
</script>

<template>
  <div class="flex flex-wrap gap-x-8 gap-y-0 lg:gap-y-8">
    <div class="flex">
      <span class="mr-1 text-gray-400">{{ $t('profile.completion.wrs') }}:</span>
      <span class="font-bold" :class="wrs > 0 ? 'text-yellow-400' : 'text-gray-500'">{{ wrs }}</span>
      <IconMedalFirst v-if="wrs > 0" class="w-5 h-5" />
    </div>

    <div v-if="top10 > 0">
      <span class="mr-1 text-gray-400">{{ $t('profile.completion.top10') }}:</span>
      <span class="text-red-400">{{ top10 }}</span>
    </div>

    <div v-if="top20 > 0">
      <span class="mr-1 text-gray-400">{{ $t('profile.completion.top20') }}:</span>
      <span class="text-purple-400">{{ top20 }}</span>
    </div>

    <div v-if="top50 > 0">
      <span class="mr-1 text-gray-400">{{ $t('profile.completion.top50') }}:</span>
      <span class="text-orange-400">{{ top50 }}</span>
    </div>
  </div>
</template>
