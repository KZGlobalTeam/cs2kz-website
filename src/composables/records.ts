import type { Record, RecordQuery } from '@/types'
import { debounce } from 'radash'
import { ref, reactive, watch, toRaw } from 'vue'
import { api, validQuery } from '@/utils'

export function useRecords(initialQuery: Partial<RecordQuery> = {}) {
  const loading = ref(false)
  const records = ref<Record[]>([])

  const total = ref(0)

  const defaultQuery: RecordQuery = {
    mode: 'classic',
    pro: false,
    top: true,
    player: '',
    course: '',
    server: '',
    sort_by: 'submission-date',
    sort_order: 'descending',
    limit: 30,
    offset: 0,
  }

  const query = reactive<RecordQuery>({ ...defaultQuery, ...initialQuery })

  const debouncedUpdate = debounce({ delay: 300 }, getRecords)

  watch([() => query.player, () => query.server], debouncedUpdate)

  watch(
    [
      () => query.mode,
      () => query.pro,
      () => query.top,
      () => query.course,
      () => query.max_rank,
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
