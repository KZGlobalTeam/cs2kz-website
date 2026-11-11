import { defineStore } from 'pinia'

import { api } from '@/utils'
import type { Player } from '@/types'

export const useRankingStore = defineStore('ranking', {
  state: () => {
    return {
      ckzRanking: null as Player[] | null,
      vnlRanking: null as Player[] | null,
    }
  },
  actions: {
    async buildRankings() {
      try {
        const [ckzResult, vnlResult] = await Promise.all([
          api.get('/players?sort_by=ckz-rating&offset=0&limit=10000'),
          api.get('/players?sort_by=vnl-rating&offset=0&limit=10000'),
        ])

        this.ckzRanking = ckzResult.data.values || null
        this.vnlRanking = vnlResult.data.value || null
      } catch (error) {
        console.log('[fetch error]', error)
        this.ckzRanking = null
        this.vnlRanking = null
      }
    },
  },
})
