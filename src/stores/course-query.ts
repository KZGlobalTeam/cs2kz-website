import { defineStore } from 'pinia'
import type { Mode } from '@/types'

export const useCourseQueryStore = defineStore('course-query', {
  state: () => {
    return {
      courseId: -1,
      mode: 'classic' as Mode,
      pro: false,
    }
  },
})
