import type { Server, ServerResponse, ServerQuery } from '@/types'
import { debounce } from 'radash'
import { ref, reactive, watch } from 'vue'
import { api, validQuery } from '@/utils'

export function useServers() {
  const loading = ref(false)
  const error = ref(null)
  const servers = ref<Server[]>([])

  const query = reactive<ServerQuery>({
    name: '',
    host: '',
    owned_by: '',
    include_degloballed: false,
    limit: 30,
    offset: 0,
  })

  const debouncedUpdate = debounce({ delay: 300 }, getServers)

  watch([() => query.name, () => query.host, () => query.owned_by], debouncedUpdate)

  watch([() => query.limit, () => query.offset], getServers)

  async function getServers() {
    try {
      loading.value = true

      const { data } = await api.get<ServerResponse | undefined>('/servers', {
        params: validQuery(query),
      })

      if (data) {
        servers.value = data.values
      } else {
        servers.value = []
      }
    } catch (err) {
      console.error(err)
      servers.value = []
    } finally {
      loading.value = false
    }
  }

  getServers()

  return {
    servers,
    loading,
    error,
    query,
  }
}
