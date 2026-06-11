import type { ServerResponse, ServerQuery, RunningServer, GeoData, MapResponse, Tier } from '@/types'
import { ref, reactive, computed } from 'vue'
import { api, sort } from '@/utils'
import axios from 'axios'

export function useServers() {
  const loading = ref(false)
  const error = ref(null)

  const runningServers = ref<RunningServer[]>([])
  const globalMapTiers = ref(new Map<string, Tier>())

  const availableRegions = ref<{ name: string; code: string }[]>([])

  const defaultQuery: ServerQuery = {
    name: '',
    map: '',
    owner: '',
    region_code: undefined,
    globalMapOnly: false,
    sortBy: 'num_players',
    sortOrder: 'descending',
  }

  const query = reactive<ServerQuery>({ ...defaultQuery })

  const servers = computed(() => {
    const filtered = runningServers.value.filter(
      (server) =>
        (server.current_map.name.startsWith('kz_') ||
          // shoutout jakke for brilliant idea
          (!server.current_map.name.startsWith('kz_') && server.num_players === 0)) &&
        server.name.toLowerCase().includes(query.name.toLowerCase()) &&
        server.owner.name.toLowerCase().includes(query.owner.toLowerCase()) &&
        server.current_map.name.toLowerCase().includes(query.map.toLowerCase()) &&
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
              isGlobal:
                server.a2s_info!.current_map_info !== null &&
                server.a2s_info!.current_map_info?.global_state === 'approved',
              tier: undefined,
            },
            num_players: server.a2s_info!.num_players,
            max_players: server.a2s_info!.max_players,
          }
        })
      } else {
        runningServers.value = []
      }
    } catch (err) {
      console.error(err)
      runningServers.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchGlobalMapTiers() {
    try {
      const { data } = await api.get<MapResponse | undefined>('/maps', {
        params: {
          state: 'approved',
          limit: 10000,
          offset: 0,
        },
      })

      if (data) {
        const nextTiers = new Map<string, Tier>()

        for (const map of data.values) {
          const firstCourse = map.courses[0]
          if (!firstCourse) continue

          nextTiers.set(map.name, firstCourse.filters.classic.nub_tier)
        }

        globalMapTiers.value = nextTiers
      } else {
        globalMapTiers.value = new Map()
      }
    } catch (error) {
      console.error('[fetch error', error)
      globalMapTiers.value = new Map()
    }
  }

  function fillMapTiers() {
    runningServers.value.forEach((server) => {
      server.current_map.tier = globalMapTiers.value.get(server.current_map.name)
    })
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
    await Promise.all([fetchServers(), fetchGlobalMapTiers()])
    fillMapTiers()
    await fillCountries()
  }

  function resetQuery() {
    Object.assign(query, defaultQuery)
  }

  getServers()

  return {
    resetQuery,
    getServers,
    servers,
    availableRegions,
    loading,
    error,
    query,
  }
}
