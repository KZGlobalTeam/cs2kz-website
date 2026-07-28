<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import { useI18n } from 'vue-i18n'
import IconClose from '@/components/icon/IconClose.vue'
import IconRight from '@/components/icon/IconRight.vue'

defineProps<{ hidden: boolean }>()
const emit = defineEmits<{ hide: []; show: [] }>()

const { locale, t } = useI18n()

const guideLoaders = {
  en: () => import('@/locales/guide/en.md?raw'),
  ru: () => import('@/locales/guide/ru.md?raw'),
  zh: () => import('@/locales/guide/zh.md?raw'),
} as const

const guideMarkdown = ref('')

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
})

async function loadGuide(currentLocale: string) {
  const loader = guideLoaders[currentLocale as keyof typeof guideLoaders] ?? guideLoaders.en
  const module = await loader()

  guideMarkdown.value = module.default
}

watch(locale, loadGuide, { immediate: true })

const renderedGuide = computed(() => md.render(guideMarkdown.value))
</script>

<template>
  <section v-if="hidden" class="h-12 xl:h-[calc(100dvh-5rem)]">
    <button
      type="button"
      class="group flex h-full w-full flex-row items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-900/60 px-2 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white xl:flex-col xl:gap-2 xl:py-2"
      :aria-label="t('home.guide.show')"
      :title="t('home.guide.show')"
      @click="emit('show')"
    >
      <IconRight />
      <span class="text-sm font-medium xl:[writing-mode:vertical-rl]">{{ t('home.guide.title') }}</span>
    </button>
  </section>

  <section v-else class="h-128 xl:h-[calc(100dvh-5rem)] flex flex-col">
    <div class="flex items-center justify-between">
      <span class="text-white text-xl font-semibold border-l-4 border-blue-600 pl-2">{{ t('home.guide.title') }}</span>
      <UButton
        variant="ghost"
        size="xs"
        :aria-label="t('home.guide.hide')"
        :title="t('home.guide.hide')"
        @click="emit('hide')"
      >
        <IconClose />
      </UButton>
    </div>
    <section class="mt-2 list-wrapper rounded-md border border-zinc-700 bg-zinc-900/60 p-4 flex-1 overflow-auto">
      <div class="guide-content min-h-0 flex-1 pr-1 text-gray-200" v-html="renderedGuide" />
    </section>
  </section>
</template>

<style scoped>
.guide-content :deep(h1) {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
}

.guide-content :deep(h2) {
  margin-top: 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #fff;
}

.guide-content :deep(h2:first-of-type) {
  margin-top: 0;
}

.guide-content :deep(p),
.guide-content :deep(li) {
  color: #d1d5dc;
  line-height: 1.65;
}

.guide-content :deep(ul) {
  margin-top: 0.75rem;
  padding-left: 1.25rem;
  list-style: disc;
}

.guide-content :deep(ul ul) {
  margin-top: 0.35rem;
  list-style: circle;
}

.guide-content :deep(li + li) {
  margin-top: 0.35rem;
}

.guide-content :deep(code) {
  border: 1px solid #374151;
  border-radius: 0.375rem;
  background: #111827;
  padding: 0.1rem 0.35rem;
  font-size: 0.875rem;
  color: #6099df;
}

.guide-content :deep(a) {
  color: #60a5fa;
  text-decoration: underline;
  text-underline-offset: 0.15em;
}

.guide-content :deep(em) {
  color: #fff;
  font-style: italic;
}
</style>
