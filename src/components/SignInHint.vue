<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePlayerStore } from '@/stores/player'
import { dismissSignInHint, isSignInHintDismissed } from '@/utils/sign-in-hint'

const emit = defineEmits<{ 'sign-in': [] }>()

const { t } = useI18n()
const playerStore = usePlayerStore()

const isOpen = shallowRef(false)
let showTimer: number | undefined

onMounted(() => {
  if (playerStore.player || isSignInHintDismissed()) return

  showTimer = window.setTimeout(() => {
    isOpen.value = true
  }, 600)
})

onBeforeUnmount(() => {
  window.clearTimeout(showTimer)
})

watch(
  () => playerStore.player,
  (player) => {
    if (player) isOpen.value = false
  },
)

function dismiss() {
  dismissSignInHint()
  isOpen.value = false
}
</script>

<template>
  <UPopover :open="isOpen" :dismissible="false" arrow :content="{ side: 'bottom', align: 'end', sideOffset: 10 }">
    <template #anchor>
      <slot />
    </template>

    <template #content>
      <div class="w-72 max-w-[calc(100vw-2rem)] p-4">
        <div class="flex items-start justify-between gap-2">
          <p class="text-sm font-semibold text-highlighted">{{ t('signInHint.title') }}</p>
          <UButton
            variant="ghost"
            square
            size="xs"
            class="-mt-1 -mr-1 shrink-0"
            :aria-label="t('signInHint.dismiss')"
            @click="dismiss"
          >
            <IconClose />
          </UButton>
        </div>
        <p class="mt-1 text-sm leading-relaxed text-muted">{{ t('signInHint.body') }}</p>
      </div>
    </template>
  </UPopover>
</template>
