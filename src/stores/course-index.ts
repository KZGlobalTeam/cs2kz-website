import { defineStore } from 'pinia'

import { api } from '@/utils'
import type { Map as KZMap } from '@/types'

export const useCourseIndexStore = defineStore('courseIndexStore', {
  state: () => {
    return {
      courseIndexMap: null as Map<string, number> | null,
    }
  },
  actions: {
    async buildCourseIndices() {
      try {
        const { data } = await api.get(`/maps`, { params: { limit: 10000 } })
        if (data) {
          if (data.total === 0) {
            this.courseIndexMap = null
            return
          }

          this.courseIndexMap = new Map()

          data.values.forEach((map: KZMap) => {
            map.courses.forEach((course, courseIndex) => {
              this.courseIndexMap!.set(`${map.name}&${course.name}`, courseIndex + 1)
            })
          })
        } else {
          this.courseIndexMap = null
        }
      } catch (error) {
        console.log('[fetch error]', error)
        this.courseIndexMap = null
      }
    },
  },
})
