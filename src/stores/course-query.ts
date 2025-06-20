import { defineStore } from 'pinia'
import type { Mode } from '@/types'

export const useCourseQueryStore = defineStore('course-query', {
  state: () => {
    return {
      course: '',
      mode: 'classic' as Mode,
      pro: false,
    }
  },
})
