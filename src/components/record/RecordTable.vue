<script setup lang="ts">
import { ref, computed, h, resolveComponent } from 'vue'
import type { Record, RecordQuery } from '@/types'
import RecordDetail from './RecordDetail.vue'
import { useI18n } from 'vue-i18n'
import { useExpand } from '@/composables/expand'
import { useRouter } from 'vue-router'
import { useCourseQueryStore } from '@/stores/course-query'
import type { TableColumn, TableRow } from '@nuxt/ui'
import { getTierNumber, formatTime, toLocal, toLocalDistance, getTierColor, isNubRecord } from '@/utils'

const props = defineProps<{
  detailed?: boolean
  records: Record[]
  query: RecordQuery
  loading: boolean
}>()

const IconMedalFirst = resolveComponent('IconMedalFirst')
const IconMedalSecond = resolveComponent('IconMedalSecond')
const IconMedalThird = resolveComponent('IconMedalThird')
const UTooltip = resolveComponent('UTooltip')
const UButton = resolveComponent('UButton')

const courseQueryStore = useCourseQueryStore()

const router = useRouter()

const sorting = ref([{ id: 'submitted_at', desc: true }])

const { toggleExpand } = useExpand()

const sortBy = defineModel<'submission-date' | 'time'>('sortBy', { required: true })
const sortOrder = defineModel<'ascending' | 'descending'>('sortOrder', {
  required: true,
})

const { t, locale } = useI18n()

const columns = computed(() => {
  const cols: TableColumn<Record>[] = [
    {
      accessorKey: 'map',
      header: t('records.title.map'),
      cell: ({ row }) => {
        return h(
          'span',
          {
            class: 'text-slate-300 font-semibold text-lg hover:text-slate-200 cursor-pointer',
            onClick: (e: Event) => {
              e.stopPropagation()
              goToCourse(row)
            },
          },
          row.original.map.name,
        )
      },
    },
    {
      accessorKey: 'course',
      header: t('records.title.course'),
      cell: ({ row }) => {
        return h(
          'span',
          {
            class: 'text-lg hover:text-slate-300 cursor-pointer',
            onClick: (e: Event) => {
              e.stopPropagation()
              goToCourse(row)
            },
          },
          row.original.course.name,
        )
      },
    },
    {
      accessorKey: 'tier',
      header: t('records.title.tier'),
      cell: ({ row }) => {
        const tier = isNubRecord(row.original) ? row.original.course.nub_tier : row.original.course.pro_tier
        const tierNumber = getTierNumber(tier)
        const tierColor = getTierColor(tier)

        return h('span', { class: 'text-lg font-medium ', style: { color: tierColor } }, tierNumber)
      },
    },
    {
      accessorKey: 'time',
      header: ({ column }) => {
        return h(UButton, {
          color: 'neutral',
          variant: 'ghost',
          label: t('records.title.time'),
          class: '-mx-2.5',
          onClick: () => {
            column.toggleSorting(column.getIsSorted() === 'asc')
            sortBy.value = 'time'
            sortOrder.value = column.getIsSorted() === 'asc' ? 'ascending' : 'descending'
          },
        })
      },
      cell: ({ row }) => {
        return h('div', { class: 'flex items-start gap-1' }, [
          h('span', { class: 'text-slate-300' }, formatTime(row.original.time)),
          h(
            'div',
            {
              class: `flex justify-center items-center text-gray-100 text-[10px] leading-3 rounded-sm px-1 ${isNubRecord(row.original) ? 'bg-yellow-600' : 'bg-blue-600'}`,
            },
            isNubRecord(row.original) ? 'NUB' : 'PRO',
          ),
        ])
      },
    },
    {
      accessorKey: 'nub_rank',
      header: t('records.title.nubRank'),
      cell: ({ row }) => {
        if (row.original.nub_rank === 1) {
          return h(IconMedalFirst)
        } else if (row.original.nub_rank === 2) {
          return h(IconMedalSecond)
        } else if (row.original.nub_rank === 3) {
          return h(IconMedalThird)
        } else {
          return h('span', {}, row.original.nub_rank || '-')
        }
      },
    },
    {
      accessorKey: 'pro_rank',
      header: t('records.title.proRank'),
      cell: ({ row }) => {
        if (row.original.pro_rank === 1) {
          return h(IconMedalFirst)
        } else if (row.original.pro_rank === 2) {
          return h(IconMedalSecond)
        } else if (row.original.pro_rank === 3) {
          return h(IconMedalThird)
        } else {
          return h('span', {}, row.original.pro_rank || '-')
        }
      },
    },
    {
      accessorKey: 'submitted_at',
      header: ({ column }) => {
        return h(UButton, {
          color: 'neutral',
          variant: 'ghost',
          label: t('records.title.date'),
          class: '-mx-2.5',
          onClick: () => {
            column.toggleSorting(column.getIsSorted() === 'asc')
            sortBy.value = 'submission-date'
            sortOrder.value = column.getIsSorted() === 'asc' ? 'ascending' : 'descending'
          },
        })
      },
      cell: ({ row }) => {
        return h(
          UTooltip,
          { delayDuration: 100, content: { side: 'top', sideOffset: 2 }, text: toLocal(row.original.submitted_at) },
          () => h('span', { class: 'whitespace-nowrap' }, toLocalDistance(row.original.submitted_at, locale.value)),
        )
      },
    },
  ]

  if (props.detailed) {
    cols.splice(3, 0, {
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
    })
    cols.push({
      accessorKey: 'server',
      header: t('records.title.server'),
      cell: ({ row }) => {
        return h('span', { class: 'italic' }, row.original.server.name)
      },
    })
  }

  return cols
})

function goToCourse(row: TableRow<Record>) {
  courseQueryStore.course = row.original.course.name
  courseQueryStore.mode = props.query.mode
  courseQueryStore.leaderboardType = props.query.leaderboardType
  router.push(`/maps/${row.original.map.name}`)
}
</script>

<template>
  <UCard>
    <UTable v-model:sorting="sorting" :data="records" :columns :loading @select="toggleExpand">
      <template #expanded="{ row }">
        <div class="p-3">
          <RecordDetail detailed :record="row.original" />
        </div>
      </template>
    </UTable>
  </UCard>
</template>
