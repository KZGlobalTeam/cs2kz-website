import { computed, reactive, ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type { CourseInfo, Map, Player, PlayerRecordQuery, PlayerSteam, Record } from '@/types'
import {
  api,
  calcCompletedCourses,
  calcTopRecords,
  calcPointsDistribution,
  calcTotalCourses,
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

  const mapperMaps = computed(() =>
    maps.value.filter((map) => map.mappers.some((mapper) => mapper.id === currentPlayerId.value)),
  )

  const leaderboardRecords = computed(() => {
    if (leaderboardType.value === 'pro') {
      return allRecords.value.filter((record) => record.teleports === 0)
    }

    return allRecords.value
  })

  const totalCourses = computed(() =>
    calcTotalCourses(
      maps.value.flatMap((map) =>
        map.courses.map((course, index) => {
          return {
            id: `${map.id}-${index}`,
            name: course.name,
            map: map.name,
            tier:
              leaderboardType.value === 'pro'
                ? course.filters[mode.value].pro_tier
                : course.filters[mode.value].nub_tier,
            state: course.filters[mode.value].state,
            mappers: course.mappers,
            approved_at: map.approved_at,
            img: '',
          } satisfies CourseInfo
        }),
      ),
    ),
  )

  const completion = computed(() => {
    return {
      ...calcTopRecords(leaderboardRecords.value, leaderboardType.value),
      pointsDistribution: calcPointsDistribution(leaderboardRecords.value, leaderboardType.value),
      completedCourses: calcCompletedCourses(leaderboardRecords.value, leaderboardType.value),
      totalCourses: totalCourses.value,
    }
  })

  const filteredRecords = computed(() => {
    const records = leaderboardRecords.value.filter((record) => {
      if (recordQuery.map && !record.map.name.toLowerCase().includes(recordQuery.map.toLowerCase())) {
        return false
      }

      if (recordQuery.server && !record.server.name.toLowerCase().includes(recordQuery.server.toLowerCase())) {
        return false
      }

      if (recordQuery.tier && getRecordTier(record, leaderboardType.value) !== recordQuery.tier) {
        return false
      }

      if (recordQuery.rank !== undefined) {
        const rank = getRecordRank(record, leaderboardType.value)

        if (rank > recordQuery.rank) {
          return false
        }
      }

      if (recordQuery.points !== undefined) {
        const points = getRecordPoints(record, leaderboardType.value)

        if (getPointsBucket(points) !== recordQuery.points) {
          return false
        }
      }

      return true
    })

    return sortPlayerRecords(records, recordQuery.sort_by, recordQuery.sort_order)
  })

  watch(
    () => currentPlayerId.value,
    () => {
      resetRecordQuery()
    },
  )

  watch(
    [() => currentPlayerId.value, () => mode.value],
    async () => {
      await fetchPlayerData()
    },
    { immediate: true },
  )

  async function fetchPlayerData() {
    loading.value = true

    try {
      await Promise.all([getProfile(), getSteamProfile(), getMaps(), getPlayerRecords()])
    } finally {
      loading.value = false
    }
  }

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
          top: true,
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
    recordQuery,
    records: filteredRecords,
    completion,
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
