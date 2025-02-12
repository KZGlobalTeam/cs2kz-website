import type { Server, ServerResponse, ServerQuery } from "~/types"
import { debounce } from "radash"

export function useServers() {
  const { $api } = useNuxtApp()

  const loading = ref(false)
  const error = ref(null)
  const servers = ref<Server[]>([])

  const total = ref(0)

  const query = reactive<ServerQuery>({
    name: "",
    host: "",
    owned_by: "",
    limit: 30,
    offset: 0,
  })

  const debouncedUpdate = debounce({ delay: 300 }, getServers)

  watch([() => query.name, () => query.host, () => query.owned_by], debouncedUpdate)

  watch([() => query.limit, () => query.offset], getServers)

  async function getServers() {
    try {
      loading.value = true

      const data: ServerResponse | undefined = await $api("/servers", {
        query: validQuery(query),
      })
      if (data) {
        total.value = data.total
        servers.value = data.values
      } else {
        servers.value = []
        total.value = 0
      }
    } catch (err) {
      console.error(err)
      servers.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  return {
    servers,
    loading,
    error,
    query,
    total,
    getServers,
  }
}
