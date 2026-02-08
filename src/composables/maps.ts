import type { Map, MapQuery } from '@/types'
import { ref, watch, reactive, computed } from 'vue'
import { validQuery, api } from '@/utils'
import { debounce } from 'radash'
import { useStyleStore } from '@/stores/style'
import { getTierNumber, getTierColor } from '@/utils'

export function useMaps(initialQuery: Partial<MapQuery> = {}) {
  const styleStore = useStyleStore()

  const loading = ref(false)
  const maps = ref<Map[]>([])

  const total = ref(0)

  const defaultQuery: MapQuery = {
    name: '',
    randomName: '',
    tier: [],
    mode: styleStore.mode,
    leaderboardType: styleStore.leaderboardType,
    state: 'approved',
    limit: 10000,
    offset: 0,
  }

  const query = reactive<MapQuery>({ ...defaultQuery, ...initialQuery })

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
            .filter((course) => (query.tier.length > 0 ? query.tier.includes(course.tier) : true)),
          approved_at: map.approved_at,
        }
      })
      .filter((map) => map.name.includes(query.name))
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

  getMaps()

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
    total,
    resetQuery,
    pickRandomMap,
  }
}
