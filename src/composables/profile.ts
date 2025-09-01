import { ref, reactive, watch } from 'vue'
import type { Profile, ProfileQuery } from '@/types'
import { api } from '@/utils'

export function useProfile(playerId: string) {
  const profile = ref<Profile | 'pending' | null>('pending')

  const query = reactive<ProfileQuery>({
    player_id: playerId,
    mode: 'classic',
  })

  watch(query, getProfile)

  getProfile()

  async function getProfile() {
    try {
      profile.value = 'pending'

      const { data } = await api.get(`/players/${query.player_id}`, {
        params: { mode: query.mode },
      })

      profile.value = data
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
