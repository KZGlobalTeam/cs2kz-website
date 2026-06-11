import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/servers',
      redirect: '/',
    },
    {
      path: '/',
      name: 'Home',
      meta: { usesStyleQuery: false },
      component: () => import('@/views/Home.vue'),
    },
    {
      path: '/leaderboards',
      name: 'Leaderboards',
      meta: { usesStyleQuery: true },
      component: () => import('@/views/Leaderboards.vue'),
    },
    {
      path: '/records',
      name: 'Records',
      meta: { usesStyleQuery: true },
      component: () => import('@/views/Records.vue'),
    },
    {
      path: '/maps',
      name: 'Maps',
      meta: { usesStyleQuery: true },
      component: () => import('@/views/Maps.vue'),
    },
    {
      path: '/maps/:name',
      name: 'Map',
      meta: { usesStyleQuery: true },
      component: () => import('@/views/Map.vue'),
    },
    {
      path: '/profile/:steamId',
      name: 'Profile',
      meta: { usesStyleQuery: true },
      component: () => import('@/views/Profile.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      meta: { usesStyleQuery: false },
      component: () => import('@/views/NotFound.vue'),
    },
  ],
})

export default router
