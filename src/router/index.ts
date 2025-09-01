import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/records',
    },
    {
      path: '/records',
      name: 'Records',
      component: () => import('@/views/Records.vue'),
    },
    {
      path: '/maps',
      name: 'Maps',
      component: () => import('@/views/Maps.vue'),
    },
    {
      path: '/maps/:name',
      name: 'Map',
      component: () => import('@/views/Map.vue'),
    },
    {
      path: '/profile/:steamId',
      name: 'Profile',
      component: () => import('@/views/Profile.vue'),
    },
    {
      path: '/servers',
      name: 'Servers',
      component: () => import('@/views/Servers.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue'),
    },
  ],
})

export default router
