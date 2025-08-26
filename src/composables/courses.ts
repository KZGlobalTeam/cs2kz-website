import type { Tier, CourseInfo, MapResponse, CourseQuery, CS2Filters } from '@/types'
import { ref, watch, reactive } from 'vue'
import { debounce } from 'radash'
import { api, sort } from '@/utils'
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

  const allCourses = ref<CourseInfo[]>([])
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

  const debouncedUpdate = debounce({ delay: 300 }, update)

  watch([() => query.name], debouncedUpdate)

  watch([() => query.mode, () => query.pro], getCourses)

  watch([() => query.tier, () => query.sort_by, () => query.sort_order, () => query.limit, () => query.offset], update)

  function update() {
    if (allCourses.value.length > 0) {
      const searched = search(allCourses.value, query.name)
      const tiered = matchTier(searched, query.tier)
      const sorted = sort(tiered, query.sort_order, query.sort_by)
      const paginated = sorted.slice(query.offset, query.offset + query.limit)
      total.value = paginated.length
      courses.value = paginated
    }
  }

  function search(data: CourseInfo[], name: string) {
    if (name === '') {
      return data
    }

    return data.filter((course) => course.name.toLowerCase().includes(name) || course.map.toLowerCase().includes(name))
  }

  function matchTier(data: CourseInfo[], tier?: Tier) {
    if (!tier) {
      return data
    } else {
      return data.filter((course) => course.tier === tier)
    }
  }

  async function getCourses() {
    try {
      loading.value = true

      // fetch all maps at once and do pagination on the frontend
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

        allCourses.value = res
        update()

        total.value = res.length
      } else {
        allCourses.value = []
        courses.value = []
        total.value = 0
      }
    } catch (err) {
      console.error(err)
      allCourses.value = []
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
