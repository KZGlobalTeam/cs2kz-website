import type { Server, ServerResponse, ServerQuery } from '@/types'
import { debounce } from 'radash'
import { ref, reactive, watch, toRaw } from 'vue'
import { api, validQuery } from '@/utils'

export function useServers() {
  const loading = ref(false)
  const error = ref(null)
  const servers = ref<Server[]>([])
  const total = ref(0)

  const query = reactive<ServerQuery>({
    name: '',
    host: '',
    owned_by: '',
    include_degloballed: false,
    limit: 30,
    offset: 0,
  })

  const debouncedUpdate = debounce({ delay: 300 }, () => getServers({ offset: 0 }))

  watch([() => query.name, () => query.host, () => query.owned_by], debouncedUpdate)

  watch([() => query.limit], () => getServers({ offset: 0 }))

  async function getServers({ offset }: { offset: number }) {
    try {
      loading.value = true

      const transformedQuery = {
        ...toRaw(query),
        offset,
      }

      const { data } = await api.get<ServerResponse | undefined>('/servers', {
        params: validQuery(transformedQuery),
      })

      if (data) {
        if (offset === 0) {
          servers.value = data.values
        } else {
          servers.value.push(...data.values)
        }
        total.value = data.total
      } else {
        servers.value = []
        total.value = 0
      }
    } catch (err) {
      console.log('[fetch error]', err)
      servers.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  getServers({ offset: 0 })

  async function incrementServers() {
    if (loading.value || servers.value.length >= total.value) {
      return
    }

    getServers({ offset: servers.value.length })
  }

  return {
    servers,
    loading,
    error,
    query,
    total,
    incrementServers,
  }
}
