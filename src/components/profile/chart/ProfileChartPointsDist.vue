<script setup lang="ts">
import { computed } from 'vue'
import { pointsDistLabels } from '@/utils'

const props = defineProps<{
  pointsDistribution: number[]
  selectedPoints?: number
}>()

const emits = defineEmits<{
  (e: 'selectPoints', points: number): void
}>()

const barPercentages = computed(() => {
  const maxValue = Math.max(...props.pointsDistribution, 1) // Avoid division by zero
  return props.pointsDistribution.map((value) => (value / maxValue) * 100)
})
</script>

<template>
  <div class="w-full">
    <div class="flex flex-col space-y-3">
      <button
        v-for="(value, index) in pointsDistribution"
        :key="index"
        type="button"
        class="flex items-center w-full text-left cursor-pointer"
        @click="emits('selectPoints', index)"
      >
        <div class="w-[70px] text-right pr-2 text-sm text-gray-500 flex-shrink-0">{{ pointsDistLabels[index] }}</div>
        <div
          class="flex-grow h-5 rounded-sm overflow-hidden transition-colors"
          :class="selectedPoints === index ? 'bg-blue-600/20 ring-1 ring-blue-500/60' : 'bg-[rgba(69,69,69,0.3)]'"
        >
          <div
            :style="{ width: `${barPercentages[index]}%` }"
            :class="[
              'h-full flex items-center transition-all duration-500 ease-in-out',
              selectedPoints === index
                ? 'bg-blue-500/80'
                : index === pointsDistLabels.length - 1
                  ? 'bg-[#f5da42]'
                  : 'bg-[#bfbfbf]',
            ]"
          ></div>
        </div>
        <span class="font-bold text-sm ml-2 w-10" :class="value > 0 ? 'text-gray-400' : 'text-gray-600'">{{
          value || ' '
        }}</span>
      </button>
    </div>
  </div>
</template>
