import type { LeaderboardQuery, Player } from '@/types'
import { useStyleStore } from '@/stores/style'
import { reactive, ref, watch } from 'vue'
import { api } from '@/utils'

export function useLeaderboard() {
  const styleStore = useStyleStore()

  const loading = ref(false)

  const leaderboard = ref<Player[]>([])

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

      // leaderboard.value = [
      //   {
      //     id: '1',
      //     name: 'neon',
      //     ckz_rating: 37500,
      //     vnl_rating: 28000,
      //     first_joined_at: '',
      //   },
      //   {
      //     id: '2',
      //     name: 'razor',
      //     ckz_rating: 35000,
      //     vnl_rating: 29000,
      //     first_joined_at: '',
      //   },
      //   {
      //     id: '3',
      //     name: 'leetly',
      //     ckz_rating: 30000,
      //     vnl_rating: 26000,
      //     first_joined_at: '',
      //   },
      //   {
      //     id: '4',
      //     name: 'Reeed',
      //     ckz_rating: 25000,
      //     vnl_rating: 26000,
      //     first_joined_at: '',
      //   },
      //   {
      //     id: '5',
      //     name: 'gus-qwq',
      //     ckz_rating: 20000,
      //     vnl_rating: 26000,
      //     first_joined_at: '',
      //   },
      // ]

      // return

      const { data } = await api.get(`/players`, {
        params: {
          sort_by: query.mode === 'classic' ? 'ckz-rating' : 'vnl-rating',
          offset: offset ?? query.offset,
          limit: query.limit,
        },
      })

      if (data) {
        leaderboard.value = data.values
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
