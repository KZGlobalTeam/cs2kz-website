import { computed, reactive, ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type { CourseInfo, Tier, Map, Player, PlayerRecordQuery, PlayerSteam, Record } from '@/types'
import {
  api,
  calcPointsDistribution,
  completionTiers,
  pointsDistLabels,
  extractTimestampFromUUIDv7,
  getPointsBucket,
  getRecordPoints,
  getRecordRank,
  getRecordTier,
} from '@/utils'
import { useStyleStore } from '@/stores/style'

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

  const loading = ref(false)
  const profile = ref<Player | null>(null)
  const steamProfile = ref<PlayerSteam | null>(null)
  const maps = ref<Map[]>([])
  const allRecords = ref<Record[]>([])

  const recordQuery = reactive<PlayerRecordQuery>({ ...defaultRecordQuery })

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

      if (recordQuery.points && pointsBucket !== recordQuery.points) {
        return false
      }

      return true
    })

    return sortPlayerRecords(records, recordQuery.sort_by, recordQuery.sort_order)
  })

  watch(currentPlayerId, async () => {
    resetRecordQuery()
  })

  watch(
    currentPlayerId,
    async () => {
      loading.value = true

      try {
        await Promise.all([getProfile(), getSteamProfile(), getMaps(), getPlayerRecords()])
      } finally {
        loading.value = false
      }
    },
    { immediate: true },
  )

  watch(mode, async () => {
    loading.value = true

    try {
      await Promise.all([getProfile(), getPlayerRecords()])
    } finally {
      loading.value = false
    }
  })

  watch([() => leaderboardType.value, () => rankedOnly.value], async () => {
    loading.value = true

    try {
      await getPlayerRecords()
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

  async function getPlayerRecords() {
    try {
      const { data } = await api.get('/records', {
        params: {
          player: currentPlayerId.value,
          mode: mode.value,
          has_teleports: leaderboardType.value === 'overall' ? null : false,
          top: true,
          ranked: rankedOnly.value ? true : undefined,
          offset: 0,
          limit: 10000,
        },
      })

      if (data) {
        allRecords.value = data.values
      } else {
        allRecords.value = []
      }
    } catch (error) {
      console.error('[fetch error]', error)
      allRecords.value = []
    }
  }

  function resetRecordQuery() {
    Object.assign(recordQuery, { ...defaultRecordQuery })
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
    records: filteredRecords,
    totalCourses,
    completedCourses,
    topRecords,
    pointsDistribution,
    resetRecordQuery,
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
