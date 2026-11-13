<script setup lang="ts">
import { computed } from 'vue'
import { useImage } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import fallbackSrc from '@/assets/img/fallback.jpg'

const props = defineProps<{
  src: string
  alt: string
}>()

const { locale } = useI18n()

const proxiedSrc = computed(() => {
  if (locale.value === 'zh') {
    if (props.src.includes('cs2kz-images')) {
      return props.src.replace(
        'https://github.com/kzglobalteam/cs2kz-images/raw/public',
        'https://cs2kz-images-1531759459.cos.ap-guangzhou.myqcloud.com',
      )
    } else if (props.src.includes('cs2kz-workshop-images')) {
      return props.src.replace(
        'https://github.com/jonahbearde/cs2kz-workshop-images/raw/main/images',
        'https://cs2kz-workshop-images-1531759459.cos.ap-guangzhou.myqcloud.com',
      )
    } else {
      return props.src
    }
  } else {
    return props.src
  }
})

const imgSrc = computed(() => (!isLoading.value && !error.value ? proxiedSrc.value : fallbackSrc))

const { isLoading, error } = useImage({ src: props.src })
</script>

<template>
  <img :src="imgSrc" :alt="alt" loading="lazy" class="animate-fade-in" />
</template>
