<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { Map } from '@/types'
import { api } from '@/utils'

const route = useRoute()

const maps = ref<Map[]>([])
const loading = ref(false)

const mapperId = computed(() => route.params.steamId as string)

const mapperMaps = computed(() =>
  maps.value.filter((map) => map.mappers.some((mapper) => mapper.id === mapperId.value)),
)

const shouldShow = computed(() => !loading.value && mapperMaps.value.length > 0)

onMounted(() => {
  getMaps()
})

async function getMaps() {
  try {
    loading.value = true

    const { data } = await api.get('/maps', {
      params: {
        state: 'approved',
        limit: 10000,
        offset: 0,
        sort_order: 'descending',
        sort_by: 'submission-date',
      },
    })

    if (data) {
      maps.value = data.values
    } else {
      maps.value = []
    }
  } catch (error) {
    console.log('[fetch error]', error)
    maps.value = []
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-if="shouldShow" class="text-gray-300">
    <p class="text-3xl font-semibold mb-2">
      {{ $t('profile.maps.title') }}
    </p>

    <div class="p-4 border border-gray-700 rounded-md">
      <div class="grid grid-cols-[repeat(auto-fill,13rem)] justify-between gap-4">
        <RouterLink
          v-for="map in mapperMaps"
          :key="map.id"
          :to="`/maps/${map.name}`"
          class="group rounded-md overflow-hidden ring ring-blue-600/40 hover:ring-blue-600 hover:ring-2 transition"
        >
          <TheImage
            class="w-full h-28 object-cover"
            :src="`https://github.com/kzglobalteam/cs2kz-images/raw/public/webp/medium/${map.name}/1.webp`"
          />
          <div class="px-2 py-1 bg-gray-800">
            <p class="text-sm text-gray-100 font-semibold truncate">{{ map.name }}</p>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
