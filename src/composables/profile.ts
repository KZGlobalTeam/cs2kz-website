import { ref, reactive, watch } from 'vue'
import type { Profile, ProfileQuery } from '@/types'
import { api } from '@/utils'

export function useProfile(playerId: string) {
  const profile = ref<Profile | null>(null)

  const query = reactive<ProfileQuery>({
    player_id: playerId,
  })

  watch(query, getProfile)

  getProfile()

  async function getProfile() {
    try {
      const { data } = await api.get(`/players/${query.player_id}`)

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
