import { onScopeDispose, ref, watch } from 'vue'
import { debounce } from 'radash'
import { isAxiosError } from 'axios'
import SteamID from 'steamid'
import type { Player, PlayerWithAvatar } from '@/types'
import { api } from '@/utils'
import { useStyleStore } from '@/stores/style'
import { attachAvatarsToPlayers } from '@/composables/steam-avatars'

interface UsePlayerSearchOptions {
  limit?: number
  delay?: number
}

const steamId64Pattern = /^\d{17}$/
const steamId32Pattern = /^STEAM_[0-5]:[01]:\d+$/i
const steamId3Pattern = /^\[[a-zA-Z]:[0-5]:\d+(:\d+)?\]$/

/**
 * Converts a SteamID (64-bit, 32-bit or Steam3 format) into a 64-bit SteamID.
 * Returns `undefined` when the input is not a SteamID.
 */
export function toSteamId64(input: string): string | undefined {
  const value = input.trim()

  if (!steamId64Pattern.test(value) && !steamId32Pattern.test(value) && !steamId3Pattern.test(value)) {
    return undefined
  }

  try {
    const steamId = new SteamID(value)

    return steamId.isValidIndividual() ? steamId.getSteamID64() : undefined
  } catch {
    return undefined
  }
}

export function usePlayerSearch(options: UsePlayerSearchOptions = {}) {
  const styleStore = useStyleStore()

  const limit = options.limit ?? 8

  const query = ref('')

  const results = ref<PlayerWithAvatar[]>([])

  const loading = ref(false)

  // used to discard responses of outdated searches
  let requestId = 0

  async function getPlayer(steamId64: string): Promise<Player[]> {
    try {
      const { data } = await api.get(`/players/${encodeURIComponent(steamId64)}`)

      return data ? [data] : []
    } catch (error) {
      // the API responds with a 404 when the player doesn't exist
      if (!isAxiosError(error) || error.response?.status !== 404) {
        console.log('[fetch error]', error)
      }

      return []
    }
  }

  async function getPlayersByName(name: string): Promise<Player[]> {
    const { data } = await api.get('/players', {
      params: {
        name,
        sort_by: styleStore.mode === 'classic' ? 'ckz-rating' : 'vnl-rating',
        limit,
        offset: 0,
      },
    })

    return data?.values ?? []
  }

  async function fetchPlayers(search: string) {
    const steamId64 = toSteamId64(search)

    if (steamId64) {
      const players = await getPlayer(steamId64)

      // fall back to a name search when no player matches the SteamID
      if (players.length > 0) {
        return attachAvatarsToPlayers(players)
      }
    }

    const players = await getPlayersByName(search)

    return attachAvatarsToPlayers(players)
  }

  const runSearch = debounce({ delay: options.delay ?? 300 }, async (search: string) => {
    const currentRequestId = ++requestId

    try {
      const players = await fetchPlayers(search)

      if (currentRequestId !== requestId) return

      results.value = players
    } catch (error) {
      console.log('[fetch error]', error)

      if (currentRequestId !== requestId) return

      results.value = []
    } finally {
      if (currentRequestId === requestId) {
        loading.value = false
      }
    }
  })

  watch([query, () => styleStore.mode], ([value]) => {
    const search = value.trim()

    if (search === '') {
      runSearch.cancel()
      requestId++
      results.value = []
      loading.value = false
      return
    }

    // show a pending state while the search is debounced
    loading.value = true
    runSearch(search)
  })

  onScopeDispose(() => {
    runSearch.cancel()
  })

  return {
    query,
    results,
    loading,
  }
}
