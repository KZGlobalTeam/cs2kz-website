<script setup lang="ts">
import Leaderboards from '@/components/home/Leaderboards.vue'
import LatestWRs from '@/components/home/LatestWRs.vue'
import PlayerSearch from '@/components/home/PlayerSearch.vue'
import MainSwitch from '@/components/MainSwitch.vue'
</script>

<template>
  <aside class="flex flex-col gap-4 xl:h-[calc(100dvh-5rem)]">
    <MainSwitch mode-only />
    <div class="flex min-h-0 flex-1 flex-col">
      <div class="flex items-center justify-between gap-2">
        <span class="border-l-4 border-blue-600 pl-2 text-white text-xl font-semibold">{{
          $t('home.leaderboards.title')
        }}</span>

        <PlayerSearch class="shrink-0" />
      </div>

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
