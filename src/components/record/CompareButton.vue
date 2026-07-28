<script setup lang="ts">
import { ref, resolveComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Record } from '@/types'

export interface ComparePick {
  type: 'A' | 'B' | 'me'
  record: Record
}

const props = defineProps<{
  record: Record
  unavailable?: boolean
  myRecord?: Record | null
}>()

const emit = defineEmits<{
  (e: 'select', pick: ComparePick): void
}>()

const IconCompare = resolveComponent('IconCompare')
const IconCompareGrey = resolveComponent('IconCompareGrey')

const { t } = useI18n()

const open = ref(false)

function pick(type: 'A' | 'B' | 'me', e: Event) {
  e.stopPropagation()
  emit('select', { type, record: props.record })
  open.value = false
}
</script>

<template>
  <UTooltip
    :text="props.unavailable ? t('records.actions.replayUnavailable') : t('records.actions.compareRuns')"
    :content="{ side: 'top' }"
    :ui="{ content: 'z-[2]' }"
  >
    <UPopover v-model:open="open" mode="click">
      <UButton
        size="xs"
        variant="ghost"
        square
        color="neutral"
        :disabled="props.unavailable"
        :class="props.unavailable ? 'cursor-not-allowed' : 'cursor-pointer'"
        @click="(e: Event) => e.stopPropagation()"
      >
        <component :is="props.unavailable ? IconCompareGrey : IconCompare" />
      </UButton>
      <template #content>
        <div class="flex flex-col gap-1 p-1">
          <div
            v-if="props.myRecord && props.myRecord.replay_available"
            class="hover:bg-zinc-700 flex items-center pl-2 pr-3 py-1 rounded-sm cursor-pointer"
            @click="(e) => pick('me', e)"
          >
            <span class="text-sm">{{ t('records.actions.compareWithMe') }}</span>
          </div>
          <div
            class="hover:bg-zinc-700 flex items-center pl-2 pr-3 py-1 rounded-sm cursor-pointer"
            @click="(e) => pick('A', e)"
          >
            <span class="text-sm">{{ t('records.actions.compareAsA') }}</span>
          </div>
          <div
            class="hover:bg-zinc-700 flex items-center pl-2 pr-3 py-1 rounded-sm cursor-pointer"
            @click="(e) => pick('B', e)"
          >
            <span class="text-sm">{{ t('records.actions.compareAsB') }}</span>
          </div>
        </div>
      </template>
    </UPopover>
  </UTooltip>
</template>
