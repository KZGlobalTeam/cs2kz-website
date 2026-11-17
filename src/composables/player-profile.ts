import { computed, onScopeDispose, reactive, ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type {
  Map,
  Player,
  PlayerRecordQuery,
  PlayerSteam,
  Record,
  UnfinishedCourseQuery,
  UnfinishedMapRow,
} from '@/types'
import {
  api,
  completionTiers,
  pointsDistLabels,
  extractTimestampFromUUIDv7,
  getTierColor,
  getTierNumber,
} from '@/utils'
import { buildProfileSummary, isInRecordScope, isPB } from '@/utils/profile-stats'
import { useStyleStore } from '@/stores/style'

const PAGE_SIZE = 1000
const PAGE_CONCURRENCY = 4

export function usePlayerProfile(playerId: MaybeRefOrGetter<string>) {
  const styleStore = useStyleStore()

  const defaultRecordQuery: PlayerRecordQuery = {
    map: '',
    rank: undefined,
    server: '',
    top: true,
    tier: undefined,
    points: undefined,
    sort_by: 'submission-date',
    sort_order: 'descending',
  }

  const defaultUnfinishedQuery: UnfinishedCourseQuery = {
    tier: undefined,
  }

  const loading = ref(false)
  const profile = ref<Player | null>(null)
  const steamProfile = ref<PlayerSteam | null>(null)
  const maps = ref<Map[]>([])

  // complete unfiltered history (ranked or not, any teleport count), paginated past the API's
  // silent 1000-record limit cap — the single source for every records-derived figure
  const allRuns = ref<Record[]>([])

  let allRunsRequestId = 0
  let allRunsController: AbortController | undefined
  onScopeDispose(() => allRunsController?.abort())

  // pb and non-pb records, leaderboard-scoped: the client-side equivalent of the API's
  // `ranked`/`has_teleports` filters, so toggling them is instant (no refetch) and the
  // table/PB stats are no longer capped at 1000 records
  const everyRecords = computed(() =>
    allRuns.value.filter((run) => isInRecordScope(run, leaderboardType.value, rankedOnly.value)),
  )

  const recordQuery = reactive<PlayerRecordQuery>({ ...defaultRecordQuery })
  const unfinishedQuery = reactive<UnfinishedCourseQuery>({ ...defaultUnfinishedQuery })

  // pb records
  const allRecords = computed(() => everyRecords.value.filter((record) => isPB(record, leaderboardType.value)))

  const currentPlayerId = computed(() => toValue(playerId))

  const mode = computed(() => styleStore.mode)
  const leaderboardType = computed(() => styleStore.leaderboardType)
  const rankedOnly = ref(true)

  const mapperMaps = computed(() =>
    maps.value.filter((map) => map.mappers.some((mapper) => mapper.id === currentPlayerId.value)),
  )

  const totalCourses = computed(() => {
    const courseTiers = maps.value.flatMap((map) =>
      map.courses
        .filter((course) => (rankedOnly.value ? course.filters[mode.value].state === 'ranked' : true))
        .map((course) =>
          leaderboardType.value === 'pro' ? course.filters[mode.value].pro_tier : course.filters[mode.value].nub_tier,
        ),
    )
    return completionTiers.map((tier) => {
      return courseTiers.filter((courseTier) => courseTier === tier).length
    })
  })

  const completedCourses = computed(() => {
    return completionTiers.map((tier) => {
      return allRecords.value.filter((record) => {
        const recordTier = leaderboardType.value === 'pro' ? record.course.pro_tier : record.course.nub_tier
        return tier === recordTier
      }).length
    })
  })

  const topRecords = computed(() => {
    let wrs = 0
    let top10 = 0
    let top20 = 0
    let top50 = 0

    allRecords.value.forEach((record) => {
      const rank = leaderboardType.value === 'pro' ? record.pro_rank! : record.nub_rank!
      if (rank === 1) {
        wrs++
      } else if (rank <= 10) {
        top10++
      } else if (rank <= 20) {
        top20++
      } else if (rank <= 50) {
        top50++
      }
    })

    return {
      wrs,
      top10,
      top20,
      top50,
    }
  })

  const summary = computed(() => buildProfileSummary(everyRecords.value, leaderboardType.value, allRuns.value))

  const completedCourseKeys = computed(
    () => new Set(allRecords.value.map((record) => `${record.map.name}:${record.course.name}`)),
  )

  const pointsDistribution = computed(() => {
    const recordsInTier = recordQuery.tier
      ? allRecords.value.filter((record) => {
          const recordTier = leaderboardType.value === 'pro' ? record.course.pro_tier : record.course.nub_tier
          return recordTier === recordQuery.tier
        })
      : allRecords.value
    const pointsDistribution = Array.from({ length: pointsDistLabels.length }, (_, index) => {
      return recordsInTier.filter((record) => {
        const recordPoints = leaderboardType.value === 'pro' ? record.pro_points! : record.nub_points!
        const pointsBucket = Math.min(Math.floor(recordPoints / 1000), 10)
        return pointsBucket === index
      }).length
    })

    return pointsDistribution
  })

  const filteredRecords = computed(() => {
    const records = allRecords.value.filter((record) => {
      const recordTier = leaderboardType.value === 'pro' ? record.course.pro_tier : record.course.nub_tier
      const recordRank = leaderboardType.value === 'pro' ? record.pro_rank! : record.nub_rank!
      const recordPoints = leaderboardType.value === 'pro' ? record.pro_points! : record.nub_points!
      const pointsBucket = Math.min(Math.floor(recordPoints / 1000), 10)

      if (recordQuery.map && !record.map.name.toLowerCase().includes(recordQuery.map.toLowerCase())) {
        return false
      }

      if (recordQuery.server && !record.server.name.toLowerCase().includes(recordQuery.server.toLowerCase())) {
        return false
      }

      if (recordQuery.tier && recordTier !== recordQuery.tier) {
        return false
      }

      if (recordQuery.rank && recordRank > recordQuery.rank) {
        return false
      }

      if (recordQuery.points !== undefined && pointsBucket !== recordQuery.points) {
        return false
      }

      return true
    })

    return sortPlayerRecords(records, recordQuery.sort_by, recordQuery.sort_order)
  })

  const unfinishedCourses = computed<UnfinishedMapRow[]>(() =>
    maps.value
      .map((map) => {
        const courses = map.courses
          .filter((course) => {
            if (completedCourseKeys.value.has(`${map.name}:${course.name}`)) {
              return false
            } else {
              return true
            }
          })
          .map((course) => {
            const courseFilter = course.filters[mode.value]
            const tier = leaderboardType.value === 'pro' ? courseFilter.pro_tier : courseFilter.nub_tier

            return {
              name: course.name,
              tier,
              tierNo: getTierNumber(tier),
              tierColor: getTierColor(tier),
              state: courseFilter.state,
            }
          })
          .filter((course) => (unfinishedQuery.tier ? course.tier === unfinishedQuery.tier : true))

        return {
          id: map.id,
          name: map.name,
          approved_at: map.approved_at,
          rankedCourses: courses.filter((course) => course.state === 'ranked'),
          unrankedCourses: courses.filter((course) => course.state === 'unranked'),
        }
      })
      .filter((map) => (rankedOnly && map.rankedCourses.length > 0) || (!rankedOnly && map.unrankedCourses.length > 0))
      .sort((a, b) => new Date(b.approved_at).getTime() - new Date(a.approved_at).getTime()),
  )

  watch(currentPlayerId, async () => {
    resetRecordQuery()
  })

  watch(
    currentPlayerId,
    async () => {
      loading.value = true

      try {
        await Promise.all([getProfile(), getSteamProfile(), getMaps(), refreshAllRuns()])
      } finally {
        loading.value = false
      }
    },
    { immediate: true },
  )

  watch(mode, async () => {
    loading.value = true

    try {
      await Promise.all([getProfile(), refreshAllRuns()])
    } finally {
      loading.value = false
    }
  })

  async function getProfile() {
    try {
      const { data } = await api.get<Player | undefined>(`/players/${currentPlayerId.value}`)
      profile.value = data || null
    } catch (error) {
      console.error('[fetch error]', error)
      profile.value = null
    }
  }

  async function getSteamProfile() {
    try {
      const { data } = await api.get<PlayerSteam | undefined>(`/players/${currentPlayerId.value}/steam-profile`)
      steamProfile.value = data || null
    } catch (error) {
      console.error('[fetch error]', error)
      steamProfile.value = null
    }
  }

  async function getMaps() {
    try {
      const { data } = await api.get('/maps', {
        params: {
          state: 'approved',
          limit: 10000,
          offset: 0,
        },
      })

      if (data) {
        maps.value = data.values
      } else {
        maps.value = []
      }
    } catch (error) {
      console.error('[fetch error]', error)
      maps.value = []
    }
  }

  /**
   * Full submission history, unfiltered: no ranked/has_teleports params — scoping happens
   * client-side in `everyRecords`, so whole-history summary figures don't move with the
   * rankedOnly toggle or leaderboard type (and match the activity map).
   * The API silently caps `limit` at 1000, so paginate — same pattern as player-progression.
   */
  async function fetchAllRuns(signal: AbortSignal) {
    const params = (offset: number) => ({
      player: currentPlayerId.value,
      mode: mode.value,
      top: false,
      sort_by: 'submission-date',
      sort_order: 'ascending',
      limit: PAGE_SIZE,
      offset,
    })

    const first = await api.get('/records', { params: params(0), signal })
    const total: number = first.data?.total ?? 0
    const pages: Record[][] = [first.data?.values ?? []]

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

  async function refreshAllRuns() {
    const requestId = ++allRunsRequestId
    allRunsController?.abort()
    allRunsController = new AbortController()
    const signal = allRunsController.signal

    try {
      const runs = await fetchAllRuns(signal)
      if (requestId !== allRunsRequestId) return
      allRuns.value = runs
    } catch (error) {
      if (requestId !== allRunsRequestId || signal.aborted) return
      console.error('[fetch error]', error)
      allRuns.value = []
    }
  }

  function resetRecordQuery() {
    Object.assign(recordQuery, { ...defaultRecordQuery })
  }

  function resetUnfinishedQuery() {
    Object.assign(unfinishedQuery, { ...defaultUnfinishedQuery })
  }

  function setTierFilter(tier: PlayerRecordQuery['tier']) {
    recordQuery.tier = recordQuery.tier === tier ? undefined : tier
  }

  function setPointsFilter(points: PlayerRecordQuery['points']) {
    recordQuery.points = recordQuery.points === points ? undefined : points
  }

  return {
    profile,
    steamProfile,
    loading,
    maps: mapperMaps,
    mode,
    leaderboardType,
    rankedOnly,
    recordQuery,
    unfinishedQuery,
    records: filteredRecords,
    unfinishedCourses,
    totalCourses,
    completedCourses,
    topRecords,
    pointsDistribution,
    summary,
    resetRecordQuery,
    resetUnfinishedQuery,
    setTierFilter,
    setPointsFilter,
  }
}

function sortPlayerRecords(
  records: Record[],
  sortBy: PlayerRecordQuery['sort_by'],
  sortOrder: PlayerRecordQuery['sort_order'],
) {
  if (!sortBy || !sortOrder) {
    return records
  }

  const sorted = [...records]
  const direction = sortOrder === 'ascending' ? 1 : -1

  sorted.sort((a, b) => {
    if (sortBy === 'time') {
      return (a.time - b.time) * direction
    }

    const aTimestamp = extractTimestampFromUUIDv7(a.id).getTime()
    const bTimestamp = extractTimestampFromUUIDv7(b.id).getTime()

    return (aTimestamp - bTimestamp) * direction
  })

  return sorted
}
