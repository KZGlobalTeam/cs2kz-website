<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CompareEntry } from '@/types'
import IconClose from '../icon/IconClose.vue'

const props = defineProps<{
  slotA: CompareEntry | null
  slotB: CompareEntry | null
}>()

const emit = defineEmits<{
  (e: 'clear'): void
  (e: 'clearSlot', which: 'A' | 'B'): void
  (e: 'compare'): void
}>()

const { t } = useI18n()

const isVisible = computed(() => props.slotA !== null || props.slotB !== null)
const canCompare = computed(() => props.slotA !== null && props.slotB !== null && props.slotA.id !== props.slotB.id)
</script>

<template>
  <Transition name="slide-up">
    <div v-if="isVisible" class="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-700 bg-zinc-800 px-4 py-3">
      <div class="relative mx-auto flex max-w-7xl items-center justify-center gap-4 px-5">
        <div class="flex items-center gap-2">
          <span class="text-sm font-bold text-slate-400">A</span>
          <div class="flex items-center gap-1 rounded-sm bg-zinc-700/60 px-2 py-1 min-w-40 max-w-56">
            <span v-if="props.slotA" class="truncate text-sm text-slate-100">{{ props.slotA.name }}</span>
            <span v-else class="text-sm italic text-slate-500">{{ t('records.actions.slotEmpty') }}</span>
            <button
              v-if="props.slotA"
              class="ml-auto text-slate-400 hover:text-slate-100"
              @click="emit('clearSlot', 'A')"
            >
              <IconClose />
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-sm font-bold text-slate-400">B</span>
          <div class="flex items-center gap-1 rounded-sm bg-zinc-700/60 px-2 py-1 min-w-40 max-w-56">
            <span v-if="props.slotB" class="truncate text-sm text-slate-100">{{ props.slotB.name }}</span>
            <span v-else class="text-sm italic text-slate-500">{{ t('records.actions.slotEmpty') }}</span>
            <button
              v-if="props.slotB"
              class="ml-auto text-slate-400 hover:text-slate-100"
              @click="emit('clearSlot', 'B')"
            >
              <IconClose />
            </button>
          </div>
        </div>

        <UButton
          size="sm"
          color="primary"
          variant="solid"
          :disabled="!canCompare"
          :class="canCompare ? 'cursor-pointer' : 'cursor-not-allowed'"
          @click="emit('compare')"
        >
          {{ t('records.actions.compare') }}
        </UButton>

        <UButton variant="ghost" square class="absolute right-0" size="xs" @click="emit('clear')">
          <IconClose />
        </UButton>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
