<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ProgressionStats } from '@/composables/player-progression'
import { addDays, format, startOfWeek, subWeeks } from 'date-fns'
import { ru, zhCN } from 'date-fns/locale'

const props = defineProps<{
  stats: ProgressionStats
}>()

const { t, locale } = useI18n()

const now = Date.now()

const dateLocale = computed(() => (locale.value === 'zh' ? zhCN : locale.value === 'ru' ? ru : undefined))

const weeks = computed(() => {
  const today = new Date(now)
  const start = startOfWeek(subWeeks(today, 52), { weekStartsOn: 1 })
  const columns: { date: Date; key: string }[][] = []
  let column: { date: Date; key: string }[] = []
  for (let d = start; d.getTime() <= today.getTime(); d = addDays(d, 1)) {
    column.push({ date: d, key: format(d, 'yyyy-MM-dd') })
    if (column.length === 7) {
      columns.push(column)
      column = []
    }
  }
  if (column.length) columns.push(column)
  return columns
})

const monthLabels = computed(() => {
  let previousMonth = -1
  return weeks.value.map((column) => {
    const first = column[0]!.date
    const month = first.getMonth()
    if (month !== previousMonth) {
      previousMonth = month
      return format(first, 'MMM', { locale: dateLocale.value })
    }
    return ''
  })
})

const weekdayLabels = computed(() => [
  t('profile.activity.mon'),
  '',
  t('profile.activity.wed'),
  '',
  t('profile.activity.fri'),
  '',
  '',
])

function heatColor(count: number) {
  if (count === 0) return '#27272a'
  if (count <= 2) return '#1d3a5c'
  if (count <= 5) return '#2a5d8f'
  if (count <= 9) return '#3d80c2'
  return '#5da6e1'
}

function dayTitle(key: string) {
  return t('profile.activity.dayTooltip', { date: key, count: props.stats.dayCounts.get(key) ?? 0 })
}

// recent weeks matter most: start scrolled to the right edge
const scrollRef = ref<HTMLElement | null>(null)
onMounted(() => {
  if (scrollRef.value) scrollRef.value.scrollLeft = scrollRef.value.scrollWidth
})
</script>

<template>
  <div class="p-4 border border-zinc-700 rounded-md flex flex-col">
    <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
      <p class="text-xl font-semibold text-gray-200">{{ t('profile.activity.title') }}</p>
      <div class="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
        <p class="text-base text-gray-400">
          {{
            t('profile.activity.headerStats', {
              days: stats.activeDays,
              runs: stats.totalRuns,
            })
          }}
        </p>
        <span class="flex items-center gap-1 text-sm text-gray-500">
          {{ t('profile.activity.less') }}
          <span
            v-for="count in [0, 1, 4, 8, 12]"
            :key="count"
            class="w-3 h-3 rounded-[2px]"
            :style="{ backgroundColor: heatColor(count) }"
          ></span>
          {{ t('profile.activity.more') }}
        </span>
      </div>
    </div>

    <div v-if="!stats.totalRuns" class="flex-1 flex items-center justify-center text-gray-500 min-h-40">
      {{ t('profile.activity.empty') }}
    </div>

    <div v-else ref="scrollRef" class="overflow-x-auto list-wrapper pb-1">
      <div class="flex gap-[3px] w-max">
        <!-- weekday labels -->
        <div class="flex flex-col gap-[3px] mr-1">
          <div class="h-4"></div>
          <div v-for="(label, i) in weekdayLabels" :key="i" class="h-3 text-[11px] leading-3 text-gray-500">
            {{ label }}
          </div>
        </div>
        <!-- week columns -->
        <div v-for="(column, weekIndex) in weeks" :key="weekIndex" class="flex flex-col gap-[3px]">
          <div class="h-4 text-xs leading-4 text-gray-500 whitespace-nowrap">{{ monthLabels[weekIndex] }}</div>
          <div
            v-for="day in column"
            :key="day.key"
            class="w-3 h-3 rounded-[2px] hover:ring-1 hover:ring-zinc-300"
            :style="{ backgroundColor: heatColor(stats.dayCounts.get(day.key) ?? 0) }"
            :title="dayTitle(day.key)"
          ></div>
        </div>
      </div>
    </div>

    <p v-if="stats.currentStreak > 0" class="mt-auto pt-3 text-base text-gray-400">
      🔥 {{ t('profile.activity.streak', { count: stats.currentStreak }) }}
    </p>
  </div>
</template>
