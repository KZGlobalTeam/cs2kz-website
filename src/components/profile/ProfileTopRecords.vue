<script setup lang="ts">
defineProps<{
  wrs: number
  top20: number
  top50: number
  top100: number
}>()
</script>

<template>
  <div class="flex flex-wrap gap-x-8 gap-y-0 lg:gap-y-8">
    <div class="flex">
      <span class="mr-1 text-gray-400">{{ $t('profile.completion.wrs') }}:</span>
      <span class="font-bold" :class="wrs > 0 ? 'text-yellow-400' : 'text-gray-500'">{{ wrs }}</span>
      <IconMedalFirst v-if="wrs > 0" class="w-5 h-5" />
    </div>

    <div>
      <span class="mr-1 text-gray-400">{{ $t('profile.completion.top20') }}:</span>
      <span :class="top20 > 0 ? 'text-red-400' : 'text-gray-500'">{{ top20 }}</span>
    </div>

    <div>
      <span class="mr-1 text-gray-400">{{ $t('profile.completion.top50') }}:</span>
      <span :class="top50 > 0 ? 'text-purple-400' : 'text-gray-500'">{{ top50 }}</span>
    </div>

    <div>
      <span class="mr-1 text-gray-400">{{ $t('profile.completion.top100') }}:</span>
      <span :class="top100 > 0 ? 'text-orange-400' : 'text-gray-500'">{{ top100 }}</span>
    </div>
  </div>
</template>
