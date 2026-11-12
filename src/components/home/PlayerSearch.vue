<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useStyleStore } from '@/stores/style'
import { usePlayerSearch } from '@/composables/player-search'
import { getRankColor, seperateThousands } from '@/utils'
import type { PlayerWithAvatar } from '@/types'

const styleStore = useStyleStore()
const { mode } = storeToRefs(styleStore)

const { t } = useI18n()

const { query, results, loading } = usePlayerSearch({ limit: 8 })

const open = ref(false)

watch([query, results, loading], () => {
  open.value = query.value.trim() !== ''
})

function rankRows(player: PlayerWithAvatar) {
  const ckz = { label: t('common.mode.ckz'), rank: player.ckz_rank }
  const vnl = { label: t('common.mode.vnl'), rank: player.vnl_rank }

  // list the rank of the current mode first
  return mode.value === 'classic' ? [ckz, vnl] : [vnl, ckz]
}
</script>

<template>
  <UPopover v-model:open="open" :content="{ align: 'end', sideOffset: 4 }" :ui="{ content: 'w-72' }">
    <template #anchor>
      <UInput
        v-model="query"
        class="w-56 shrink-0"
        size="lg"
        :placeholder="$t('home.leaderboards.search')"
        @focus="open = query.trim() !== ''"
      >
        <template #trailing>
          <IconSearch />
        </template>
      </UInput>
    </template>

    <template #content>
      <div class="flex flex-col gap-1 p-1">
        <div v-if="loading" class="flex items-center justify-center py-2">
          <IconLoading />
        </div>

        <p v-else-if="results.length === 0" class="py-2 text-center text-sm text-gray-500">
          {{ $t('common.noData') }}
        </p>

        <template v-else>
          <RouterLink
            v-for="player in results"
            :key="player.id"
            :to="`/profile/${player.id}`"
            class="group flex items-center gap-2 rounded-sm pl-2 pr-3 py-1 text-sm hover:bg-zinc-700"
            @click="open = false"
          >
            <UAvatar size="xs" :src="player.playerAvatar" :alt="player.name" />

            <span class="min-w-0 flex-1 truncate text-cyan-500 transition-colors group-hover:text-cyan-400">{{
              player.name
            }}</span>

            <span class="flex flex-col items-end whitespace-nowrap text-xs leading-tight">
              <span v-for="row in rankRows(player)" :key="row.label" :class="getRankColor(row.rank)">
                {{ `${row.label} #${seperateThousands(row.rank)}` }}
              </span>
            </span>
          </RouterLink>
        </template>
      </div>
    </template>
  </UPopover>
</template>
