<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ProfileSummary } from '@/utils/profile-stats'
import { seperateThousands, toLocal } from '@/utils'

const props = defineProps<{
  summary: ProfileSummary
}>()

const { t } = useI18n()

const cells = computed(() => {
  const { hardestClear, longestStreak } = props.summary

  const longestStreakRange = longestStreak
    ? longestStreak.from === longestStreak.to
      ? toLocal(longestStreak.from, true)
      : `${toLocal(longestStreak.from, true)} – ${toLocal(longestStreak.to, true)}`
    : null

  return [
    {
      key: 'bests',
      label: t('profile.summary.completion'),
      value: seperateThousands(props.summary.bests),
      sub: t('profile.summary.completionsLast30Days', { count: props.summary.bestsLast30Days }),
      title: undefined,
      color: undefined,
    },
    {
      key: 'hardest',
      label: t('profile.summary.hardestCompletion'),
      value: hardestClear ? `T${hardestClear.tierNo}` : '–',
      sub: hardestClear ? t(`common.tier.${hardestClear.tier}`) : t('profile.summary.noCompletion'),
      title: hardestClear ? `${hardestClear.map} · ${hardestClear.course} · ${hardestClear.time}` : undefined,
      color: hardestClear?.color,
    },
    {
      key: 'top10',
      label: t('profile.summary.top10Share'),
      value: `${props.summary.top10Share}%`,
      sub: t('profile.summary.top100Share', { percent: props.summary.top100Share }),
      title: undefined,
      color: undefined,
    },
    {
      key: 'points',
      label: t('profile.summary.averagePoints'),
      value: seperateThousands(props.summary.averagePoints),
      sub: t('profile.summary.medianPoints', { points: seperateThousands(props.summary.medianPoints) }),
      title: undefined,
      color: undefined,
    },
    {
      key: 'teleports',
      label: t('profile.summary.proRuns'),
      value: `${props.summary.teleportFreeShare}%`,
      sub: t('profile.summary.proRunCount', { count: seperateThousands(props.summary.teleportFreeCount) }),
      title: undefined,
      color: undefined,
    },
    {
      key: 'streak',
      label: t('profile.summary.longestStreak'),
      value: longestStreak ? t('profile.summary.streakDays', { count: longestStreak.days }) : '–',
      sub: longestStreakRange ?? '–',
      title: undefined,
      color: undefined,
    },
  ]
})
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
    <div v-for="cell in cells" :key="cell.key" class="min-w-0" :title="cell.title">
      <p class="text-[11px] leading-tight font-semibold uppercase tracking-[0.12em] text-zinc-400">
        {{ cell.label }}
      </p>
      <p class="text-xl font-semibold tabular-nums leading-tight mt-0.5" :style="{ color: cell.color }">
        {{ cell.value }}
      </p>
      <p class="text-sm text-zinc-500 truncate">{{ cell.sub }}</p>
    </div>
  </div>
</template>
