<script setup lang="ts">
import { computed, h, resolveComponent } from 'vue'
import type { ServerQuery, Server } from '@/types'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter } from 'vue-router'
import type { TableColumn } from '@nuxt/ui'
import { toLocal, toLocalDistance } from '@/utils'

defineProps<{
  servers: Server[]
  query: ServerQuery
  loading: boolean
}>()

const IconConnect = resolveComponent('IconConnect')
const IconCheck = resolveComponent('IconCheck')
const IconX = resolveComponent('IconX')
const UButton = resolveComponent('UButton')
const UTooltip = resolveComponent('UTooltip')

const { t, locale } = useI18n()

const router = useRouter()

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
        return h('div', { class: 'inline-flex items-center gap-1' }, [
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
      accessorKey: 'is_global',
      header: t('servers.title.globalStatus'),
      cell: ({ row }) => {
        return h(row.original.is_global ? IconCheck : IconX)
      },
    },
    {
      accessorKey: 'owner',
      header: t('servers.title.owner'),
      cell: ({ row }) => {
        return h(
          RouterLink,
          {
            class: 'text-cyan-600 whitespace-nowrap hover:text-cyan-400',
            to: `/profile/${row.original.owner.id}`,
          },
          () => row.original.owner.name,
        )
      },
    },
    {
      accessorKey: 'connection_info',
      header: t('servers.title.currentMap'),
      cell: ({ row }) => {
        return h(
          'span',
          {
            class: row.original.connection_info?.current_map
              ? 'text-slate-300 font-semibold text-lg hover:text-slate-200 cursor-pointer'
              : 'text-slate-500',
            onClick: () => {
              if (row.original.connection_info?.current_map) {
                router.push({ path: `/maps/${row.original.connection_info.current_map}`, query: { course: 1 } })
              }
            },
          },
          row.original.connection_info?.current_map || t('common.unknown'),
        )
      },
    },
    {
      accessorKey: 'connection_info',
      header: t('servers.title.players'),
      cell: ({ row }) => {
        return h('div', { class: 'flex flex-wrap gap-1' }, getPlayerInfo(row.original.connection_info))
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

function getPlayerInfo(connectionInfo: Server['connection_info'] | null) {
  if (connectionInfo === undefined || connectionInfo === null)
    return h('span', { class: 'text-slate-500' }, t('common.unknown'))

  if (connectionInfo.connected_players.length === 0)
    return h('span', { class: 'text-slate-500' }, t('servers.noPlayers'))

  return connectionInfo.connected_players.map((player) =>
    h(
      RouterLink,
      {
        class: 'px-1 text-cyan-600 whitespace-nowrap hover:text-cyan-400 bg-gray-600/40 rounded-md',
        to: `/profile/${player.id}`,
      },
      () => player.name,
    ),
  )
}
</script>

<template>
  <UTable class="mt-4 lg:mt-6 border border-gray-700 rounded-md" :data="servers" :columns :loading> </UTable>
</template>
