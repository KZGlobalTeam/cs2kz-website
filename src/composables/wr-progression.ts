import { onScopeDispose, ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type { LeaderboardType, Mode, RecordResponse, RecordWithImproved } from '@/types'
import { api, validQuery } from '@/utils'
import { queuePlayerAvatars } from '@/composables/steam-avatars'

// the API does not allow fetching more than 1000 records at once
const PAGE_SIZE = 1000
const PAGE_CONCURRENCY = 4

interface WrProgressionFilters {
  map: MaybeRefOrGetter<string | undefined>
  course: MaybeRefOrGetter<string | undefined>
  mode: MaybeRefOrGetter<Mode>
  leaderboardType: MaybeRefOrGetter<LeaderboardType>
  ranked?: MaybeRefOrGetter<boolean | undefined>
}

/**
 * Rebuilds a course's world record history by walking through every record in
 * chronological order and keeping the ones that beat the previous world record.
 *
 * The API only ranks each player's best run, so the fastest ranked run of the course is
 * the current world record and anything faster than it is a run that the API rejected
 * (e.g. a run that skipped checkpoints). Those runs are dropped, otherwise a single
 * invalid run would hide the whole progression.
 *
 * The returned progression is ordered newest first, so the current world record
 * holder is the first entry. `timeImproved` is how much faster a record is
 * compared to the world record it beat.
 */
export function useWrProgression(filters: WrProgressionFilters) {
  const loading = ref(false)
  const progression = ref<RecordWithImproved[]>([])
  const processed = ref(0)
  const total = ref(0)

  let requestId = 0
  let controller: AbortController | undefined

  function buildParams(offset: number) {
    return validQuery({
      map: toValue(filters.map),
      course: toValue(filters.course),
      mode: toValue(filters.mode),
      ranked: filters.ranked ? toValue(filters.ranked) : undefined,
      has_teleports: toValue(filters.leaderboardType) === 'pro' ? false : undefined,
      top: false,
      sort_by: 'submission-date',
      sort_order: 'ascending',
      limit: PAGE_SIZE,
      offset,
    })
  }

  async function fetchPage(offset: number, signal: AbortSignal) {
    const { data } = await api.get('/records', { params: buildParams(offset), signal })

    return data as RecordResponse
  }

  /** Fetches every record of the course in chronological order. */
  async function fetchPages(id: number, signal: AbortSignal) {
    const firstPage = await fetchPage(0, signal)

    if (id !== requestId) return null

    total.value = firstPage.total
    processed.value = firstPage.values.length

    const pages: RecordResponse['values'][] = [firstPage.values]

    const offsets: number[] = []
    for (let offset = firstPage.values.length; offset < firstPage.total; offset += PAGE_SIZE) {
      offsets.push(offset)
    }

    while (offsets.length > 0) {
      const batch = offsets.splice(0, PAGE_CONCURRENCY)
      const responses = await Promise.all(batch.map((offset) => fetchPage(offset, signal)))

      if (id !== requestId) return null

      for (const response of responses) {
        pages.push(response.values)
        processed.value += response.values.length
      }
    }

    return pages.flat()
  }

  async function fetchProgression() {
    const id = ++requestId
    controller?.abort()
    controller = new AbortController()

    loading.value = true
    progression.value = []
    processed.value = 0
    total.value = 0

    try {
      const pages = await fetchPages(id, controller.signal)

      if (pages === null || id !== requestId) return

      // Only the fastest ranked run of each player is ranked, so the fastest ranked run of
      // the course is the current world record. Records faster than it cannot be valid
      // (e.g. runs that skipped checkpoints) and would poison the entire progression.
      const rankField = toValue(filters.leaderboardType) === 'pro' ? 'pro_rank' : 'nub_rank'
      const uniqueRecords = new Map<string, RecordWithImproved>()
      let worldRecordTime = Number.POSITIVE_INFINITY

      for (const record of pages) {
        if (uniqueRecords.has(record.id)) continue

        uniqueRecords.set(record.id, { ...record, timeImproved: 0 })

        if (record[rankField] != null) {
          worldRecordTime = Math.min(worldRecordTime, record.time)
        }
      }

      // the course has no ranked records, so there is no world record to build a history of
      if (worldRecordTime === Number.POSITIVE_INFINITY) {
        progression.value = []
        return
      }

      const history: RecordWithImproved[] = []
      let bestTime = Number.POSITIVE_INFINITY

      for (const record of uniqueRecords.values()) {
        if (record.time < worldRecordTime || record.time >= bestTime) continue

        record.timeImproved = history.length === 0 ? 0 : bestTime - record.time
        history.push(record)
        bestTime = record.time
      }

      progression.value = history.reverse()
      queuePlayerAvatars(progression.value.map((record) => record.player.id))
    } catch (error) {
      if (id !== requestId || (error as { code?: string }).code === 'ERR_CANCELED') return

      console.error('[fetch error]', error)
    } finally {
      if (id === requestId) loading.value = false
    }
  }

  watch(
    [
      () => toValue(filters.map),
      () => toValue(filters.course),
      () => toValue(filters.mode),
      () => toValue(filters.leaderboardType),
      () => (filters.ranked ? toValue(filters.ranked) : undefined),
    ],
    () => {
      if (!toValue(filters.map) || !toValue(filters.course)) return

      fetchProgression()
    },
    { immediate: true },
  )

  onScopeDispose(() => {
    requestId++
    controller?.abort()
  })

  return { loading, progression, processed, total, fetchProgression }
}
