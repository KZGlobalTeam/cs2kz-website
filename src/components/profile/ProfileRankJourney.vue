<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ProgressionStats, Promotion } from '@/composables/player-progression'
import { seperateThousands } from '@/utils'
import { format } from 'date-fns'

const props = defineProps<{
  stats: ProgressionStats
}>()

const { t } = useI18n()

const lastIndex = computed(() => props.stats.promotions.length - 1)

const targetProgress = computed(() => {
  const target = props.stats.nextTarget
  if (!target) return 100
  return Math.min(
    100,
    Math.max(0, ((props.stats.officialRating - target.fromMin) / (target.min - target.fromMin)) * 100),
  )
})

// the reconstruction caveat lives in a tooltip on the timeline so it costs no vertical space
const footnoteTooltip = computed(() =>
  t('profile.journey.footnote', {
    final: seperateThousands(props.stats.currentRating),
    official: seperateThousands(props.stats.officialRating),
  }),
)

/** Connector label between node `index - 1` and `index`: days elapsed between the two promotions. */
function gapLabel(index: number) {
  const promotion = props.stats.promotions[index]!
  return promotion.daysSincePrevious > 0
    ? t('profile.journey.daysGap', { days: promotion.daysSincePrevious })
    : t('profile.journey.sameDay')
}

function nodeTitle(promotion: Promotion, index: number) {
  const base = `${promotion.title} · ${format(promotion.at, 'yyyy-MM-dd')} · ${t('profile.journey.ratingValue', { value: seperateThousands(promotion.rating) })}`
  if (index === 0) return `${base} · ${t('profile.journey.firstPb')}`
  return promotion.daysSincePrevious > 0
    ? `${base} · ${t('profile.journey.daysAfter', { days: promotion.daysSincePrevious, title: promotion.fromTitle })}`
    : `${base} · ${t('profile.journey.sameDayAs', { title: promotion.fromTitle })}`
}
</script>

<template>
  <div class="p-4 border border-zinc-700 rounded-md flex flex-col">
    <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
      <p class="text-xl font-semibold text-gray-200">{{ t('profile.journey.title') }}</p>
      <div class="flex flex-wrap items-center justify-end gap-2">
        <span
          class="px-1 font-semibold text-base rounded-md border"
          :style="{
            color: stats.currentColor,
            borderColor: stats.currentColor,
            backgroundColor: `${stats.currentColor}20`,
          }"
        >
          {{ stats.currentTitle }}
        </span>
        <span class="text-2xl font-semibold text-gray-100">
          {{ seperateThousands(stats.officialRating) }}
        </span>
        <template v-if="stats.nextTarget">
          <span class="text-gray-600">→</span>
          <span
            class="px-1 font-semibold text-base rounded-md border border-dashed opacity-80"
            :style="{
              color: stats.nextTarget.color,
              borderColor: stats.nextTarget.color,
              backgroundColor: `${stats.nextTarget.color}20`,
            }"
          >
            {{ stats.nextTarget.title }}
          </span>
          <span class="flex items-center gap-2">
            <span
              class="w-20 h-1.5 rounded-full bg-zinc-800 overflow-hidden"
              :title="`${t('profile.journey.next')} ${stats.nextTarget.title}`"
            >
              <span
                class="block h-full rounded-full"
                :style="{ width: `${targetProgress}%`, backgroundColor: stats.nextTarget.color }"
              ></span>
            </span>
            <span class="text-base text-gray-500 whitespace-nowrap">
              {{ t('profile.journey.toGo', { value: seperateThousands(stats.nextTarget.min - stats.officialRating) }) }}
            </span>
          </span>
        </template>
      </div>
    </div>

    <div
      v-if="!stats.promotions.length"
      class="flex-1 flex items-center justify-center text-gray-500 min-h-32 text-center px-4"
    >
      {{ t('profile.journey.empty') }}
    </div>

    <!-- horizontal promotion timeline -->
    <div v-else class="flex-1 flex items-center overflow-x-auto list-wrapper py-4" :title="footnoteTooltip">
      <div class="flex w-max min-w-full">
        <div
          v-for="(promotion, index) in stats.promotions"
          :key="promotion.title"
          class="relative flex-1 min-w-[80px] px-1 flex flex-col items-center"
          :title="nodeTitle(promotion, index)"
        >
          <!-- dot + connector halves -->
          <div class="relative w-full h-4 flex items-center justify-center">
            <!-- halves reach into the column padding so adjacent segments meet: one unbroken line -->
            <span v-if="index > 0" class="absolute -left-1 right-1/2 top-1/2 h-px bg-zinc-700"></span>
            <span v-if="index < lastIndex" class="absolute left-1/2 -right-1 top-1/2 h-px bg-zinc-700"></span>
            <!-- gap label centered on the boundary = midpoint between the two dots -->
            <span
              v-if="index < lastIndex"
              class="absolute -right-1 -top-3 translate-x-1/2 text-xs leading-3 text-gray-500 whitespace-nowrap"
            >
              {{ gapLabel(index + 1) }}
            </span>
            <span class="relative w-3 h-3 rounded-full" :style="{ backgroundColor: promotion.color }"></span>
          </div>
          <p class="mt-2 text-base font-semibold leading-5 whitespace-nowrap" :style="{ color: promotion.color }">
            {{ promotion.title }}
          </p>
          <p class="mt-0.5 text-sm text-gray-400 leading-5 whitespace-nowrap">
            {{ format(promotion.at, 'yyyy-MM-dd') }}
          </p>
          <p class="text-xs text-gray-500 leading-4 whitespace-nowrap">
            {{ seperateThousands(promotion.rating) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
