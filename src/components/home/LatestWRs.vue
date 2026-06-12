<script setup lang="ts">
import { computed } from 'vue'
import { useRecords } from '@/composables/records'
import { formatTime, uuidToLocalDistance } from '@/utils'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const { records, loading } = useRecords(
  {
    mode: 'classic',
    leaderboardType: 'overall',
    max_rank: 1,
    sort_by: 'submission-date',
    sort_order: 'descending',
    limit: 40,
  },
  {
    syncStyleStore: false,
  },
)

const latestWrs = computed(() => records.value.filter((record) => record.nub_rank === 1).slice(0, 10))
</script>

<template>
  <div class="mt-2 flex min-h-0 flex-1 flex-col">
    <div v-if="loading" class="flex items-center justify-center py-8">
      <IconLoading class="inline" />
    </div>

    <div v-else-if="latestWrs.length > 0" class="list-wrapper min-h-0 flex-1 overflow-auto">
      <article
        v-for="record in latestWrs"
        :key="record.id"
        class="mb-2 overflow-hidden rounded xl:rounded-tr-none xl:rounded-br-none xl:rounded-tl-md xl:rounded-bl-md border xl:border-r-0 xl:border-l xl:border-t xl:border-b border-gray-700 bg-gray-900/60 last:mb-0"
      >
        <div class="flex">
          <RouterLink :to="`/maps/${record.map.name}`">
            <img
              :src="`https://github.com/kzglobalteam/cs2kz-images/raw/public/webp/medium/${record.map.name}/1.webp`"
              :alt="record.map.name"
              class="w-48 h-auto xl:w-42 xl:h-24"
            />
          </RouterLink>

          <div class="flex min-w-0 flex-1 flex-col xl:gap-0.5 pl-1 xl:p-2">
            <div class="hidden xl:flex items-center gap-2">
              <RouterLink
                :to="`/maps/${record.map.name}`"
                class="text-slate-100 font-semibold text-lg hover:text-slate-200 cursor-pointer"
              >
                {{ record.map.name }}
              </RouterLink>
              <span>-</span>
              <p class="text-lg text-slate-300">{{ record.course.name }}</p>
            </div>

            <RouterLink
              :to="`/maps/${record.map.name}`"
              class="inline xl:hidden text-slate-100 font-semibold text-lg hover:text-slate-200 cursor-pointer"
            >
              {{ record.map.name }}
            </RouterLink>

            <p class="block xl:hidden text-lg text-slate-300">{{ record.course.name }}</p>

            <div class="flex items-center gap-1">
              <UAvatar
                v-if="record.playerAvatar"
                :src="record.playerAvatar"
                :alt="record.player.name"
                size="sm"
              ></UAvatar>
              <RouterLink
                :to="`/profile/${record.player.id}`"
                class="truncate text-base font-semibold text-cyan-500 transition-colors hover:text-cyan-400"
              >
                {{ record.player.name || $t('common.unknown') }}
              </RouterLink>
            </div>

            <div class="flex gap-2">
              <div class="w-28 flex items-start gap-1">
                <span class="text-gray-300">{{ formatTime(record.time) }}</span>
                <div
                  class="flex justify-center items-center text-gray-100 text-[10px] leading-3 rounded-sm px-1"
                  :class="record.teleports > 0 ? 'bg-yellow-600' : 'bg-blue-600'"
                >
                  {{ record.teleports > 0 ? 'TP' : 'PRO' }}
                </div>
              </div>

              <span class="whitespace-nowrap text-slate-500">{{ uuidToLocalDistance(record.id, locale) }}</span>
            </div>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="flex justify-center py-8">
      <p class="text-gray-500">{{ $t('common.noData') }}</p>
    </div>
  </div>
</template>
