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

function buildCanonicalQuery(
  route: RouteLocationNormalized | RouteLocationNormalizedLoaded,
  mode: Mode,
  leaderboardType: LeaderboardType,
) {
  const nextQuery: LocationQueryRaw = { ...route.query }

  if (!usesStyleQuery(route)) {
    delete nextQuery.mode
    delete nextQuery.leaderboardType

    return nextQuery
  }

  nextQuery.mode = mode
  nextQuery.leaderboardType = leaderboardType

  return nextQuery
}

function buildRouteLocation(route: RouteLocationNormalized | RouteLocationNormalizedLoaded, query: LocationQueryRaw) {
  if (route.name) {
    return {
      name: route.name,
      params: route.params,
      query,
      hash: route.hash,
    }
  }

  return {
    path: route.path,
    query,
    hash: route.hash,
  }
}

function syncStyleStoreFromRoute(
  route: RouteLocationNormalized | RouteLocationNormalizedLoaded,
  mode: Mode,
  leaderboardType: LeaderboardType,
  pinia: Pinia,
) {
  const styleStore = useStyleStore(pinia)

  if (!usesStyleQuery(route)) {
    return
  }

  if (styleStore.mode !== mode) {
    styleStore.mode = mode
  }

  if (styleStore.leaderboardType !== leaderboardType) {
    styleStore.leaderboardType = leaderboardType
  }
}

export function setupStyleQuerySync(router: Router, pinia: Pinia) {
  const styleStore = useStyleStore(pinia)

  router.beforeEach((to) => {
    const nextMode = parseMode(to.query.mode) ?? styleStore.mode
    const nextLeaderboardType = parseLeaderboardType(to.query.leaderboardType) ?? styleStore.leaderboardType

    syncStyleStoreFromRoute(to, nextMode, nextLeaderboardType, pinia)
  })

  router.afterEach((to) => {
    const nextQuery = buildCanonicalQuery(to, styleStore.mode, styleStore.leaderboardType)

    if (to.query.mode === nextQuery.mode && to.query.leaderboardType === nextQuery.leaderboardType) {
      return
    }

    void router.replace(buildRouteLocation(to, nextQuery))
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

      void router.replace(buildRouteLocation(route, buildCanonicalQuery(route, mode, leaderboardType)))
    },
  )
}
