<script setup lang="ts">
import { computed } from 'vue'
import { useImage } from '@vueuse/core'
import fallbackSrc from '@/assets/img/fallback.jpg'

const props = defineProps<{
  src: string
  alt: string
}>()

const imgSrc = computed(() => (!isLoading.value && !error.value ? props.src : fallbackSrc))

const { isLoading, error } = useImage({ src: props.src })
</script>

<template>
  <img :src="imgSrc" :alt="alt" loading="lazy" class="animate-fade-in" />
</template>
