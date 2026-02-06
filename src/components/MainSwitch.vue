<script lang="ts" setup>
import { useStyleStore } from '@/stores/style'
import { storeToRefs } from 'pinia'

const styleStore = useStyleStore()

const { mode, leaderboardType } = storeToRefs(styleStore)
</script>

<template>
  <div class="flex gap-3 items-center">
    <!-- ckz / vnl -->
    <div class="relative w-40 inline-flex items-center rounded-md bg-gray-100 p-1 dark:bg-gray-800">
      <div
        class="absolute h-[calc(100%-0.5rem)] w-[calc((100%-0.5rem)/2)] rounded-md transition-all duration-200 ease-in-out bg-gray-300"
        :class="[mode === 'classic' ? '' : 'translate-x-full']"
      />
      <button
        class="relative z-10 inline-flex flex-1 items-center justify-center whitespace-nowrap cursor-pointer py-1 font-bold transition-colors"
        :class="[mode === 'classic' ? 'text-slate-900' : 'text-slate-600']"
        @click="mode = 'classic'"
      >
        {{ $t('common.mode.ckz') }}
      </button>
      <button
        class="relative z-10 inline-flex flex-1 items-center justify-center whitespace-nowrap cursor-pointer py-1 font-bold transition-colors"
        :class="[mode === 'vanilla' ? 'text-slate-900 ' : 'text-slate-600 ']"
        @click="mode = 'vanilla'"
      >
        {{ $t('common.mode.vnl') }}
      </button>
    </div>

    <div class="w-[1px] h-8 bg-gray-700"></div>

    <!-- overall / pro -->
    <div class="relative w-40 inline-flex items-center rounded-md bg-gray-100 p-1 dark:bg-gray-800">
      <div
        class="absolute h-[calc(100%-0.5rem)] w-[calc((100%-0.5rem)/2)] rounded-md transition-all duration-200 ease-in-out bg-blue-400"
        :class="{
          'translate-x-full': leaderboardType === 'pro',
          'bg-yellow-600': leaderboardType === 'overall',
          'bg-blue-600': leaderboardType === 'pro',
        }"
      />
      <button
        class="relative z-10 inline-flex flex-1 items-center justify-center whitespace-nowrap cursor-pointer py-1 font-bold transition-colors"
        :class="[leaderboardType === 'pro' ? 'text-slate-600' : 'text-slate-900']"
        @click="leaderboardType = 'overall'"
      >
        {{ $t('common.leaderboardType.overall') }}
      </button>
      <button
        class="relative z-10 inline-flex flex-1 items-center justify-center whitespace-nowrap cursor-pointer py-1 font-bold transition-colors"
        :class="[leaderboardType === 'pro' ? 'text-slate-900' : 'text-slate-600']"
        @click="leaderboardType = 'pro'"
      >
        {{ $t('common.leaderboardType.pro') }}
      </button>
    </div>
  </div>
</template>
