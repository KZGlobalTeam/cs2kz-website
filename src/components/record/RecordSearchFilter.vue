<template>
  <UPopover v-model:open="openPopover" :content="{ align: 'start' }">
    <template #anchor>
      <UInput v-model="search" :placeholder="$t(placeholderPath)">
        <template #trailing>
          <slot name="trailing-icon" />
        </template>
      </UInput>
    </template>

    <template #content>
      <slot name="results" :results="results" />
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { debounce } from 'radash'

const props = defineProps<{
  placeholderPath: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchResults: (search: string) => Promise<any[]>
}>()

const emits = defineEmits(['cleared'])

const openPopover = ref(false)

const search = ref('')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const results = ref<any[]>([])

const debouncedFetchResults = debounce({ delay: 300 }, async (newSearch: string) => {
  try {
    results.value = await props.fetchResults(newSearch)
  } catch (error) {
    console.error(error)
    results.value = []
  } finally {
    openPopover.value = results.value.length > 0
  }
})

watch(search, (newSearch) => {
  if (newSearch.trim() === '') {
    results.value = []
    openPopover.value = false
    emits('cleared')
    return
  }
  debouncedFetchResults(newSearch)
})
</script>
