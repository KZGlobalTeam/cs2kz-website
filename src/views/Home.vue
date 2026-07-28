<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useHead } from '@unhead/vue'
import Guide from '@/components/home/Guide.vue'
import Servers from '@/components/home/Servers.vue'
import Sidebar from '@/components/home/Sidebar.vue'

const GUIDE_HIDDEN_KEY = 'cs2kz:guide-hidden'

const guideHidden = ref(false)

onMounted(() => {
  guideHidden.value = window.localStorage.getItem(GUIDE_HIDDEN_KEY) === 'true'
})

function hideGuide() {
  guideHidden.value = true
  window.localStorage.setItem(GUIDE_HIDDEN_KEY, 'true')
}

function showGuide() {
  guideHidden.value = false
  window.localStorage.removeItem(GUIDE_HIDDEN_KEY)
}

useHead({
  title: 'Home - CS2KZ',
  meta: [
    {
      name: 'description',
      content: 'Find active CS2KZ servers, learn the basics, and get started with your first CS2KZ session.',
    },
    {
      property: 'og:title',
      content: 'Home - CS2KZ',
    },
    {
      property: 'og:description',
      content: 'Find active CS2KZ servers, learn the basics, and get started with your first CS2KZ session.',
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:site_name',
      content: 'CS2KZ',
    },
  ],
})
</script>

<template>
  <div
    class="flex flex-col xl:grid mx-auto p-2 lg:p-4 gap-4"
    :class="
      guideHidden
        ? 'xl:grid-cols-[3rem_minmax(0,2fr)_minmax(320px,1fr)]'
        : 'xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(320px,1fr)]'
    "
  >
    <Guide :hidden="guideHidden" @hide="hideGuide" @show="showGuide" />
    <Servers :guide-hidden="guideHidden" />
    <Sidebar />
  </div>
</template>
