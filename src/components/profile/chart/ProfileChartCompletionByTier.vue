<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  completedCourses: number[]
  totalCourses: number[]
}>()

const { t } = useI18n()

const labels = computed(() => [
  t('common.tier.very-easy'),
  t('common.tier.easy'),
  t('common.tier.medium'),
  t('common.tier.advanced'),
  t('common.tier.hard'),
  t('common.tier.very-hard'),
  t('common.tier.extreme'),
  t('common.tier.death'),
])
const labelColors = ['#4CAF50', '#8BC34A', '#FFEB3B', '#FF9800', '#FF5722', '#F44336', '#9C27B0', '#673AB7']

const completionPercentages = computed(() => {
  return props.completedCourses.map((completed, index) => {
    const total = props.totalCourses[index] || 1 // Avoid division by zero
    return (completed / total) * 100
  })
})
</script>

<template>
  <div class="w-full">
    <div class="flex flex-col space-y-3">
      <div v-for="(total, index) in totalCourses" :key="index" class="flex items-center w-full">
        <!-- Tier label with its color -->
        <div class="w-[90px] text-right pr-2 text-sm flex-shrink-0" :style="{ color: labelColors[index] }">
          {{ labels[index] }}
        </div>

        <!-- Bar container -->
        <div class="flex-grow bg-[rgba(69,69,69,0.3)] h-8 rounded-sm overflow-hidden">
          <!-- Inner bar representing completed -->
          <div
            class="h-full bg-[#bfbfbf] transition-all duration-500 ease-in-out flex items-center"
            :style="{ width: `${completionPercentages[index]}%` }"
          ></div>
        </div>
        <!-- Values display -->
        <span
          class="ml-2 font-bold text-sm w-12"
          :class="completedCourses[index] > 0 ? 'text-gray-400' : 'text-gray-600'"
        >
          {{ completedCourses[index] }} / {{ total }}
        </span>
      </div>
    </div>
  </div>
</template>
