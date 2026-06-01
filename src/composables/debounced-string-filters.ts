import { debounce } from 'radash'
import { isRef, reactive, toRefs, watch, type Ref } from 'vue'

type MaybeRef<T> = Ref<T> | T

type StringKeys<T> = {
  [K in keyof T]-?: T[K] extends string ? K : never
}[keyof T]

export function useDebouncedStringFilters<T extends object, K extends StringKeys<T>>(
  source: MaybeRef<T>,
  fields: readonly K[],
  delay = 300,
): { [P in K]: Ref<T[P]> } {
  const getSource = () => (isRef(source) ? source.value : source)

  const localFilters = reactive(
    Object.fromEntries(fields.map((field) => [field, getSource()[field]])) as Pick<T, K>,
  ) as { [P in K]: T[P] }

  const updateSource = debounce({ delay }, (nextValues: Pick<T, K>) => {
    const current = getSource() as T

    for (const field of fields) {
      current[field] = nextValues[field]
    }
  })

  watch(
    () => fields.map((field) => localFilters[field]),
    (values) => {
      const nextValues = {} as Pick<T, K>

      fields.forEach((field, index) => {
        nextValues[field] = values[index] as T[K]
      })

      updateSource(nextValues)
    },
  )

  watch(
    () => fields.map((field) => getSource()[field]),
    (values) => {
      fields.forEach((field, index) => {
        const value = values[index] as T[K]

        if (localFilters[field] !== value) {
          localFilters[field] = value
        }
      })
    },
  )

  return toRefs(localFilters) as { [P in K]: Ref<T[P]> }
}
