import type { LeaderboardQuery, PlayerWithAvatar } from '@/types'
import { useStyleStore } from '@/stores/style'
import { reactive, ref, watch } from 'vue'
import { api } from '@/utils'
import { attachAvatarsToPlayers } from '@/composables/steam-avatars'

export function useRatingLeaderboard() {
  const styleStore = useStyleStore()

  const loading = ref(false)

  const leaderboard = ref<PlayerWithAvatar[]>([])

  const total = ref(0)

  const query = reactive<LeaderboardQuery>({
    mode: styleStore.mode,
    offset: 0,
    limit: 50,
  })

  styleStore.$subscribe((_mutation, state) => {
    query.mode = state.mode
  })

  watch([() => query.offset, () => query.limit], () => {
    getLeaderboard({})
  })

  watch(
    () => query.mode,
    () => {
      if (query.offset !== 0) {
        query.offset = 0
        return
      }

      getLeaderboard({ offset: 0 })
    },
  )

  getLeaderboard({ offset: 0 })

  async function getLeaderboard({ offset }: { offset?: number }) {
    try {
      loading.value = true

      const { data } = await api.get(`/players`, {
        params: {
          sort_by: query.mode === 'classic' ? 'ckz-rating' : 'vnl-rating',
          offset: offset ?? query.offset,
          limit: query.limit,
        },
      })

      if (data) {
        leaderboard.value = await attachAvatarsToPlayers(data.values)
        total.value = data.total
      } else {
        leaderboard.value = []
        total.value = 0
      }
    } catch (error) {
      console.log('[fetch error]', error)
      leaderboard.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    leaderboard,
    loading,
    total,
    query,
  }
}
