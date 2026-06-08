import { watch } from 'vue'
import type { Pinia } from 'pinia'
import type { LeaderboardType, Mode } from '@/types'
import { useStyleStore } from '@/stores/style'
import type { LocationQueryRaw, RouteLocationNormalized, RouteLocationNormalizedLoaded, Router } from 'vue-router'

function parseMode(value: unknown): Mode | undefined {
  if (value === 'classic' || value === 'vanilla') {
    return value
  }
}

function parseLeaderboardType(value: unknown): LeaderboardType | undefined {
  if (value === 'overall' || value === 'pro') {
    return value
  }
}

function usesStyleQuery(route: RouteLocationNormalized | RouteLocationNormalizedLoaded) {
  return route.matched.some((record) => record.meta.usesStyleQuery === true)
}

function buildRouteLocation(route: RouteLocationNormalized | RouteLocationNormalizedLoaded, query: LocationQueryRaw) {
  if (route.name) {
    return {
      name: route.name,
      params: route.params,
      query,
      hash: route.hash,
      replace: true,
    }
  }

  return {
    path: route.path,
    query,
    hash: route.hash,
    replace: true,
  }
}

export function setupStyleQuerySync(router: Router, pinia: Pinia) {
  const styleStore = useStyleStore(pinia)

  router.beforeEach((to) => {
    const nextQuery: LocationQueryRaw = { ...to.query }

    if (!usesStyleQuery(to)) {
      let changed = false

      if ('mode' in nextQuery) {
        delete nextQuery.mode
        changed = true
      }

      if ('leaderboardType' in nextQuery) {
        delete nextQuery.leaderboardType
        changed = true
      }

      return changed ? buildRouteLocation(to, nextQuery) : true
    }

    const nextMode = parseMode(to.query.mode) ?? styleStore.mode
    const nextLeaderboardType = parseLeaderboardType(to.query.leaderboardType) ?? styleStore.leaderboardType

    if (styleStore.mode !== nextMode) {
      styleStore.mode = nextMode
    }

    if (styleStore.leaderboardType !== nextLeaderboardType) {
      styleStore.leaderboardType = nextLeaderboardType
    }

    let changed = false

    if (to.query.mode !== nextMode) {
      nextQuery.mode = nextMode
      changed = true
    }

    if (to.query.leaderboardType !== nextLeaderboardType) {
      nextQuery.leaderboardType = nextLeaderboardType
      changed = true
    }

    return changed ? buildRouteLocation(to, nextQuery) : true
  })

  watch(
    () => [styleStore.mode, styleStore.leaderboardType] as const,
    ([mode, leaderboardType]) => {
      const route = router.currentRoute.value

      if (!usesStyleQuery(route)) {
        return
      }

      if (route.query.mode === mode && route.query.leaderboardType === leaderboardType) {
        return
      }

      void router.replace(
        buildRouteLocation(route, {
          ...route.query,
          mode,
          leaderboardType,
        }),
      )
    },
  )
}
