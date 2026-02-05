import type { Record, RecordQuery } from '@/types'
import { debounce } from 'radash'
import { ref, reactive, watch, toRaw } from 'vue'
import { api, validQuery } from '@/utils'
import { useRoute } from 'vue-router'

export function useRecords(initialQuery: Partial<RecordQuery> = {}) {
  const route = useRoute()

  const loading = ref(false)
  const records = ref<Record[]>([])

  const total = ref(0)

  const defaultQuery: RecordQuery = {
    mode: 'classic',
    leaderboardType: 'overall',
    top: true,
    player: '',
    map: '',
    course: '',
    server: '',
    styles: [],
    sort_by: 'submission-date',
    sort_order: 'descending',
    limit: 30,
    offset: 0,
  }

  const query = reactive<RecordQuery>({ ...defaultQuery, ...initialQuery })

  const debouncedUpdate = debounce({ delay: 300 }, getRecords)

  watch([() => query.player, () => query.map, () => query.course, () => query.server], debouncedUpdate)

  watch(
    [
      () => query.mode,
      () => query.leaderboardType,
      () => query.top,
      () => query.max_rank,
      () => query.styles,
      () => query.sort_by,
      () => query.sort_order,
      () => query.limit,
      () => query.offset,
    ],
    getRecords,
  )

  getRecords()

  async function getRecords() {
    try {
      loading.value = true

      const transformedQuery = {
        ...toRaw(query),
        leaderboardType: null,
        has_teleports: query.leaderboardType === 'overall' ? null : false,
        styles: query.styles.length === 0 ? null : query.styles,
      }

      const { data } = await api.get('/records', {
        params: validQuery(transformedQuery),
      })

      if (data) {
        records.value = data.values
        total.value = data.total
      } else {
        records.value = []
        total.value = 0
      }
    } catch (error) {
      console.error(error)

      records.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  return {
    records,
    loading,
    query,
    total,
  }
}
