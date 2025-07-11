<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  hasData: boolean
  hasMore: boolean
  loading: boolean
}>()

const emits = defineEmits(['infinite'])

const scroller = ref<Element | null>(null)
const endOfScroller = ref<Element | null>(null)

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]

      if (entry?.isIntersecting) {
        // don't emit if there's no data, and only if there's more data
        if (props.hasData && props.hasMore) {
          emits('infinite')
        }
      }
    },
    { rootMargin: '150px' },
  )

  observer.observe(endOfScroller.value as Element)
})
</script>

<template>
  <div ref="scroller" class="scroller">
    <slot></slot>
    <div ref="endOfScroller" class="flex justify-center mt-2">
      <IconLoading v-if="hasData && loading" />
    </div>
  </div>
</template>
