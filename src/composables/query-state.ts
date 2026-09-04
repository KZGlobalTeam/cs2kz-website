import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { LocationQuery, LocationQueryRaw, LocationQueryValue, LocationQueryValueRaw } from 'vue-router'

export interface QueryStateParam<T> {
  name: string
  defaultValue: T
  parse: (value: LocationQueryValue | LocationQueryValue[]) => T | undefined
  serialize: (value: T) => LocationQueryValueRaw | LocationQueryValueRaw[]
}

export type QueryStateConfig<T> = {
  [K in keyof T]?: QueryStateParam<T[K]>
}

export function getQueryValue(value: LocationQueryValue | LocationQueryValue[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export function readQueryState<T>(query: LocationQuery, config: QueryStateConfig<T>) {
  const state: Partial<T> = {}

  for (const key in config) {
    const param = config[key]
    if (!param) {
      continue
    }

    const value = query[param.name]
    if (value === undefined) {
      continue
    }

    const parsed = param.parse(value)
    if (parsed !== undefined || param.defaultValue !== undefined) {
      state[key] = parsed
    }
  }

  return state
}

export function syncQueryState<T extends object>(state: T, config: QueryStateConfig<T>) {
  const route = useRoute()
  const router = useRouter()

  watch(
    () => route.query,
    (query) => {
      for (const key in config) {
        const param = config[key]
        if (!param) {
          continue
        }

        const value = query[param.name]
        state[key] = (value === undefined ? cloneValue(param.defaultValue) : param.parse(value)) as T[typeof key]
      }
    },
    { deep: true },
  )

  watch(
    () => Object.keys(config).map((key) => state[key as keyof T]),
    () => {
      const query: LocationQueryRaw = { ...route.query }

      for (const key in config) {
        const param = config[key]
        if (!param) {
          continue
        }

        const value = state[key]
        if (valuesEqual(value, param.defaultValue)) {
          delete query[param.name]
        } else {
          query[param.name] = param.serialize(value)
        }
      }

      if (!queriesEqual(query, route.query)) {
        void router.replace({ query })
      }
    },
    { deep: true },
  )
}

function cloneValue<T>(value: T): T {
  return Array.isArray(value) ? ([...value] as T) : value
}

function valuesEqual(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function queriesEqual(left: LocationQueryRaw, right: LocationQuery) {
  const leftKeys = Object.keys(left)
  const rightKeys = Object.keys(right)

  if (leftKeys.length !== rightKeys.length) {
    return false
  }

  return leftKeys.every((key) => valuesEqual(left[key], right[key]))
}
