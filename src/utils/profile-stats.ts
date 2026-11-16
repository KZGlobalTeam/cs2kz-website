import type { LeaderboardType, Record as Run, Tier } from '@/types'
import { extractTimestampFromUUIDv7, formatTime, getTierNumber, tierColorMap } from '@/utils'

const DAY = 86_400_000

export interface HardestClear {
  tier: Tier
  tierNo: number
  color: string
  map: string
  course: string
  time: string
}

export interface ProfileSummary {
  bests: number
  bestsLast30Days: number
  hardestClear: HardestClear | null
  top10Share: number
  top100Share: number
  averagePoints: number
  medianPoints: number
  teleportFreeCount: number
  teleportFreeShare: number
  oldestBestDate: string | null
}

function share(part: number, whole: number) {
  return whole ? Math.round((part / whole) * 100) : 0
}

/**
 * Derives the headline figures for a player profile from all of their best runs.
 *
 * `records` must be every best run for the player, not the filtered runs table — otherwise the
 * summary shifts whenever a user clicks a tier/points filter.
 */
export function buildProfileSummary(
  records: Run[],
  leaderboardType: LeaderboardType,
  now = Date.now(),
): ProfileSummary {
  const isPro = leaderboardType === 'pro'

  const rankOf = (record: Run) => (isPro ? record.pro_rank : record.nub_rank)
  const pointsOf = (record: Run) => (isPro ? record.pro_points : record.nub_points) ?? 0

  const ranked = records.filter((record) => rankOf(record) !== null)

  let hardestClear: HardestClear | null = null
  for (const record of records) {
    const tier = isPro ? record.course.pro_tier : record.course.nub_tier
    const tierNo = getTierNumber(tier)

    if (!hardestClear || tierNo > hardestClear.tierNo) {
      hardestClear = {
        tier,
        tierNo,
        color: tierColorMap.get(tier) as string,
        map: record.map.name,
        course: record.course.name,
        time: formatTime(record.time),
      }
    }
  }

  const points = records.map(pointsOf).sort((a, b) => a - b)
  const totalPoints = points.reduce((sum, value) => sum + value, 0)

  const timestamps = records.map((record) => extractTimestampFromUUIDv7(record.id).getTime()).sort((a, b) => a - b)

  const teleportFreeCount = records.filter((record) => record.teleports === 0).length

  return {
    bests: records.length,
    bestsLast30Days: timestamps.filter((timestamp) => now - timestamp < 30 * DAY).length,
    hardestClear,
    top10Share: share(ranked.filter((record) => rankOf(record)! <= 10).length, ranked.length),
    top100Share: share(ranked.filter((record) => rankOf(record)! <= 100).length, ranked.length),
    averagePoints: records.length ? Math.round(totalPoints / records.length) : 0,
    medianPoints: points.length ? points[Math.floor(points.length / 2)]! : 0,
    teleportFreeCount,
    teleportFreeShare: share(teleportFreeCount, records.length),
    oldestBestDate: timestamps.length ? new Date(timestamps[0]!).toISOString() : null,
  }
}
