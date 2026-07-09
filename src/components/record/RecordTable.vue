<script setup lang="ts">
import { ref, computed, h, resolveComponent, useTemplateRef, onMounted, nextTick } from 'vue'
import type { ComponentPublicInstance, VNode } from 'vue'
import type { RecordQuery, PlayerRecordQuery, Record } from '@/types'
import RecordDetail from './RecordDetail.vue'
import { useI18n } from 'vue-i18n'
import { useExpand } from '@/composables/expand'
import { useInfiniteScroll } from '@vueuse/core'
import { RouterLink } from 'vue-router'
import type { TableColumn } from '@nuxt/ui'
import { getTierNumber, formatTime, getTierColor, seperateThousands, uuidToLocal, uuidToLocalDistance } from '@/utils'
import { useStyleStore } from '@/stores/style.ts'

const props = defineProps<{
  type: 'profile-runs' | 'records' | 'course-ranking' | 'player-wrs'
  total?: number
  records: Record[]
  loading: boolean
}>()

const emits = defineEmits<{
  (e: 'intersect'): void
}>()

const styleStore = useStyleStore()

const IconMedalFirst = resolveComponent('IconMedalFirst')
const IconMedalSecond = resolveComponent('IconMedalSecond')
const IconMedalThird = resolveComponent('IconMedalThird')
const IconCopy = resolveComponent('IconCopy')
const IconDownload = resolveComponent('IconDownload')
const IconDownloadGrey = resolveComponent('IconDownloadGrey')
const IconSortUp = resolveComponent('IconSortUp')
const IconSortDown = resolveComponent('IconSortDown')
const IconUpDown = resolveComponent('IconUpDown')
const UTooltip = resolveComponent('UTooltip')
const UButton = resolveComponent('UButton')
const UAvatar = resolveComponent('UAvatar')
const TheImage = resolveComponent('TheImage')

const sorting = ref([])

const { toggleExpand } = useExpand()

const query = defineModel<RecordQuery | PlayerRecordQuery>('query', { required: true })

const { t, locale } = useI18n()
const toast = useToast()

const table = useTemplateRef<ComponentPublicInstance>('table')

async function toggleSorting(sortBy: RecordQuery['sort_by']) {
  if (query.value.sort_order === 'descending') {
    query.value.sort_order = 'ascending'
  } else if (query.value.sort_order === 'ascending') {
    query.value.sort_order = undefined
  } else {
    query.value.sort_order = 'descending'
  }

  if (query.value.sort_order === undefined) {
    query.value.sort_by = undefined
  } else {
    query.value.sort_by = sortBy
  }

  await nextTick()
  table.value?.$el.scrollTo({ top: 0, behavior: 'smooth' })
}

function getSortIcon() {
  if (query.value.sort_order === 'ascending') {
    return IconSortUp
  } else if (query.value.sort_order === 'descending') {
    return IconSortDown
  } else {
    return IconUpDown
  }
}

function getRankColor(rank: number | undefined | null) {
  if (rank === null || rank === undefined) return ''

  if (rank <= 10) {
    return 'text-red-400'
  } else {
    return ''
  }
}

const columns = computed(() => {
  const indexCol: TableColumn<Record> = {
    id: 'rank',
    header: t('records.title.rank'),
    cell: ({ row }) => {
      return h('span', `#${row.index + 1}`)
    },
  }

  const playerCol: TableColumn<Record> = {
    accessorKey: 'player',
    header: t('records.title.player'),
    cell: ({ row }) => {
      return h(
        RouterLink,
        {
          class: 'flex items-center gap-2 min-w-0 text-cyan-600 hover:text-cyan-400 cursor-pointer',
          to: `/profile/${row.original.player.id}`,
        },
        () => [
          row.original.playerAvatar
            ? h(UAvatar, {
                src: row.original.playerAvatar,
                alt: row.original.player.name,
                size: 'sm',
              })
            : null,
          h('span', { class: 'truncate whitespace-nowrap' }, row.original.player.name),
        ],
      )
    },
  }

  const mapCol: TableColumn<Record> = {
    accessorKey: 'map',
    header: t('records.title.map'),
    cell: ({ row }) => {
      return props.type === 'records' || props.type === 'player-wrs'
        ? h('div', { class: 'flex items-center gap-2' }, [
            h(TheImage, {
              src: `https://github.com/kzglobalteam/cs2kz-images/raw/public/webp/thumbnail/${row.original.map.name}/1.webp`,
              alt: 'Map Image',
              class: 'hidden lg:inline w-24 h-auto object-cover rounded-sm ring-1 ring-zinc-700',
            }),
            h(
              RouterLink,
              {
                class: 'text-slate-300 font-semibold text-lg hover:text-slate-200 cursor-pointer',
                to: `/maps/${row.original.map.name}?course=${row.original.course.name}`,
              },
              () => row.original.map.name,
            ),
          ])
        : h(
            RouterLink,
            {
              class: 'text-slate-300 font-semibold text-lg hover:text-slate-200 cursor-pointer',
              to: `/maps/${row.original.map.name}?course=${row.original.course.name}`,
            },
            () => row.original.map.name,
          )
    },
  }

  const courseCol: TableColumn<Record> = {
    accessorKey: 'course',
    header: t('records.title.course'),
    cell: ({ row }) => {
      return h('div', { class: 'max-w-44 truncate' }, [
        h(
          RouterLink,
          {
            class: 'w-max text-lg hover:text-slate-300 cursor-pointer',
            to: `/maps/${row.original.map.name}?course=${row.original.course.name}`,
          },
          () => row.original.course.name,
        ),
      ])
    },
  }

  const tierCol: TableColumn<Record> = {
    accessorKey: 'tier',
    header: styleStore.leaderboardType === 'overall' ? t('records.title.tier') : t('records.title.proTier'),
    cell: ({ row }) => {
      const tier =
        styleStore.leaderboardType === 'overall' ? row.original.course.nub_tier : row.original.course.pro_tier
      const tierNumber = getTierNumber(tier)
      const tierColor = getTierColor(tier)

      return h('span', { class: 'text-lg font-medium ', style: { color: tierColor } }, tierNumber)
    },
  }

  const timeCol: TableColumn<Record> = {
    accessorKey: 'time',
    header: () => {
      return props.type === 'course-ranking'
        ? t('records.title.time')
        : h(
            UButton,
            {
              color: 'neutral',
              variant: 'ghost',
              label: t('records.title.time'),
              class: '-mx-2.5',
              onClick: () => {
                toggleSorting('time')
              },
            },
            {
              leading: () => (query.value.sort_by !== 'time' ? h(IconUpDown) : h(getSortIcon())),
            },
          )
    },
    cell: ({ row }) => {
      return h('div', { class: 'flex items-start gap-1' }, [
        h('span', { class: 'text-slate-300' }, formatTime(row.original.time)),
        h(
          'div',
          {
            class: `flex justify-center items-center text-gray-100 text-[10px] leading-3 rounded-sm px-1 ${row.original.teleports > 0 ? 'bg-yellow-600' : 'bg-blue-600'}`,
          },
          row.original.teleports > 0 ? 'TP' : 'PRO',
        ),
      ])
    },
  }

  const rankCol: TableColumn<Record> = {
    accessorKey: 'nub_rank',
    header: styleStore.leaderboardType === 'overall' ? t('records.title.nubRank') : t('records.title.proRank'),
    cell: ({ row }) => {
      let node: VNode
      const recordRank = styleStore.leaderboardType === 'overall' ? row.original.nub_rank : row.original.pro_rank
      if (recordRank === 1) {
        node = h(IconMedalFirst)
      } else if (recordRank === 2) {
        node = h(IconMedalSecond)
      } else if (recordRank === 3) {
        node = h(IconMedalThird)
      } else {
        node = h('span', { class: getRankColor(recordRank) }, recordRank || '-')
      }

      return h('div', { class: 'flex w-8 justify-center' }, [node])
    },
  }

  const nubPointsCol: TableColumn<Record> = {
    accessorKey: 'nub_points',
    header: t('records.title.nubPoints'),
    cell: ({ row }) => h('span', {}, row.original.nub_points ? seperateThousands(row.original.nub_points) : '-'),
  }

  const proPointsCol: TableColumn<Record> = {
    accessorKey: 'pro_points',
    header: t('records.title.proPoints'),
    cell: ({ row }) => h('span', {}, row.original.pro_points ? seperateThousands(row.original.pro_points) : '-'),
  }

  const submissionDateCol: TableColumn<Record> = {
    accessorKey: 'submitted_at',
    header: () => {
      return props.type === 'course-ranking'
        ? t('records.title.date')
        : h(
            UButton,
            {
              color: 'neutral',
              variant: 'ghost',
              label: t('records.title.date'),
              class: '-mx-2.5',
              onClick: () => {
                toggleSorting('submission-date')
              },
            },
            {
              leading: () => (query.value.sort_by !== 'submission-date' ? h(IconUpDown) : h(getSortIcon())),
            },
          )
    },
    cell: ({ row }) => {
      return h(
        UTooltip,
        { delayDuration: 100, content: { side: 'bottom', sideOffset: 2 }, text: uuidToLocal(row.original.id) },
        () => h('span', { class: 'whitespace-nowrap' }, uuidToLocalDistance(row.original.id, locale.value)),
      )
    },
  }

  const serverCol: TableColumn<Record> = {
    accessorKey: 'server',
    header: t('records.title.server'),
    cell: ({ row }) => {
      return h('span', { class: 'italic' }, row.original.server.name)
    },
  }

  const replayCol: TableColumn<Record> = {
    id: 'replay',
    header: t('records.title.replay'),
    cell: ({ row }) => {
      const copyBtn = h(
        UTooltip,
        { text: t('records.actions.copyId'), content: { side: 'top' }, ui: { content: 'z-[2]' } },
        () =>
          h(
            UButton,
            {
              size: 'xs',
              variant: 'ghost',
              square: true,
              color: 'neutral',
              class: 'cursor-pointer',
              onClick: async (e: Event) => {
                e.stopPropagation()
                await navigator.clipboard.writeText(row.original.id)
                toast.add({
                  title: t('records.toast.idCopied'),
                  color: 'success',
                  progress: false,
                  duration: 2000,
                })
              },
            },
            () => h(IconCopy),
          ),
      )

      const isUnavailable = !row.original.replay_available

      const downloadBtn = h(
        UTooltip,
        {
          text: isUnavailable ? t('records.actions.replayUnavailable') : t('records.actions.downloadReplay'),
          content: { side: 'top' },
          ui: { content: 'z-[2]' },
        },
        () =>
          h(
            UButton,
            {
              size: 'xs',
              variant: 'ghost',
              square: true,
              color: 'neutral',
              disabled: isUnavailable,
              class: isUnavailable ? 'cursor-not-allowed' : '',
              onClick: async (e: Event) => {
                e.stopPropagation()
                if (isUnavailable) return

                const url = `https://replays.cs2kz.org/${row.original.id}`
                try {
                  const res = await fetch(url, { method: 'HEAD' })
                  if (res.status === 404) {
                    toast.add({
                      title: t('records.toast.replayNotFoundTitle'),
                      description: t('records.toast.replayNotFoundDescription'),
                      color: 'error',
                      icon: 'i-heroicons-exclamation-circle',
                    })
                  } else {
                    window.open(url, '_blank', 'noopener,noreferrer')
                  }
                } catch (error) {
                  console.error('[fetch error]', error)
                  window.open(url, '_blank', 'noopener,noreferrer')
                }
              },
            },
            () => (isUnavailable ? h(IconDownloadGrey) : h(IconDownload)),
          ),
      )

      return h('div', { class: 'flex items-center gap-1' }, [copyBtn, downloadBtn])
    },
  }

  const cols: TableColumn<Record>[] = []

  if (props.type === 'records') {
    cols.push(mapCol, courseCol, tierCol, playerCol, timeCol, rankCol, submissionDateCol, replayCol, serverCol)
  } else if (props.type === 'profile-runs') {
    cols.push(mapCol, courseCol, tierCol, timeCol, rankCol, submissionDateCol, replayCol)
  } else if (props.type === 'course-ranking') {
    cols.push(indexCol, playerCol, timeCol, nubPointsCol, proPointsCol, submissionDateCol, replayCol)
  } else if (props.type === 'player-wrs') {
    cols.push(mapCol, courseCol, tierCol, timeCol, submissionDateCol)
  }

  return cols
})

onMounted(() => {
  if (props.type !== 'profile-runs') {
    useInfiniteScroll(
      table.value?.$el,
      () => {
        emits('intersect')
      },
      {
        distance: 200,
        canLoadMore: () => {
          return !props.loading
        },
      },
    )
  }
})
</script>

<template>
  <UTable
    ref="table"
    v-model:sorting="sorting"
    sticky
    :data="records"
    :columns
    :loading
    @select="toggleExpand"
    :class="type === 'player-wrs' ? '' : 'border border-zinc-700 rounded-md'"
  >
    <template #expanded="{ row }">
      <div class="p-3">
        <RecordDetail :type="type" :record="row.original" />
      </div>
    </template>
  </UTable>
</template>
