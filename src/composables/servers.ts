import type { Server, ServerResponse, ServerQuery, RunningServer, GeoData } from '@/types'
import { debounce } from 'radash'
import { ref, reactive, watch, computed } from 'vue'
import { api, sort } from '@/utils'
import axios from 'axios'

export function useServers() {
  const loading = ref(false)
  const error = ref(null)
  const allServers = ref<Server[]>([])

  const runningServers = ref<RunningServer[]>([])

  const availableRegions = ref<{ name: string; code: string }[]>([])

  const query = reactive<ServerQuery>({
    name: '',
    map: '',
    owner: '',
    globalMapOnly: true,
    sortBy: 'num_players',
    sortOrder: 'descending',
  })

  const debouncedQuery = reactive({
    name: '',
    map: '',
    owner: '',
  })

  function updateDebouncedQuery() {
    debouncedQuery.name = query.name
    debouncedQuery.map = query.map
    debouncedQuery.owner = query.owner
  }

  const debouncedUpdate = debounce({ delay: 300 }, updateDebouncedQuery)

  watch([() => query.name, () => query.map, () => query.owner], debouncedUpdate)

  const servers = computed(() => {
    const filtered = runningServers.value.filter(
      (server) =>
        server.name.toLowerCase().includes(debouncedQuery.name.toLowerCase()) &&
        server.owner.name.toLowerCase().includes(debouncedQuery.owner.toLowerCase()) &&
        server.current_map.name.toLowerCase().includes(debouncedQuery.map.toLowerCase()) &&
        (query.region_code === undefined ? true : query.region_code === server.region!.code) &&
        (query.globalMapOnly ? server.current_map.isGlobal : true),
    )

    const sorted = sort(filtered, query.sortOrder, query.sortBy)

    return sorted
  })

  async function fetchServers() {
    try {
      loading.value = true

      const { data } = await api.get<ServerResponse | undefined>('/servers', {
        params: { limit: 10000, offset: 0 },
      })
      if (data) {
        const reachableServers = data.values.filter((server) => server.a2s_info !== null)

        runningServers.value = reachableServers.map((server) => {
          return {
            id: server.id,
            name: server.name,
            host: server.host,
            port: server.port,
            owner: server.owner,
            country: null,
            region: null,
            approved_at: server.approved_at,
            current_map: {
              name: server.a2s_info!.current_map,
              isGlobal: server.a2s_info!.current_map_info !== null,
            },
            num_players: server.a2s_info!.num_players,
            max_players: server.a2s_info!.max_players,
          }
        })
      } else {
        allServers.value = []
      }
    } catch (err) {
      console.error(err)
      allServers.value = []
    } finally {
      loading.value = false
    }
  }

  async function fillCountries() {
    try {
      const { data } = await axios.post<GeoData[]>(`${import.meta.env.VITE_GOKZ_TOP_API_URL}/misc/ip`, {
        addresses: runningServers.value.map((server) => server.host),
      })

      if (data) {
        runningServers.value.forEach((server, index) => {
          server.country = { name: data[index].country, code: data[index].country_code }
          server.region = { name: data[index].region_name, code: data[index].region_code }
        })
        // deduplicate regions and sort by occurences
        availableRegions.value = data
          .map((item) => ({ name: item.region_name, code: item.region_code }))
          .filter((item, index, arr) => arr.findIndex((i) => i.code === item.code) === index)
          .sort(
            (a, b) =>
              data.filter((i) => i.region_code === b.code).length - data.filter((i) => i.region_code === a.code).length,
          )
      } else {
        availableRegions.value = []
      }
    } catch (err) {
      console.error(err)
      availableRegions.value = []
    }
  }

  async function getServers() {
    await fetchServers()
    await fillCountries()
  }

  function resetQuery() {
    query.name = ''
    query.map = ''
    query.owner = ''
    query.region_code = undefined
    query.globalMapOnly = true
    query.sortBy = 'num_players'
    query.sortOrder = 'descending'
  }

  getServers()

  return {
    resetQuery,
    servers,
    availableRegions,
    loading,
    error,
    query,
  }
}
