import { defineStore } from 'pinia'
import type { Mode } from '@/types'

interface State {
  courseId: number
  mode: Mode
  pro: boolean
}

export const useCourseQueryStore = defineStore('course-query', {
  state: (): State => {
    return {
      courseId: -1,
      mode: 'classic',
      pro: false,
    }
  },
})
