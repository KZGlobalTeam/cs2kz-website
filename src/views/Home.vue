<script setup lang="ts">
import { useHead } from '@unhead/vue'
import Guide from '@/components/home/Guide.vue'
import Servers from '@/components/home/Servers.vue'

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
  <div class="hidden xl:grid mx-auto p-2 lg:p-4 grid-cols-[minmax(0,2fr)_minmax(0,5fr)] gap-4">
    <Guide />
    <Servers />
  </div>
  <div class="flex xl:hidden flex-col gap-4 p-2 lg:p-4"><Guide /> <Servers /></div>
</template>
