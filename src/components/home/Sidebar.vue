<script setup lang="ts">
import Leaderboards from '@/components/home/Leaderboards.vue'
import LatestWRs from '@/components/home/LatestWRs.vue'
</script>

<template>
  <aside class="flex flex-col gap-4 xl:h-[calc(100dvh-5rem)]">
    <div class="flex min-h-0 flex-1 flex-col">
      <span class="border-l-4 border-blue-600 pl-2 text-white text-xl font-semibold">{{
        $t('home.leaderboards.title')
      }}</span>

      <Leaderboards />
    </div>

    <div class="flex min-h-0 flex-1 flex-col">
      <span class="border-l-4 border-blue-600 pl-2 text-white text-xl font-semibold">{{
        $t('home.latestWrs.title')
      }}</span>

      <LatestWRs />
    </div>
  </aside>
</template>
