import axios from 'axios'
import type { CourseInfo, Record as Run, RecordWithImproved, Tier, LeaderboardType } from '@/types'
import { format, formatDistanceToNowStrict } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

export function validQuery(query: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(query).filter(([_, value]) => value !== '' && value !== null && value !== undefined),
  )
}

export function sort<T>(data: T[], order: 'ascending' | 'descending', orderBy: keyof T) {
  const ord = order === 'ascending' ? 1 : -1
  if (!orderBy) return data

  return data.sort((a, b) => {
    const aValue = a[orderBy] as unknown
    const bValue = b[orderBy] as unknown

    if (typeof aValue === 'number' && typeof bValue === 'number') return (aValue - bValue) * ord

    if (typeof aValue === 'string' && typeof bValue === 'string') return aValue.localeCompare(bValue) * ord

    return 0
  })
}

const tierNumberMap = new Map([
  ['very-easy', 1],
  ['easy', 2],
  ['medium', 3],
  ['advanced', 4],
  ['hard', 5],
  ['very-hard', 6],
  ['extreme', 7],
  ['death', 8],
  ['unfeasible', 9],
  ['impossible', 10],
])

const tierColorMap = new Map([
  ['very-easy', '#02e319'],
  ['easy', '#4CAF50'],
  ['medium', '#8BC34A'],
  ['advanced', '#d8e302'],
  ['hard', '#FFC107'],
  ['very-hard', '#e34202'],
  ['extreme', '#e31c02'],
  ['death', '#e302dc'],
  ['unfeasible', '#a002e3'],
  ['impossible', '#d1d1d1'],
])

export const mapStateColorMap = {
  wip: 'text-yellow-400 bg-yellow-300/50',
  pending: 'text-orange-400 bg-orange-300/50',
  approved: 'text-green-400 bg-green-300/50',
  completed: 'text-blue-400 bg-blue-300/50',
  graveyard: 'text-gray-400 bg-gray-400',
}

export function isNubRecord(record: Run): boolean {
  return record.teleports > 0
}

export function getTierNumber(tier: string) {
  return tierNumberMap.get(tier) as number
}

export function getTierColor(tier: string) {
  return tierColorMap.get(tier) as string
}

export function transformTier(tier: Tier) {
  if (tier.includes('-')) {
    return tier
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
      .join(' ')
  } else {
    return tier.charAt(0).toUpperCase() + tier.substring(1)
  }
}

export function toLocal(date: string, short?: boolean) {
  return format(new Date(date), short ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm:ss')
}

export function toLocalDistance(date: string, locale: string) {
  if (locale === 'en') {
    return formatDistanceToNowStrict(new Date(date), { addSuffix: true })
  } else if (locale === 'zh') {
    return formatDistanceToNowStrict(new Date(date), { addSuffix: true, locale: zhCN })
  }
}

export function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = (seconds % 60).toFixed(3)

  const timeParts = []

  if (hours > 0) {
    timeParts.push(hours.toString().padStart(2, '0'))
  }

  if (minutes > 0 || hours > 0) {
    timeParts.push(minutes.toString().padStart(2, '0'))
  }

  timeParts.push(remainingSeconds.padStart(6, '0'))

  return timeParts.join(':')
}

export function seperateThousands(num: number) {
  return Math.floor(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function getWrHistory(records: Run[]) {
  const history: RecordWithImproved[] = []

  records.forEach((record) => {
    const len = history.length
    if (len === 0) {
      history.push({ ...record, timeImproved: 0 })
    } else {
      const last = history[len - 1] as Run
      if (record.time <= last.time) {
        history.push({ ...record, timeImproved: last.time - record.time })
      }
    }
  })

  return history.reverse()
}

// top records and points distribution
export function calcRanksAndPointsDist(runs: Run[], leaderboardType: LeaderboardType) {
  const wrs = runs.filter((record) =>
    leaderboardType === 'pro' ? record.pro_rank === 1 : record.nub_rank === 1,
  ).length

  const top20 = runs.filter((record) =>
    leaderboardType === 'pro' ? record.pro_rank! <= 20 : record.nub_rank! <= 20,
  ).length

  const top50 = runs.filter((record) =>
    leaderboardType === 'pro' ? record.pro_rank! <= 50 : record.nub_rank! <= 50,
  ).length

  const top100 = runs.filter((record) =>
    leaderboardType === 'pro' ? record.pro_rank! <= 100 : record.nub_rank! <= 100,
  ).length

  const pointsDist = Array.from({ length: 11 }, (_, i) => {
    const lower = i * 1000
    const upper = lower + 1000
    return runs.filter((record) => {
      if (leaderboardType === 'pro') {
        return record.pro_points! >= lower && record.pro_points! < upper
      } else {
        return record.nub_points! >= lower && record.nub_points! < upper
      }
    }).length
  })

  return {
    wrs,
    top20,
    top50,
    top100,
    pointsDist,
  }
}

// completion by tier
export function calcCompletedCourses(runs: Run[], leaderboardType: LeaderboardType) {
  const tiers = ['very-easy', 'easy', 'medium', 'advanced', 'hard', 'very-hard', 'extreme', 'death']

  return tiers.map((tier) => {
    return runs.filter(
      (record) => tier === (leaderboardType === 'pro' ? record.course.pro_tier : record.course.nub_tier),
    ).length
  })
}

export function calcTotalCourses(courses: CourseInfo[]) {
  const tiers = ['very-easy', 'easy', 'medium', 'advanced', 'hard', 'very-hard', 'extreme', 'death']

  return tiers.map((tier) => {
    return courses.filter((course) => course.tier === tier).length
  })
}

export function getRankByRating(rating: number) {
  if (rating >= 37500) return ['Legend', '#ffb800']
  if (rating >= 35000) return ['Master', '#e4af3a']
  if (rating >= 30000) return ['Pro', '#ff3131']
  if (rating >= 25000) return ['Semipro', '#ff6161']
  if (rating >= 20000) return ['Expert', '#d32de6']
  if (rating >= 15000) return ['Skilled', '#bb82f0']
  if (rating >= 10000) return ['Regular', '#4c6aff']
  if (rating >= 5000) return ['Casual', '#5f99d9']
  if (rating > 0) return ['Beginner', '#d1d1d1']
  return ['New', '#cbcbcb']
}
