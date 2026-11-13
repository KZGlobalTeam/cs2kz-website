<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import fallbackSrc from '@/assets/img/fallback.jpg'

const props = defineProps<{
  src: string
  alt: string
}>()

const { locale } = useI18n()

const proxiedSrc = computed(() => {
  if (locale.value !== 'zh') return props.src

  if (props.src.includes('cs2kz-images')) {
    return props.src.replace(
      'https://github.com/kzglobalteam/cs2kz-images/raw/public',
      'https://cs2kz-images-1531759459.cos.ap-guangzhou.myqcloud.com',
    )
  }

  if (props.src.includes('cs2kz-workshop-images')) {
    return props.src.replace(
      'https://github.com/jonahbearde/cs2kz-workshop-images/raw/main/images',
      'https://cs2kz-workshop-images-1531759459.cos.ap-guangzhou.myqcloud.com',
    )
  }

  return props.src
})

const failed = ref(false)

const imgSrc = computed(() => (failed.value ? fallbackSrc : proxiedSrc.value))

watch(proxiedSrc, () => {
  failed.value = false
})

function onError() {
  failed.value = true
}
</script>

<template>
  <img :src="imgSrc" :alt="alt" loading="lazy" class="animate-fade-in" @error="onError" />
</template>
