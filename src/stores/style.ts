import { defineStore } from 'pinia'
import type { Mode } from '@/types'

interface State {
  mode: Mode
  leaderboardType: 'overall' | 'pro'
}

export const useStyleStore = defineStore('style', {
  state: (): State => {
    return {
      mode: 'classic',
      leaderboardType: 'overall',
    }
  },
})
