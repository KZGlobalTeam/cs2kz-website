<script setup lang="ts">
import type { LeaderboardQuery } from '@/types'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  total: number
}>()

const query = defineModel<LeaderboardQuery>('query', { required: true })

const currentPage = computed(() => Math.floor(query.value.offset / query.value.limit) + 1)
const totalPages = computed(() => Math.max(1, Math.ceil(props.total / query.value.limit)))

const pageInput = ref(currentPage.value.toString())

watch([currentPage, totalPages], ([page, pages]) => {
  pageInput.value = Math.min(page, pages).toString()
})

function goToPage(page: number) {
  const targetPage = Math.min(Math.max(1, page), totalPages.value)
  query.value.offset = (targetPage - 1) * query.value.limit
}

function goPrevPage() {
  if (currentPage.value <= 1) {
    return
  }

  goToPage(currentPage.value - 1)
}

function goNextPage() {
  if (currentPage.value >= totalPages.value) {
    return
  }

  goToPage(currentPage.value + 1)
}

function jumpToPage() {
  const rawPage = Number.parseInt(pageInput.value, 10)

  if (Number.isNaN(rawPage)) {
    pageInput.value = currentPage.value.toString()
    return
  }

  goToPage(rawPage)
}
</script>

<template>
  <div class="flex items-center gap-2">
    <UButton color="neutral" variant="soft" square :disabled="currentPage <= 1" @click="goPrevPage">
      <IconLeft />
    </UButton>

    <form class="flex items-center gap-2" @submit.prevent="jumpToPage">
      <UInput
        v-model="pageInput"
        type="number"
        min="1"
        :max="totalPages"
        inputmode="numeric"
        class="w-20"
        :ui="{ base: 'text-center' }"
      />
    </form>

    <span class="text-sm text-gray-400 whitespace-nowrap">/ {{ totalPages }}</span>

    <UButton color="neutral" variant="soft" square :disabled="currentPage >= totalPages" @click="goNextPage">
      <IconRight />
    </UButton>
  </div>
</template>
