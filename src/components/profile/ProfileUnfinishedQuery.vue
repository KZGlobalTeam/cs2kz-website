<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { UnfinishedCourseQuery } from '@/types'
import { completionTiers } from '@/utils'

const emits = defineEmits<{
  (e: 'resetQuery'): void
}>()

const query = defineModel<UnfinishedCourseQuery>('query', { required: true })
const { t } = useI18n()

const tierItems = computed(() => [
  { label: t('common.tier.all'), value: undefined },
  ...completionTiers.map((tier) => ({
    label: t(`common.tier.${tier}`),
    value: tier,
  })),
])
</script>

<template>
  <div class="flex items-center flex-wrap lg:justify-end gap-2 lg:gap-4">
    <USelect
      v-model="query.tier"
      :ui="{ content: 'z-10' }"
      :items="tierItems"
      :placeholder="$t('profile.unfinished.query.tier')"
    />

    <UButton color="neutral" variant="outline" @click="emits('resetQuery')">
      {{ $t('common.reset') }}
    </UButton>
  </div>
</template>
