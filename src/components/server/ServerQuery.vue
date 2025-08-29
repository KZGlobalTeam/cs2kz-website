<script setup lang="ts">
import type { ServerQuery } from '@/types'
import { ref, watch } from 'vue'

const query = defineModel<ServerQuery>('query', { required: true })

const ip = ref('')

watch(ip, (ip) => {
  // const regx = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/
  // if (regx.test(ip) || ip === "") {
  //   query.value.host = ip
  // }
  query.value.host = ip
})
</script>

<template>
  <div
    class="lg:w-max mx-auto p-2 lg:p-4 flex flex-wrap items-center lg:justify-center gap-2 lg:gap-8 border border-gray-800 rounded-md"
  >
    <UCheckbox v-model="query.include_degloballed" :label="$t('servers.query.includeDegloballed')" />
    <UInput v-model="query.name" :placeholder="$t('servers.query.name')">
      <template #trailing>
        <IconServer />
      </template>
    </UInput>
    <UInput v-model="ip" :placeholder="$t('servers.query.ipAddress')">
      <template #trailing>
        <IconInternet />
      </template>
    </UInput>
    <UInput v-model="query.owned_by" :placeholder="$t('servers.query.ownedBy')">
      <template #trailing>
        <IconPlayer />
      </template>
    </UInput>
  </div>
</template>
