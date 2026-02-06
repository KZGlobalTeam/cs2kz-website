<script lang="ts" setup>
const open = defineModel<boolean>()

defineProps<{
  navigation: {
    localePath: string
    path: string
  }[]
}>()
</script>

<template>
  <UModal
    v-model:open="open"
    :ui="{ overlay: 'z-[2]', content: 'z-[3]' }"
    title="CS2KZ"
    class="lg:hidden"
    aria-describedby="mobile-navigation"
  >
    <UButton square variant="ghost">
      <IconBars />
    </UButton>

    <template #body>
      <div class="container mx-auto px-2 flex flex-1 flex-col">
        <nav class="mt-2">
          <ul class="flex flex-col gap-2">
            <li v-for="item in navigation" :key="item.path">
              <UButton variant="ghost" :to="item.path" active-variant="solid" @click="open = false">
                {{ $t(item.localePath) }}
              </UButton>
            </li>
          </ul>
        </nav>
      </div>
    </template>

    <template #footer>
      <ExternalLinks />
    </template>
  </UModal>
</template>

<style>
.container {
  font-family: 'Akshar', sans-serif;
}
</style>
