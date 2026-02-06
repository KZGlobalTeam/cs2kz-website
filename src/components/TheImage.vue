<script setup lang="ts">
import { ref, watch } from 'vue'
import { useImage } from '@vueuse/core'

const props = defineProps<{
  src: string
}>()

let _loading = ref()
let _error = ref()

function loadImage() {
  const { isLoading, error } = useImage({ src: props.src })
  /* eslint-disable */
  _loading = isLoading
  _error = error
  /* eslint-enable */
}

watch(() => props.src, loadImage, { immediate: true })
</script>

<template>
  <img v-if="!_loading && !_error" :src="props.src" loading="lazy" class="animate-fade-in" />

  <img v-else src="@/assets/img/fallback.jpg" class="animate-fade-in" />
</template>
