<script setup lang="ts">
import { computed, h, resolveComponent } from 'vue'
import type { ServerQuery, Server } from '@/types'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import type { TableColumn } from '@nuxt/ui'
import { toLocal, toLocalDistance } from '@/utils'

defineProps<{
  servers: Server[]
  query: ServerQuery
  loading: boolean
}>()

const IconConnect = resolveComponent('IconConnect')
const UButton = resolveComponent('UButton')
const UTooltip = resolveComponent('UTooltip')

const { t, locale } = useI18n()

const columns = computed(() => {
  const cols: TableColumn<Server>[] = [
    {
      accessorKey: 'name',
      header: t('servers.title.name'),
      cell: ({ row }) => {
        return h(
          'span',
          {
            class: 'italic',
          },
          row.original.name,
        )
      },
    },
    {
      accessorKey: 'host',
      header: t('servers.title.ipAddress'),
      cell: ({ row }) => {
        return h('div', { class: 'inline-flex items-center gap-2' }, [
          h('span', {}, `${row.original.host}:${row.original.port}`),
          h(
            UButton,
            {
              variant: 'ghost',
              square: true,
              to: `steam://rungameid/730//+connect ${row.original.host}:${row.original.port}`,
              target: '_blank',
            },
            () => h(IconConnect),
          ),
        ])
      },
    },
    {
      accessorKey: 'owner',
      header: t('servers.title.owner'),
      cell: ({ row }) => {
        return h(
          RouterLink,
          { class: 'text-cyan-600 whitespace-nowrap hover:text-cyan-400', to: `/profile/${row.original.owner.id}` },
          () => row.original.owner.name,
        )
      },
    },
    {
      accessorKey: 'connection_info',
      header: t('servers.title.currentMap'),
      cell: ({ row }) => {
        return h('span', {}, row.original.connection_info?.current_map || '-')
      },
    },
    {
      accessorKey: 'connection_info',
      header: t('servers.title.currentPlayersCount'),
      cell: ({ row }) => {
        return h('span', {}, row.original.connection_info?.connected_players.length || '-')
      },
    },
    {
      accessorKey: 'created_at',
      header: t('servers.title.createdOn'),
      cell: ({ row }) => {
        return h(
          UTooltip,
          { delayDuration: 100, content: { side: 'top', sideOffset: 2 }, text: toLocal(row.original.created_at) },
          () => h('span', { class: 'whitespace-nowrap' }, toLocalDistance(row.original.created_at, locale.value)),
        )
      },
    },
  ]

  return cols
})
</script>

<template>
  <UCard>
    <UTable class="mt-4 lg:mt-6" :data="servers" :columns :loading> </UTable>
  </UCard>
</template>
