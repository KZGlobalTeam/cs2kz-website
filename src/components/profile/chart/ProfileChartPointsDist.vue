<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  pointsDist: number[]
}>()

const labels = ['0-1000', '1000+', '2000+', '3000+', '4000+', '5000+', '6000+', '7000+', '8000+', '9000+', 'WRs']

const barPercentages = computed(() => {
  const maxValue = Math.max(...props.pointsDist, 1) // Avoid division by zero
  return props.pointsDist.map((value) => (value / maxValue) * 100)
})
</script>

<template>
  <div class="w-full">
    <div class="flex flex-col space-y-3">
      <div v-for="(value, index) in pointsDist" :key="index" class="flex items-center w-full">
        <div class="w-[70px] text-right pr-2 text-sm text-gray-500 flex-shrink-0">{{ labels[index] }}</div>
        <div class="flex-grow bg-[rgba(69,69,69,0.3)] h-5 rounded-sm overflow-hidden">
          <div
            :style="{ width: `${barPercentages[index]}%` }"
            :class="[
              'h-full flex items-center transition-all duration-500 ease-in-out',
              index === labels.length - 1 ? 'bg-[#f5da42]' : 'bg-[#bfbfbf]',
            ]"
          ></div>
        </div>
        <span class="font-bold text-sm ml-2 w-10" :class="value > 0 ? 'text-gray-400' : 'text-gray-600'">{{
          value || ' '
        }}</span>
      </div>
    </div>
  </div>
</template>
