<script setup lang="ts">
import type { Mode } from '@/types'

const mode = defineModel<Mode>('mode', { required: true })
</script>

<template>
  <UTabs
    :items="[
      { label: $t('common.mode.ckz'), value: 'classic' },
      { label: $t('common.mode.vnl'), value: 'vanilla-cs2' },
    ]"
    v-model="mode"
    default-value="classic"
  />
</template>
