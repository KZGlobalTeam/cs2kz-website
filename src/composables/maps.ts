import type { Map, MapQuery, CS2Filters } from '@/types'
import { ref, watch, reactive, computed } from 'vue'
import { validQuery, api } from '@/utils'
import { debounce } from 'radash'
import { useStyleStore } from '@/stores/style'
import { getTierNumber, getTierColor, modeMap } from '@/utils'

type CS2Modes = 'ckz' | 'vnl'

export function useMaps(initialQuery: Partial<MapQuery> = {}) {
  const styleStore = useStyleStore()

  const loading = ref(false)
  const maps = ref<Map[]>([])

  const total = ref(0)

  const defaultQuery: MapQuery = {
    game: 'cs2',
    name: '',
    randomName: '',
    tier: [],
    mode: styleStore.mode,
    pro: styleStore.pro,
    state: 'approved',
    limit: 30,
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
          creator: map.created_by,
          courses: map.courses
            .map((course) => {
              const modeKey = modeMap[query.mode] as CS2Modes

              const tier = (course.filters as CS2Filters)[modeKey][query.pro ? 'nub_tier' : 'pro_tier']

              return {
                id: course.id,
                local_id: course.local_id,
                name: course.name,
                tier,
                tierNo: getTierNumber(tier),
                tierColor: getTierColor(tier),
                ranked: (course.filters as CS2Filters)[modeKey].ranked,
              }
            })
            .filter((course) => (query.tier.length > 0 ? query.tier.includes(course.tier) : true))
            .sort((a, b) => a.tierNo - b.tierNo),
          created_at: map.created_at,
        }
      })
      .filter((map) => {
        if (map.courses.length === 0) return false
        if (query.randomName === '') {
          return true
        } else {
          return map.name === query.randomName
        }
      }),
  )

  styleStore.$subscribe((_mutation, state) => {
    query.mode = state.mode
    query.pro = state.pro
  })

  const debouncedUpdate = debounce({ delay: 300 }, getMaps)

  watch([() => query.name], debouncedUpdate)

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
          game: query.game,
          name: query.name,
          state: query.state,
          limit: query.limit,
          offset: query.offset,
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
