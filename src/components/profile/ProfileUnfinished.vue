<script setup lang="ts">
import type { UnfinishedCourseQuery, UnfinishedMapRow } from '@/types'

defineProps<{
  unfinishedCourses: UnfinishedMapRow[]
  loading: boolean
}>()

const emits = defineEmits<{
  (e: 'resetQuery'): void
}>()

const query = defineModel<UnfinishedCourseQuery>('query', { required: true })
</script>

<template>
  <div>
    <!-- title -->
    <p class="text-3xl font-semibold mb-2">
      {{ $t('profile.unfinished.title') }}
    </p>

    <div class="flex flex-wrap gap-3 text-gray-300 border border-gray-800 rounded-md p-3 mb-2">
      <ProfileUnfinishedQuery v-model:query="query" @reset-query="emits('resetQuery')" />
    </div>

    <ProfileUnfinishedTable :maps="unfinishedCourses" :loading="loading" />
  </div>
</template>
