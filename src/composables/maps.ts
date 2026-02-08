import type { Map, MapQuery, Record } from '@/types'
import { ref, watch, reactive, computed } from 'vue'
import { api, validQuery } from '@/utils'
import { useStyleStore } from '@/stores/style'
import { usePlayerStore } from '@/stores/player'
import { getTierNumber, getTierColor } from '@/utils'

export function useMaps(initialQuery: Partial<MapQuery> = {}) {
  const styleStore = useStyleStore()

  const playerStore = usePlayerStore()

  const loading = ref(false)
  const maps = ref<Map[]>([])

  const total = ref(0)

  const completedCourseKeys = ref(new Set<string>())
  const wrCourseTimes = ref(new Map<string, number>())

  const defaultQuery: MapQuery = {
    name: '',
    mapper: '',
    randomName: '',
    unfinishedOnly: false,
    lengthRangeKeys: [],
    tier: [],
    mode: styleStore.mode,
    leaderboardType: styleStore.leaderboardType,
    state: 'approved',
    limit: 10000,
    offset: 0,
  }

  const query = reactive<MapQuery>({ ...defaultQuery, ...initialQuery })

  const lengthRanges = computed(() => {
    const minutes = new Set<number>()

    for (const time of wrCourseTimes.value.values()) {
      minutes.add(Math.floor(time / 60))
    }

    return Array.from(minutes)
      .sort((a, b) => a - b)
      .map((minute) => {
        const minSeconds = minute * 60
        const maxSeconds = minSeconds + 60
        return {
          key: `${minSeconds}-${maxSeconds}`,
          minSeconds,
          maxSeconds,
          minMinutes: minute,
          maxMinutes: minute + 1,
        }
      })
  })

  const selectedLengthRanges = computed(() => {
    if (query.lengthRangeKeys.length === 0) return []
    const selectedKeys = new Set(query.lengthRangeKeys)
    return lengthRanges.value.filter((range) => selectedKeys.has(range.key))
  })

  const transformedMaps = computed(() =>
    maps.value
      .map((map) => {
        return {
          id: map.id,
          name: map.name,
          state: map.state,
          mappers: map.mappers,
          courses: map.courses
            .map((course) => {
              const tier = course.filters[query.mode][query.leaderboardType === 'overall' ? 'nub_tier' : 'pro_tier']
              return {
                name: course.name,
                tier,
                tierNo: getTierNumber(tier),
                tierColor: getTierColor(tier),
                state: course.filters[query.mode].state,
              }
            })
            .filter((course) => (query.tier.length > 0 ? query.tier.includes(course.tier) : true))
            .filter((course) => {
              if (!query.unfinishedOnly) return true
              return !completedCourseKeys.value.has(`${map.name}:${course.name}`)
            })
            .filter((course) => {
              const ranges = selectedLengthRanges.value
              if (ranges.length === 0) return true
              const wrTime = wrCourseTimes.value.get(`${map.name}:${course.name}`)
              if (wrTime === undefined) return false
              return ranges.some((range) => wrTime >= range.minSeconds && wrTime < range.maxSeconds)
            }),
          approved_at: map.approved_at,
        }
      })
      .filter((map) => map.name.includes(query.name))
      .filter((map) => {
        if (query.mapper === '') return true
        const needle = query.mapper.toLowerCase()
        return map.mappers.some((mapper) => mapper.name.toLowerCase().includes(needle))
      })
      .filter((map) => {
        if (map.courses.length === 0) return false
        if (query.randomName === '') {
          return true
        } else {
          return map.name === query.randomName
        }
      })
      .sort((a, b) => new Date(b.approved_at).getTime() - new Date(a.approved_at).getTime()),
  )

  styleStore.$subscribe((_mutation, state) => {
    query.mode = state.mode
    query.leaderboardType = state.leaderboardType
  })

  watch([() => query.mode, () => query.state, () => query.limit, () => query.offset], getMaps)
  watch([() => query.mode, () => query.leaderboardType], getWrs)
  watch(lengthRanges, (ranges) => {
    if (query.lengthRangeKeys.length === 0) return
    const validKeys = new Set(ranges.map((range) => range.key))
    query.lengthRangeKeys = query.lengthRangeKeys.filter((key) => validKeys.has(key))
  })

  watch(
    () => query.unfinishedOnly,
    async (unfinishedOnly) => {
      if (unfinishedOnly && playerStore.player) {
        loading.value = true

        try {
          const { data } = await api.get('/records', {
            params: {
              mode: styleStore.mode,
              has_teleports: styleStore.leaderboardType === 'overall' ? null : true,
              top: true,
              player: playerStore.player.id,
              limit: 10000,
              offset: 0,
            },
          })

          if (data) {
            const playerRecords: Record[] = data.values

            completedCourseKeys.value = new Set(
              playerRecords.map((record) => `${record.map.name}:${record.course.name}`),
            )
          }
        } catch (error) {
          console.error('[fetch error]', error)
        } finally {
          loading.value = false
        }
      }
    },
  )

  getMaps()
  getWrs()

  function resetQuery() {
    Object.assign(query, defaultQuery)
  }

  async function getMaps() {
    try {
      loading.value = true

      const { data } = await api.get('/maps', {
        params: {
          name: query.name,
          state: query.state,
          limit: query.limit,
          offset: query.offset,
          sort_order: 'descending',
          sort_by: 'submission-date',
        },
      })
      if (data) {
        total.value = data.total
        maps.value = data.values
      } else {
        maps.value = []
        total.value = 0
      }
    } catch (err) {
      console.log('[fetch error]', err)
      maps.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  async function getWrs() {
    try {
      const { data } = await api.get('/records', {
        params: validQuery({
          mode: styleStore.mode,
          leaderboardType: null,
          has_teleports: styleStore.leaderboardType === 'overall' ? null : false,
          top: true,
          max_rank: 1,
          limit: 10000,
          offset: 0,
        }),
      })

      if (data) {
        const wrs: Record[] = data.values
        const nextTimes = new Map<string, number>()

        for (const record of wrs) {
          const key = `${record.map.name}:${record.course.name}`
          const existing = nextTimes.get(key)
          if (existing === undefined || record.time < existing) {
            nextTimes.set(key, record.time)
          }
        }

        wrCourseTimes.value = nextTimes
      } else {
        wrCourseTimes.value = new Map()
      }
    } catch (error) {
      console.error('[fetch error]', error)
      wrCourseTimes.value = new Map()
    }
  }

  function pickRandomMap() {
    const mapCount = maps.value.length
    if (mapCount > 0) {
      query.randomName = maps.value[Math.floor(Math.random() * mapCount)].name
    }
  }

  return {
    maps: transformedMaps,
    loading,
    query,
    lengthRanges,
    total,
    resetQuery,
    pickRandomMap,
  }
}
