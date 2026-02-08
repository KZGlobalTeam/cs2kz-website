import { ref, reactive, watch } from 'vue'
import type { Profile, ProfileQuery } from '@/types'
import { api } from '@/utils'
import { useStyleStore } from '@/stores/style'

export function useProfile(playerId: string) {
  const styleStore = useStyleStore()
  const profile = ref<Profile | null>(null)

  const query = reactive<ProfileQuery>({
    mode: styleStore.mode,
    player_id: playerId,
  })

  watch(query, getProfile)

  styleStore.$subscribe((_mutation, state) => {
    query.mode = state.mode
  })

  getProfile()

  async function getProfile() {
    try {
      const { data } = await api.get(`/players/${query.player_id}/profile`, {
        params: { mode: query.mode },
      })

      if (data) {
        profile.value = { ...data, rating: data.rating * 0.1 }
      }
    } catch (err) {
      console.log('[fetch error]', err)
      profile.value = null
    }
  }

  return {
    profile,
    query,
  }
}
