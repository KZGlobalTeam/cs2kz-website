/**
 * Client-side rating progression + activity stats for the profile page.
 *
 * Data notes (validated against api.cs2kz.org + KZGlobalTeam/cs2kz-api source):
 * - Official rating = 0.1 * sum(points * 0.975^(n-1)), entries sorted desc, where the entries are
 *   the player's best NUB points AND best PRO points on every ranked course (both count, even when
 *   it is the same record). Max possible rating is 40000 (10000 pts * geometric series limit 40 * 0.1).
 * - The API only keeps points on the CURRENT best run per course/leaderboard; beaten runs have
 *   null points. True historical rating is therefore not reconstructable from run history alone.
 * - Approximation used here ("static-points replay"): each current best entry's points are placed
 *   at the timestamp of the record that set it (UUIDv7). The result shows WHEN the player earned
 *   their current strength. It is monotonic and its final value matches the official rating within
 *   ~0.1% (residual = live points recalc vs submission-time snapshots).
 * - The /records endpoint silently caps `limit` at 1000, so full history needs pagination.
 * - The header number, rank badge and next-target math use the LIVE API rating passed in by the
 *   caller; only the timeline nodes (and the footnote's replay final) come from the replay.
 */
import { computed, onScopeDispose, ref, shallowRef, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type { Mode, Record as Run } from '@/types'
import { api, extractTimestampFromUUIDv7, getTitleByRating } from '@/utils'
import { differenceInCalendarDays, format } from 'date-fns'

const PAGE_SIZE = 1000
const PAGE_CONCURRENCY = 4
const DAY = 86_400_000

export interface Promotion {
  title: string
  color: string
  /** ms epoch, from the record's UUIDv7 */
  at: number
  /** rating after the promotion */
  rating: number
  fromTitle: string
  daysSincePrevious: number
}

export interface ProgressionStats {
  /** replay final value (approximation); timeline nodes and the footnote tooltip use it */
  currentRating: number
  /** live API rating; drives header number, rank badge and next target. Falls back to the replay
   * final only while the profile payload is unavailable (pending/failed fetch). */
  officialRating: number
  currentTitle: string
  currentColor: string
  promotions: Promotion[]
  nextTarget: { title: string; color: string; min: number; fromMin: number } | null
  /** local yyyy-MM-dd -> run count (every submitted run, ranked or not) */
  dayCounts: Map<string, number>
  totalRuns: number
  activeDays: number
  currentStreak: number
}

/** Promotion ladder, ascending. Titles/colors come from getTitleByRating(); mins drive next-target math. */
const RANK_LADDER = [
  { title: 'Beginner', min: 1 },
  { title: 'Casual', min: 5000 },
  { title: 'Regular', min: 10000 },
  { title: 'Skilled', min: 15000 },
  { title: 'Expert', min: 20000 },
  { title: 'Semipro', min: 25000 },
  { title: 'Pro', min: 30000 },
  { title: 'Master', min: 35000 },
  { title: 'Legend', min: 37500 },
]

function ratingOf(points: number[]) {
  const sorted = [...points].sort((a, b) => b - a)
  const sum = sorted.reduce((acc, p, i) => acc + p * Math.pow(0.975, i), 0)
  return Math.min(sum * 0.1, 40000)
}

function dayKey(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

interface Entry {
  at: number
  points: number
}

function entriesOf(bestRuns: Run[], leaderboard: 'nub' | 'pro'): Entry[] {
  const entries: Entry[] = []
  for (const run of bestRuns) {
    const points = leaderboard === 'nub' ? run.nub_points : run.pro_points
    if (points === null || points === undefined) continue
    entries.push({ at: extractTimestampFromUUIDv7(run.id).getTime(), points })
  }
  return entries
}

interface RatingEvent {
  at: number
  rating: number
  title: string
  color: string
}

/** Static-points replay: earn each current-best entry at the time its record was submitted. */
function buildRatingEvents(nubBests: Run[], proBests: Run[]): RatingEvent[] {
  const entries = [...entriesOf(nubBests, 'nub'), ...entriesOf(proBests, 'pro')].sort((a, b) => a.at - b.at)

  const earned: number[] = []
  const events: RatingEvent[] = []
  for (const entry of entries) {
    earned.push(entry.points)
    const rating = ratingOf(earned)
    const [title, color] = getTitleByRating(rating)
    events.push({ at: entry.at, rating, title, color })
  }
  return events
}

function buildDayCounts(runs: Run[]) {
  const counts = new Map<string, number>()
  for (const run of runs) {
    const key = dayKey(extractTimestampFromUUIDv7(run.id))
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
}

function streaks(dayKeys: string[], now: number) {
  const days = [...new Set(dayKeys)].sort()
  if (!days.length) return 0

  // current streak: consecutive days ending today or yesterday
  const today = dayKey(new Date(now))
  const yesterday = dayKey(new Date(now - DAY))
  const last = days[days.length - 1]!
  if (last !== today && last !== yesterday) return 0

  let currentStreak = 1
  for (let i = days.length - 2; i >= 0; i--) {
    if (differenceInCalendarDays(new Date(days[i + 1]!), new Date(days[i]!)) === 1) currentStreak++
    else break
  }
  return currentStreak
}

function deriveStats(
  events: RatingEvent[],
  dayCounts: Map<string, number>,
  totalRuns: number,
  officialRating: number | null | undefined,
): ProgressionStats {
  const currentRating = events.length ? events[events.length - 1]!.rating : 0
  // floor once, like seperateThousands(), so header + "to go" add up to the target exactly
  const resolvedRating = Math.floor(officialRating ?? currentRating)
  const [currentTitle, currentColor] = getTitleByRating(resolvedRating)

  const promotions: Promotion[] = []
  let previousTitle = 'New'
  let previousAt: number | null = null
  for (const event of events) {
    if (event.title === previousTitle) continue
    promotions.push({
      title: event.title,
      color: event.color,
      at: event.at,
      rating: event.rating,
      fromTitle: previousTitle,
      daysSincePrevious: previousAt === null ? 0 : Math.round((event.at - previousAt) / DAY),
    })
    previousTitle = event.title
    previousAt = event.at
  }

  const targetIndex = RANK_LADDER.findIndex((step) => step.min > resolvedRating)
  const target = targetIndex === -1 ? null : RANK_LADDER[targetIndex]!
  const nextTarget = target
    ? {
        title: target.title,
        color: getTitleByRating(target.min)[1],
        min: target.min,
        fromMin: targetIndex === 0 ? 0 : RANK_LADDER[targetIndex - 1]!.min,
      }
    : null

  const keys = [...dayCounts.keys()]
  const currentStreak = streaks(keys, Date.now())

  return {
    currentRating,
    officialRating: resolvedRating,
    currentTitle,
    currentColor,
    promotions,
    nextTarget,
    dayCounts,
    totalRuns,
    activeDays: dayCounts.size,
    currentStreak,
  }
}

export function usePlayerProgression(
  playerId: MaybeRefOrGetter<string>,
  mode: MaybeRefOrGetter<Mode>,
  officialRating: MaybeRefOrGetter<number | null | undefined>,
) {
  const loading = ref(false)
  const error = ref(false)
  const runs = shallowRef<Run[]>([])
  const nubBests = shallowRef<Run[]>([])
  const proBests = shallowRef<Run[]>([])

  let requestId = 0
  let controller: AbortController | undefined
  onScopeDispose(() => controller?.abort())

  async function fetchAllRuns(id: string, m: Mode, signal: AbortSignal) {
    const params = (offset: number) => ({
      player: id,
      mode: m,
      top: false,
      sort_by: 'submission-date',
      sort_order: 'ascending',
      limit: PAGE_SIZE,
      offset,
    })

    const first = await api.get('/records', { params: params(0), signal })
    const total: number = first.data?.total ?? 0
    const pages: Run[][] = [first.data?.values ?? []]

    const offsets: number[] = []
    for (let offset = PAGE_SIZE; offset < total; offset += PAGE_SIZE) offsets.push(offset)

    while (offsets.length > 0) {
      const batch = offsets.splice(0, PAGE_CONCURRENCY)
      const responses = await Promise.all(
        batch.map((offset) => api.get('/records', { params: params(offset), signal })),
      )
      for (const response of responses) pages.push(response.data?.values ?? [])
    }

    return pages.flat()
  }

  async function fetchBests(id: string, m: Mode, signal: AbortSignal) {
    const base = { player: id, mode: m, top: true, ranked: true, limit: PAGE_SIZE, offset: 0 }
    const [nub, pro] = await Promise.all([
      api.get('/records', { params: base, signal }),
      api.get('/records', { params: { ...base, has_teleports: false }, signal }),
    ])
    return { nub: (nub.data?.values ?? []) as Run[], pro: (pro.data?.values ?? []) as Run[] }
  }

  watch(
    [() => toValue(playerId), () => toValue(mode)],
    async ([id, m]) => {
      const id_ = ++requestId
      controller?.abort()
      controller = new AbortController()
      const signal = controller.signal

      loading.value = true
      error.value = false

      try {
        const [all, bests] = await Promise.all([fetchAllRuns(id, m, signal), fetchBests(id, m, signal)])
        if (id_ !== requestId) return
        runs.value = all
        nubBests.value = bests.nub
        proBests.value = bests.pro
      } catch (err) {
        if (id_ !== requestId || signal.aborted) return
        console.error('[player-progression] fetch error', err)
        error.value = true
        runs.value = []
        nubBests.value = []
        proBests.value = []
      } finally {
        if (id_ === requestId) loading.value = false
      }
    },
    { immediate: true },
  )

  const stats = computed(() =>
    deriveStats(
      buildRatingEvents(nubBests.value, proBests.value),
      buildDayCounts(runs.value),
      runs.value.length,
      toValue(officialRating),
    ),
  )

  return { loading, error, stats }
}
