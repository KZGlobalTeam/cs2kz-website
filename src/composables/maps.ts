import type { Map, MapQuery } from '@/types'
import { ref, watch, reactive } from 'vue'
import { validQuery, api } from '@/utils'
import { debounce } from 'radash'

export function useMaps(initialQuery: Partial<MapQuery> = {}) {
  const loading = ref(false)
  const maps = ref<Map[]>([])

  const total = ref(0)

  const defaultQuery: MapQuery = {
    name: '',
    mode: 'classic',
    state: 'approved',
    leaderboardType: 'overall',
    limit: 99999,
    offset: 0,
  }

  const query = reactive<MapQuery>({ ...defaultQuery, ...initialQuery })

  const debouncedUpdate = debounce({ delay: 300 }, getMaps)

  watch([() => query.name], debouncedUpdate)

  watch(
    [
      () => query.mode,
      () => query.state,
      () => query.limit,
      () => query.offset,
      () => query.tier,
      () => query.leaderboardType,
    ],
    getMaps,
  )

  getMaps()

  async function getMaps() {
    try {
      loading.value = true

      const { data } = await api.get('/maps', {
        params: validQuery(query),
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
  }
}
