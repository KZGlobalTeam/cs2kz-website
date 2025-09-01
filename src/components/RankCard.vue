<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Record } from '@/types'
import { api, formatTime, toLocal, toLocalDistance } from '@/utils'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  pro: boolean
  record: Record
}>()

const { locale } = useI18n()

const wr = computed(() => {
  if (props.pro) {
    return props.record.pro_rank === 1
  } else {
    return props.record.nub_rank === 1
  }
})

const avatarUrl = ref('')

watch(
  () => props.record.player.id,
  (id) => {
    getAvatar(id)
  },
  { immediate: true },
)

async function getAvatar(steamId: string) {
  try {
    const { data } = await api.get(`/players/${steamId}/steam-profile`)
    avatarUrl.value = data?.avatar_url.replace(/_medium/, '_full') || ''
  } catch (error) {
    console.log('[fetch error]', error)
  }
}
</script>

<template>
  <div :class="wr ? 'wr-card' : 'normal-card'">
    <RouterLink :to="`/profile/${record.player.id}`">
      <TheImage :src="avatarUrl" class="w-20 h-20 object-cover rounded-md ring-2 ring-white/30" />
    </RouterLink>

    <div>
      <div class="flex w-36">
        <RouterLink
          :to="`/profile/${record.player.id}`"
          :class="wr ? 'text-yellow-300 hover:text-yellow-400' : 'text-cyan-600 hover:text-cyan-400'"
          class="text-xl font-bold whitespace-nowrap"
          >{{ record.player.name }}</RouterLink
        >
      </div>
      <p class="relative text-slate-300 text-xl font-bold">
        {{ `#${pro ? record.pro_rank : record.nub_rank}` }}
      </p>
    </div>

    <div class="hidden lg:flex items-center gap-4 ml-6">
      <div>
        <p class="text-gray-300">{{ $t('records.title.time') }}</p>
        <p class="text-gray-100 w-20">{{ formatTime(record.time) }}</p>
      </div>

      <div>
        <p class="text-gray-300">{{ $t('records.title.date') }}</p>
        <p class="text-gray-200 italic whitespace-nowrap w-32">
          <UTooltip :text="toLocal(record.created_at)">
            {{ toLocalDistance(record.created_at, locale) }}
          </UTooltip>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wr-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  border-radius: 0.375rem;
  background-color: rgba(174, 150, 9, 0.8);
  border: 0.125rem solid rgba(255, 255, 255, 0.4);
  padding: 0.5rem;
  position: relative;
}
.wr-card::before {
  content: '';
  position: absolute;
  z-index: -1;
  inset: -0.125rem;
  background: linear-gradient(90deg, #c3f, #fe3, #f80, #c3f);
  background-size: 400%;
  border-radius: 0.5rem;
  filter: blur(0.5rem);
  animation: glowing 8s linear infinite alternate;
}
.normal-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  border-radius: 0.375rem;
  background-color: rgba(31, 41, 55, 0.8);
  border: 0.125rem solid rgba(255, 255, 255, 0.1);
  padding: 0.5rem;
}
@keyframes glowing {
  from {
    background-position: 0%;
  }
  to {
    background-position: 100%;
  }
}
</style>
