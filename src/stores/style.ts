import { defineStore } from 'pinia'
import type { Mode } from '@/types'

interface State {
  mode: Mode
  pro: boolean
}

export const useStyleStore = defineStore('style', {
  state: (): State => {
    return {
      mode: 'classic',
      pro: false,
    }
  },
})
