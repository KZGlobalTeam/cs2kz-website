<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import IconClose from './icon/IconClose.vue'

const { t } = useI18n()

const isVisible = ref(true)

function closeNotice() {
  isVisible.value = false
}
</script>

<template>
  <Transition name="slide-up">
    <div v-if="isVisible" class="fixed bottom-0 left-0 right-0 z-50 bg-gray-800 border-t border-gray-700 px-4 py-3">
      <div class="max-w-7xl mx-auto flex items-center justify-center px-5 relative">
        <span class="text-sm text-yellow-400 leading-relaxed text-center">{{ t('common.testingAlert') }}</span>
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
