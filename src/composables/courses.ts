import type { CourseInfo, MapResponse, CourseQuery, CS2Filters } from '@/types'
import { ref, watch, reactive } from 'vue'
import { api } from '@/utils'
import { v4 as uuidv4 } from 'uuid'

const modeMap = {
  classic: 'ckz',
  'vanilla-cs2': 'vnl',
  kztimer: 'kzt',
  simplekz: 'skz',
  'vanilla-csgo': 'vnl',
}

type CS2Modes = 'ckz' | 'vnl'

export function useCourses(initialQuery: Partial<CourseQuery> = {}) {
  const loading = ref(false)

  const courses = ref<CourseInfo[]>([])

  const total = ref(0)

  const defaultQuery: CourseQuery = {
    name: '',
    mode: 'classic',
    pro: false,
    sort_by: 'map',
    sort_order: 'ascending',
    limit: 30,
    offset: 0,
  }

  const query = reactive<CourseQuery>({ ...defaultQuery, ...initialQuery })

  watch([() => query.mode, () => query.pro], getCourses)

  async function getCourses() {
    try {
      loading.value = true

      const { data } = await api.get<MapResponse | undefined>('/maps')

      if (data) {
        const modeKey = modeMap[query.mode] as CS2Modes

        const res = data.values.flatMap((map) =>
          map.courses.map((course, index) => {
            return {
              id: uuidv4(),
              name: course.name,
              map: map.name,
              tier: query.pro
                ? (course.filters as CS2Filters)[modeKey].pro_tier
                : (course.filters as CS2Filters)[modeKey].nub_tier,
              ranked: (course.filters as CS2Filters)[modeKey].ranked,
              mappers: course.mappers,
              created_at: map.created_at,
              img: `https://github.com/kzglobalteam/cs2kz-images/raw/public/webp/medium/${map.name}/${index + 1}.webp`,
            }
          }),
        )

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
