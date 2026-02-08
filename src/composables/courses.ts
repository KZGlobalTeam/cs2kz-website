import type { CourseInfo, MapResponse, CourseQuery } from '@/types'
import { ref, watch, reactive } from 'vue'
import { api } from '@/utils'
import { v4 as uuidv4 } from 'uuid'
import { useStyleStore } from '@/stores/style'

type CS2Modes = 'ckz' | 'vnl'

export function useCourses(initialQuery: Partial<CourseQuery> = {}) {
  const styleStore = useStyleStore()

  const loading = ref(false)

  const courses = ref<CourseInfo[]>([])

  const total = ref(0)

  const defaultQuery: CourseQuery = {
    name: '',
    mode: styleStore.mode,
    leaderboardType: styleStore.leaderboardType,
    sort_by: 'map',
    sort_order: 'ascending',
    limit: 30,
    offset: 0,
  }

  const query = reactive<CourseQuery>({ ...defaultQuery, ...initialQuery })

  styleStore.$subscribe((_mutation, state) => {
    query.mode = state.mode
    query.leaderboardType = state.leaderboardType
  })

  watch([() => query.mode, () => query.leaderboardType], getCourses)

  async function getCourses() {
    try {
      loading.value = true

      // fetch all maps at once and do pagination on the frontend
      const { data } = await api.get<MapResponse | undefined>('/maps', {
        params: { state: 'approved' },
      })

      if (data) {
        const res = data.values.flatMap((map) =>
          map.courses.map((course, index) => {
            return {
              id: uuidv4(),
              name: course.name,
              map: map.name,
              tier:
                query.leaderboardType === 'pro'
                  ? course.filters[query.mode].pro_tier
                  : course.filters[query.mode].nub_tier,
              state: course.filters[query.mode].state,
              mappers: course.mappers,
              approved_at: map.approved_at,
              img: `https://github.com/kzglobalteam/cs2kz-images/raw/public/webp/medium/${map.name}/${index + 1}.webp`,
            }
          }),
        )

        courses.value = res
        total.value = res.length
      } else {
        courses.value = []
        total.value = 0
      }
    } catch (err) {
      console.log('[fetch error]', err)

      courses.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  getCourses()

  return {
    courses,
    loading,
    query,
    total,
  }
}
