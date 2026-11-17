<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ProfileSummary } from '@/utils/profile-stats'
import { formatTime, seperateThousands, toLocal } from '@/utils'

const props = defineProps<{
  summary: ProfileSummary
}>()

const { t } = useI18n()

/** Hours for anything long enough to read in hours, minutes otherwise. */
function formatPlaytime(seconds: number) {
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`

  return `${seperateThousands(Math.floor(seconds / 3600))}h`
}

const cells = computed(() => {
  const { hardestClear, longestStreak, favouriteMap, serverLoyalty, biggestTimeDrop } = props.summary

  const longestStreakRange = longestStreak
    ? longestStreak.from === longestStreak.to
      ? toLocal(longestStreak.from, true)
      : `${toLocal(longestStreak.from, true)} – ${toLocal(longestStreak.to, true)}`
    : null

  return [
    // 1
    {
      key: 'bests',
      label: t('profile.summary.completion'),
      value: seperateThousands(props.summary.bests),
      sub: t('profile.summary.completionCountlast30days', { count: props.summary.bestsLast30Days }),
      title: undefined,
      color: undefined,
    },
    // 3
    {
      key: 'hardest',
      label: t('profile.summary.hardestCompletion'),
      value: hardestClear ? `T${hardestClear.tierNo}` : '–',
      sub: hardestClear ? t(`common.tier.${hardestClear.tier}`) : t('profile.summary.noCompletion'),
      title: hardestClear ? `${hardestClear.map} · ${hardestClear.course} · ${hardestClear.time}` : undefined,
      color: hardestClear?.color,
    },
    // 5
    {
      key: 'teleports',
      label: t('profile.summary.proRuns'),
      value: `${props.summary.teleportFreeShare}%`,
      sub: t('profile.summary.proRunCount', { count: seperateThousands(props.summary.teleportFreeCount) }),
      title: undefined,
      color: undefined,
    },
    // 7
    {
      key: 'playtime',
      label: t('profile.summary.timeOnClock'),
      value: props.summary.timeOnClock ? formatPlaytime(props.summary.timeOnClock) : '–',
      sub: t('profile.summary.proRunCount', { count: seperateThousands(props.summary.runs) }),
      title: undefined,
      color: undefined,
    },
    // 9
    {
      key: 'favourite-map',
      label: t('profile.summary.mostPlayedMap'),
      value: favouriteMap?.name ?? '–',
      sub: favouriteMap ? t('profile.summary.proRunCount', { count: seperateThousands(favouriteMap.runs) }) : '–',
      title: favouriteMap?.name,
      color: undefined,
    },
    // 2
    {
      key: 'points',
      label: t('profile.summary.averagePoints'),
      value: seperateThousands(props.summary.averagePoints),
      sub: t('profile.summary.medianPoints', { points: seperateThousands(props.summary.medianPoints) }),
      title: undefined,
      color: undefined,
    },
    // 4
    {
      key: 'top10',
      label: t('profile.summary.top10Share'),
      value: `${props.summary.top10Share}%`,
      sub: t('profile.summary.top100SharePercentage', { percent: props.summary.top100Share }),
      title: undefined,
      color: undefined,
    },
    // 6
    {
      key: 'streak',
      label: t('profile.summary.longestStreak'),
      value: longestStreak ? t('profile.summary.streakDays', { count: longestStreak.days }) : '–',
      sub: longestStreakRange ?? '–',
      title: undefined,
      color: undefined,
    },
    // 8
    {
      key: 'biggest-drop',
      label: t('profile.summary.biggestTimeDrop'),
      value: biggestTimeDrop ? `-${formatTime(biggestTimeDrop.seconds)}` : '–',
      sub: biggestTimeDrop?.map ?? '–',
      title: biggestTimeDrop
        ? `${biggestTimeDrop.map} · ${biggestTimeDrop.course} · ${biggestTimeDrop.from} → ${biggestTimeDrop.to}`
        : undefined,
      color: undefined,
    },
    // 10
    {
      key: 'server',
      label: t('profile.summary.mostPlayedServer'),
      value: serverLoyalty ? `${serverLoyalty.share}%` : '–',
      sub: serverLoyalty?.server ?? '–',
      title: serverLoyalty
        ? `${serverLoyalty.server} · ${t('profile.summary.serversPlayed', { count: serverLoyalty.serverCount })}`
        : undefined,
      color: undefined,
    },
  ]
})
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-5 gap-x-6 gap-y-3">
    <div v-for="cell in cells" :key="cell.key" class="min-w-0" :title="cell.title">
      <p class="text-[11px] leading-tight font-semibold uppercase tracking-[0.12em] text-zinc-400">
        {{ cell.label }}
      </p>
      <p class="text-xl font-semibold tabular-nums leading-tight mt-0.5 truncate" :style="{ color: cell.color }">
        {{ cell.value }}
      </p>
      <p class="text-sm text-zinc-500 truncate">{{ cell.sub }}</p>
    </div>
  </div>
</template>
