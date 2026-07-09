<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import IconClose from './icon/IconClose.vue'

const { t } = useI18n()

const BETA_NOTICE_STORAGE_KEY = 'cs2kz:beta-notice-hidden'

const isVisible = shallowRef(false)
const dontShowAgain = shallowRef(false)

onMounted(() => {
  isVisible.value = window.localStorage.getItem(BETA_NOTICE_STORAGE_KEY) !== 'true'
})

function closeNotice() {
  if (dontShowAgain.value) {
    window.localStorage.setItem(BETA_NOTICE_STORAGE_KEY, 'true')
  }

  isVisible.value = false
}
</script>

<template>
  <Transition name="slide-up">
    <div v-if="isVisible" class="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-700 bg-zinc-800 px-4 py-3">
      <div class="relative mx-auto flex gap-2 max-w-7xl items-center justify-center px-5">
        <span class="text-center text-sm leading-relaxed text-yellow-400">{{ t('common.testingAlert') }}</span>
        <UCheckbox v-model="dontShowAgain" :label="t('common.dontShowAgain')" />
        <UButton variant="ghost" square class="absolute right-0" @click="closeNotice" size="xs"><IconClose /></UButton>
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
