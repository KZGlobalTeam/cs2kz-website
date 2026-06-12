<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useImage } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  src: string
  alt: string
}>()

const { locale } = useI18n()

let _loading = ref()
let _error = ref()

const proxiedSrc = computed(() => {
  if (locale.value === 'zh' && props.src.includes('cs2kz-images')) {
    return 'https://gh-proxy.org/' + props.src
  } else {
    return props.src
  }
})

function loadImage(src: string) {
  const { isLoading, error } = useImage({ src })
  /* eslint-disable */
  _loading = isLoading
  _error = error
  /* eslint-enable */
}

watch(proxiedSrc, loadImage, { immediate: true })
</script>

<template>
  <img v-if="!_loading && !_error" :src="proxiedSrc" :alt="alt" loading="lazy" class="animate-fade-in" />

  <img v-else src="@/assets/img/fallback.jpg" :alt="alt" class="animate-fade-in" />
</template>
