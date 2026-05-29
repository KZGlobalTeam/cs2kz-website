import type { RecordRaw, Record, RecordQuery } from '@/types'
import { ref, reactive, watch, toRaw } from 'vue'
import { api, validQuery } from '@/utils'
import { useStyleStore } from '@/stores/style'
import { debounce } from 'radash'
import { attachAvatarsToPlayerRecords } from '@/composables/steam-avatars'

interface UseRecordsOptions {
  withAvatar?: boolean
}

export function useRecords(initialQuery: Partial<RecordQuery> = {}, options: UseRecordsOptions = {}) {
  const styleStore = useStyleStore()

  const loading = ref(false)
  const records = ref<Record[]>([])
  const total = ref(0)

  const defaultQuery: RecordQuery = {
    mode: styleStore.mode,
    leaderboardType: styleStore.leaderboardType,
    top: true,
    ranked: true,
    max_rank: undefined,
    player: '',
    map: '',
    course: '',
    server: '',
    sort_by: 'submission-date',
    sort_order: 'descending',
    limit: 30,
    offset: 0,
  }

  const debouncedUpdate = debounce({ delay: 500 }, () => getRecords({ offset: 0 }))

  const query = reactive<RecordQuery>({ ...defaultQuery, ...initialQuery })

  styleStore.$subscribe((_mutation, state) => {
    query.mode = state.mode
    query.leaderboardType = state.leaderboardType
  })

  watch([() => query.player, () => query.map, () => query.course, () => query.server], debouncedUpdate)

  watch(
    [
      () => query.mode,
      () => query.leaderboardType,
      () => query.top,
      () => query.ranked,
      () => query.max_rank,
      () => query.sort_by,
      () => query.sort_order,
    ],
    () => {
      getRecords({ offset: 0 })
    },
  )

  getRecords({ offset: 0 })

  async function attachSteamProfiles(batch: RecordRaw[]) {
    if (!options.withAvatar || batch.length === 0) {
      return batch
    }

    return attachAvatarsToPlayerRecords(batch)
  }

  async function getRecords({ offset }: { offset: number }) {
    try {
      loading.value = true

      const transformedQuery = {
        ...toRaw(query),
        leaderboardType: null,
        has_teleports: query.leaderboardType === 'overall' ? null : false,
        offset,
      }

      const { data } = await api.get('/records', {
        params: validQuery(transformedQuery),
      })

      if (data) {
        const nextRecords = await attachSteamProfiles(data.values)

        // reset records if offset is 0 (new query), otherwise append
        if (offset === 0) {
          records.value = nextRecords
        } else {
          records.value = [...records.value, ...nextRecords]
        }
        total.value = data.total
      } else {
        records.value = []
        total.value = 0
      }
    } catch (error) {
      console.error('[fetch error]', error)

      records.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  async function incrementRecords() {
    if (loading.value || records.value.length >= total.value) {
      return
    }

    getRecords({ offset: records.value.length })
  }

  function resetQuery(initialQuery: Partial<RecordQuery> = {}) {
    Object.assign(query, { ...defaultQuery, ...initialQuery })
  }

  return {
    records,
    loading,
    query,
    total,
    incrementRecords,
    resetQuery,
    getRecords,
  }
}
