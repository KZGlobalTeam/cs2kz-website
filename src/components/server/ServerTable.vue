<script setup lang="ts">
import { computed, h, ref, resolveComponent } from 'vue'
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
const IconCopy = resolveComponent('IconCopy')
const UButton = resolveComponent('UButton')
const UTooltip = resolveComponent('UTooltip')

const { t, locale } = useI18n()
const notifications = ref<Array<{ id: number; text: string }>>([])
let notificationId = 0

const copyToClipboard = async (text: string, event: MouseEvent) => {
  try {
    await navigator.clipboard.writeText(text)
    const id = notificationId++
    notifications.value.push({ id, text })
    setTimeout(() => {
      notifications.value = notifications.value.filter((n) => n.id !== id)
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

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
        return h(
          'div',
          {
            class: 'inline-flex items-center gap-2 group',
          },
          [
            h(
              'span',
              {
                class: 'cursor-pointer hover:text-cyan-400 transition-colors',
                onClick: (e: MouseEvent) => copyToClipboard(`${row.original.host}:${row.original.port}`, e),
                title: 'Copy to clipboard',
              },
              `${row.original.host}:${row.original.port}`,
            ),
            h(
              UButton,
              {
                variant: 'ghost',
                square: true,
                class: 'cursor-pointer',
                onClick: (e: MouseEvent) => copyToClipboard(`${row.original.host}:${row.original.port}`, e),
                title: 'Copy to clipboard',
              },
              () => h(IconCopy),
            ),
            h(
              UButton,
              {
                variant: 'ghost',
                square: true,
                class: '-ml-1',
                to: `steam://rungameid/730//+connect ${row.original.host}:${row.original.port}`,
                target: '_blank',
                title: 'Connect to server',
              },
              () => h(IconConnect),
            ),
          ],
        )
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
      accessorKey: 'approved_at',
      header: t('servers.title.approvedOn'),
      cell: ({ row }) => {
        return h(
          UTooltip,
          { delayDuration: 100, content: { side: 'top', sideOffset: 2 }, text: toLocal(row.original.approved_at) },
          () => h('span', { class: 'whitespace-nowrap' }, toLocalDistance(row.original.approved_at, locale.value)),
        )
      },
    },
  ]

  return cols
})
</script>

<template>
  <div class="relative">
    <UCard>
      <UTable :data="servers" :columns :loading> </UTable>
    </UCard>
    <div class="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      <TransitionGroup
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95 translate-x-4"
        enter-to-class="opacity-100 scale-100 translate-x-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="bg-cyan-600 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          <div class="font-semibold">Copied!</div>
          <div class="text-sm opacity-90">{{ notification.text }}</div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>
