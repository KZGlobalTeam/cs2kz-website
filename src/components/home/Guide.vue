<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import markdown from './Guide.md?raw'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
})

const renderedGuide = computed(() => md.render(markdown))
</script>

<template>
  <section
    class="list-wrapper flex flex-col rounded-md border border-gray-700 bg-gray-900/60 p-4 max-h-[calc(100dvh-5rem)] overflow-auto"
  >
    <div class="guide-content min-h-0 flex-1 pr-1 text-gray-200" v-html="renderedGuide" />
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
