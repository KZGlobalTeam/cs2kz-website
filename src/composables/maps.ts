import type { Map, MapQuery } from '@/types'
import { ref, watch, reactive } from 'vue'
import { validQuery, api } from '@/utils'
import { debounce } from 'radash'

export function useMaps(initialQuery: Partial<MapQuery> = {}) {
  const loading = ref(false)
  const maps = ref<Map[]>([])

  const total = ref(0)

  const defaultQuery: MapQuery = {
    game: 'cs2',
    name: '',
    randomName: '',
    tier: [],
    mode: 'classic',
    state: 'approved',
    pro: false,
    limit: 30,
    offset: 0,
  }

  const query = reactive<MapQuery>({ ...defaultQuery, ...initialQuery })

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
      console.error(err)
      maps.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  return {
    maps,
    loading,
    query,
    total,
    resetQuery,
  }
}
