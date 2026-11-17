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

export interface LongestStreak {
  days: number
  from: string
  to: string
}

export interface FavouriteMap {
  name: string
  runs: number
}

export interface ServerLoyalty {
  server: string
  share: number
  /** How many distinct servers the player has submitted runs on. */
  serverCount: number
}

export interface BiggestTimeDrop {
  seconds: number
  map: string
  course: string
  /** The previous best time, formatted. */
  from: string
  /** The time that replaced it, formatted. */
  to: string
}

export interface ProfileSummary {
  bests: number
  bestsLast30Days: number
  /** Every run the player submitted, PBs included. */
  runs: number
  hardestClear: HardestClear | null
  top10Share: number
  top100Share: number
  averagePoints: number
  medianPoints: number
  teleportFreeCount: number
  teleportFreeShare: number
  longestStreak: LongestStreak | null
  /** Total duration of every submitted run, in seconds. */
  timeOnClock: number
  favouriteMap: FavouriteMap | null
  serverLoyalty: ServerLoyalty | null
  biggestTimeDrop: BiggestTimeDrop | null
}

function share(part: number, whole: number) {
  return whole ? Math.round((part / whole) * 100) : 0
}

/** Start of the local calendar day, so streaks follow the user's timezone. */
function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

/** Longest run of consecutive calendar days with at least one reported run. */
function longestDayStreak(timestamps: number[]): LongestStreak | null {
  const days = [...new Set(timestamps.map((timestamp) => startOfLocalDay(new Date(timestamp))))].sort((a, b) => a - b)

  if (!days.length) return null

  let best = 1
  let bestFrom = days[0]!
  let bestTo = days[0]!
  let current = 1
  let currentFrom = days[0]!

  for (let index = 1; index < days.length; index++) {
    const day = days[index]!
    // `Math.round` keeps DST-shifted days (23h/25h) counted as one day
    const isNextDay = Math.round((day - days[index - 1]!) / DAY) === 1

    if (isNextDay) {
      current++
    } else {
      current = 1
      currentFrom = day
    }

    if (current > best) {
      best = current
      bestFrom = currentFrom
      bestTo = day
    }
  }

  return { days: best, from: new Date(bestFrom).toISOString(), to: new Date(bestTo).toISOString() }
}

/** The most common value, with how often it occurs. Ties keep whichever value was seen first. */
function mostFrequent<T>(values: T[]): { value: T; count: number } | null {
  const counts = new Map<T, number>()

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  let most: { value: T; count: number } | null = null

  for (const [value, count] of counts) {
    if (!most || count > most.count) {
      most = { value, count }
    }
  }

  return most
}

function submittedAt(run: Run) {
  return extractTimestampFromUUIDv7(run.id).getTime()
}

/**
 * Walks each course's run history chronologically and keeps the largest single improvement.
 *
 * Only runs that beat the running best count, so this works whether or not the API stores runs that
 * were already slower than the player's PB when they were submitted.
 */
function findBiggestTimeDrop(runs: Run[]): BiggestTimeDrop | null {
  const runsByCourse = new Map<string, Run[]>()

  for (const run of runs) {
    const key = `${run.map.name}\u0000${run.course.name}`
    const courseRuns = runsByCourse.get(key)

    if (courseRuns) {
      courseRuns.push(run)
    } else {
      runsByCourse.set(key, [run])
    }
  }

  let biggest: BiggestTimeDrop | null = null

  for (const courseRuns of runsByCourse.values()) {
    courseRuns.sort((a, b) => submittedAt(a) - submittedAt(b))

    let previousBest = courseRuns[0]!.time

    for (const run of courseRuns) {
      if (run.time >= previousBest) continue

      const seconds = previousBest - run.time

      if (!biggest || seconds > biggest.seconds) {
        biggest = {
          seconds,
          map: run.map.name,
          course: run.course.name,
          from: formatTime(previousBest),
          to: formatTime(run.time),
        }
      }

      previousBest = run.time
    }
  }

  return biggest
}

export function isPB(run: Run, leaderboardType: LeaderboardType) {
  return (leaderboardType === 'pro' ? run.pro_rank : run.nub_rank) !== null
}

/**
 * Derives the headline figures for a player profile from their run history.
 *
 * `runs` must be every run the player submitted, including the ones that were not (or are no longer)
 * a PB, and it must not be the filtered runs table — otherwise the summary shifts whenever a user
 * clicks a tier/points filter. Most figures are derived from the PBs within it; streaks are
 * measured against the whole history, because a day spent grinding without a PB is still a day
 * played, and PB timestamps are a strict subset of run timestamps.
 */
export function buildProfileSummary(runs: Run[], leaderboardType: LeaderboardType, now = Date.now()): ProfileSummary {
  const isPro = leaderboardType === 'pro'
  const records = runs.filter((run) => isPB(run, leaderboardType))

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

  const pbTimestamps = records.map((record) => extractTimestampFromUUIDv7(record.id).getTime()).sort((a, b) => a - b)
  const runTimestamps = runs.map(submittedAt).sort((a, b) => a - b)

  const teleportFreeCount = records.filter((record) => record.teleports === 0).length

  const favouriteMapCount = mostFrequent(runs.map((run) => run.map.name))
  const busiestServer = mostFrequent(runs.map((run) => run.server.name))

  return {
    bests: records.length,
    bestsLast30Days: pbTimestamps.filter((timestamp) => now - timestamp < 30 * DAY).length,
    runs: runs.length,
    hardestClear,
    top10Share: share(ranked.filter((record) => rankOf(record)! <= 10).length, ranked.length),
    top100Share: share(ranked.filter((record) => rankOf(record)! <= 100).length, ranked.length),
    averagePoints: records.length ? Math.round(totalPoints / records.length) : 0,
    medianPoints: points.length ? points[Math.floor(points.length / 2)]! : 0,
    teleportFreeCount,
    teleportFreeShare: share(teleportFreeCount, records.length),
    longestStreak: longestDayStreak(runTimestamps),
    timeOnClock: runs.reduce((total, run) => total + run.time, 0),
    favouriteMap: favouriteMapCount ? { name: favouriteMapCount.value, runs: favouriteMapCount.count } : null,
    serverLoyalty: busiestServer
      ? {
          server: busiestServer.value,
          share: share(busiestServer.count, runs.length),
          serverCount: new Set(runs.map((run) => run.server.name)).size,
        }
      : null,
    biggestTimeDrop: findBiggestTimeDrop(runs),
  }
}
