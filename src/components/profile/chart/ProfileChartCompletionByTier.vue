<script setup lang="ts">
import { computed } from 'vue'
import type { Tier } from '@/types'
import { useI18n } from 'vue-i18n'
import { completionTiers } from '@/utils'
import { tierColorMap } from '@/utils'

const props = defineProps<{
  completedCourses: number[]
  totalCourses: number[]
  selectedTier?: Tier
}>()

const emits = defineEmits<{
  (e: 'selectTier', tier: Tier): void
}>()

const { t } = useI18n()

const labels = computed(() => completionTiers.map((tier) => t(`common.tier.${tier}`)))

const labelColors = computed(() => Array.from(tierColorMap.values()))
// const labelColors = ['#6bc96f', '#4CAF50',  '#d8e302', '#FFC107', '#e37910', '#e34202', '#bb02db', '#e800e1']

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
      <button
        v-for="(total, index) in totalCourses"
        :key="index"
        type="button"
        class="flex items-center w-full text-left cursor-pointer"
        @click="emits('selectTier', completionTiers[index])"
      >
        <!-- Tier label with its color -->
        <div class="w-[90px] text-right pr-2 text-sm flex-shrink-0" :style="{ color: labelColors[index] }">
          {{ labels[index] }}
        </div>

        <!-- Bar container -->
        <div
          class="flex-grow h-8 rounded-sm overflow-hidden hover:scale-102 hover:bg-blue-600/20 transition-all"
          :class="
            selectedTier === completionTiers[index]
              ? 'bg-blue-600/20 ring-2 ring-blue-500/80'
              : 'bg-[rgba(69,69,69,0.3)]'
          "
        >
          <!-- Inner bar representing completed -->
          <div
            class="h-full transition-all duration-500 ease-in-out flex items-center"
            :class="selectedTier === completionTiers[index] ? 'bg-blue-500/80' : ''"
            :style="{ width: `${completionPercentages[index]}%`, backgroundColor: labelColors[index] }"
          ></div>
        </div>
        <!-- Values display -->
        <span
          class="ml-2 font-bold text-sm w-12"
          :class="completedCourses[index] > 0 ? 'text-gray-400' : 'text-gray-600'"
        >
          {{ completedCourses[index] }} / {{ total }}
        </span>
      </button>
    </div>
  </div>
</template>
