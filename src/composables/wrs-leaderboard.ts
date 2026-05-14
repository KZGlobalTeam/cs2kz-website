import { computed, ref, watch } from 'vue'
import type { LeaderboardType, Mode, Record } from '@/types'
import { useStyleStore } from '@/stores/style'
import { api } from '@/utils'

export interface PlayerWrEntry {
  player: Record['player']
  count: number
  records: Record[]
}

export function useWRsLeaderboard() {
  const styleStore = useStyleStore()

  const loading = ref(false)
  const records = ref<Record[]>([])

  const leaderboard = computed<PlayerWrEntry[]>(() => {
    const playerMap = new Map<string, PlayerWrEntry>()

    records.value.forEach((record) => {
      const existing = playerMap.get(record.player.id)

      if (existing) {
        existing.count += 1
        existing.records.push(record)
        return
      }

      playerMap.set(record.player.id, {
        player: record.player,
        count: 1,
        records: [record],
      })
    })

    return Array.from(playerMap.values())
      .map((entry) => ({
        ...entry,
        records: [...entry.records].sort((a, b) => a.time - b.time),
      }))
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count
        }

        return a.player.name.localeCompare(b.player.name)
      })
  })

  watch(
    () => [styleStore.mode, styleStore.leaderboardType] as const,
    async ([mode, leaderboardType]) => {
      loading.value = true

      try {
        const playerWrs = await fetchWorldRecords(mode, leaderboardType)

        records.value = playerWrs
      } catch (error) {
        console.log('[fetch error]', error)

        records.value = []
      } finally {
        loading.value = false
      }
    },
    { immediate: true },
  )

  return {
    leaderboard,
    loading,
  }
}

async function fetchWorldRecords(mode: Mode, leaderboardType: LeaderboardType) {
  const { data } = await api.get('/records', {
    params: {
      mode,
      top: true,
      max_rank: 1,
      sort_by: 'submission-date',
      sort_order: 'descending',
      limit: 10000,
      offset: 0,
      has_teleports: leaderboardType === 'pro' ? false : null,
    },
  })

  return data?.values ?? []
}
