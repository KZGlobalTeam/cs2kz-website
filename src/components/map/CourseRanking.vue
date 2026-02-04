<script setup lang="ts">
import { computed, h, resolveComponent } from 'vue'
import type { Record } from '@/types'
import RecordDetail from '@/components/record/RecordDetail.vue'
import { useI18n } from 'vue-i18n'
import { useExpand } from '@/composables/expand'
import { useRouter } from 'vue-router'
import type { TableColumn } from '@nuxt/ui'
import { formatTime, isNubRecord, seperateThousands, toLocal, toLocalDistance } from '@/utils'

defineProps<{
  records: Record[]
  loading: boolean
}>()

const UTooltip = resolveComponent('UTooltip')
const UButton = resolveComponent('UButton')

const router = useRouter()

const { toggleExpand } = useExpand()

const { t, locale } = useI18n()

const columns = computed(() => {
  const cols: TableColumn<Record>[] = [
    {
      id: 'rank',
      header: t('records.title.rank'),
      cell: ({ row }) => {
        return h('span', `#${row.index + 1}`)
      },
    },
    {
      accessorKey: 'player',
      header: t('records.title.player'),
      cell: ({ row }) => {
        return h(
          'span',
          {
            class: 'text-cyan-600 whitespace-nowrap hover:text-cyan-400 cursor-pointer',
            onClick: (e: Event) => {
              e.stopPropagation()
              router.push(`/profile/${row.original.player.id}`)
            },
          },
          row.original.player.name,
        )
      },
    },
    {
      accessorKey: 'time',
      header: t('records.title.time'),
      cell: ({ row }) => {
        return h('div', { class: 'flex items-start gap-1' }, [
          h('span', { class: 'text-slate-300' }, formatTime(row.original.time)),
          h(
            'div',
            {
              class: `flex justify-center items-center text-gray-100 text-[10px] leading-3 rounded-sm px-1 ${isNubRecord(row.original) ? 'bg-yellow-600' : 'bg-blue-600'}`,
            },
            isNubRecord(row.original) ? 'TP' : 'PRO',
          ),
        ])
      },
    },
    {
      accessorKey: 'nub_points',
      header: t('records.title.nubPoints'),
      cell: ({ row }) => h('span', {}, row.original.nub_points ? seperateThousands(row.original.nub_points) : '-'),
    },
    {
      accessorKey: 'pro_points',
      header: t('records.title.proPoints'),
      cell: ({ row }) => h('span', {}, row.original.pro_points ? seperateThousands(row.original.pro_points) : '-'),
    },
    {
      accessorKey: 'submitted_at',
      header: () => {
        return h(UButton, {
          color: 'neutral',
          variant: 'ghost',
          label: t('records.title.date'),
          class: '-mx-2.5',
        })
      },
      cell: ({ row }) => {
        return h(
          UTooltip,
          { delayDuration: 100, content: { side: 'top', sideOffset: 2 }, text: toLocal(row.original.id) },
          () => h('span', { class: 'whitespace-nowrap' }, toLocalDistance(row.original.id, locale.value)),
        )
      },
    },
  ]

  return cols
})
</script>

<template>
  <UCard>
    <UTable
      :data="records"
      :columns
      :loading
      loading-color="primary"
      loading-animation="carousel"
      @select="toggleExpand"
    >
      <template #expanded="{ row }">
        <div class="p-3">
          <RecordDetail :detailed="false" :record="row.original" />
        </div>
      </template>
    </UTable>
  </UCard>
</template>
