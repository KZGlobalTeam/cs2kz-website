<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'

const markdown = `
# How to CS2KZ

## Getting started

- Join a server from our server browser by copying the ip, preferably from your region.
  - If you're new to kz, aim for tier 1 and 2 maps. You can find tier labels next to the map names.
  - Other servers that don't appear in our server browser might run similar KZ plugins, those records will not be saved on our leaderboards.

## Menu/Binds/Commands

- Most CS2KZ servers have converted the radio menu to a KZ Menu.
  - Open it by typing \`radio\`, \`radio1\`, \`radio2\` or \`radio3\` in the console.
  - Or by using the default binds: \`Z\`, \`X\` and \`C\`.
- Another way is to manually bind them or create a cfg.
  - Example binds: \`bind 1 kz_cp; bind 2 kz_tp; bind 3 kz_prevcp; bind 4 kz_nextcp; bind 5 kz_undo; bind 6 kz_pause\`, you can copy and paste them into console directly.
  - add \`-disable_workshop_command_filtering\` to your lanuch options if you want to exec the cfg in game.
- Maps can be changed by typing \`!rtv\` or \`!nominate\`.
- Type \`!help\` in game chat for all available kz commands.

**If you want to know how the whole CS2KZ system works, check out the [documention page](https://docs.cs2kz.org). If you have more questions or want to meet more people playing kz, join our [discord](https://www.discord.gg/csgokz). Happy kreedzing!**
`

const md = new MarkdownIt({
  html: false,
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
  margin-top: 1.5rem;
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
  color: #bfdbfe;
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
