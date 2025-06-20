import type { paths, components } from '../../openapi-types'

export type Player = components['schemas']['PlayerInfo']

export interface PlayerSteam {
  id: string
  name: string
  country: string
  profile_url: string
  avatar_url: string
}

export type Tier = components['schemas']['Tier']

export type Mode = components['schemas']['Mode']

export type Style = components['schemas']['Styles']

export type MapState = components['schemas']['MapState']

export type Map = components['schemas']['Map']

export type Filters = components['schemas']['Filters']

/* eslint-disable */
export type CSGOFilters = Extract<Filters, { kzt: any }>

export type CS2Filters = Extract<Filters, { ckz: any }>
/* eslint-enable */

export type Course = components['schemas']['Course']

export type LeaderboardType = 'overall' | 'pro'

export interface MapQuery {
  name: string
  state: MapState
  mode: Mode
  leaderboardType: LeaderboardType
  tier?: Tier
  limit: number
  offset: number
}

export interface MapCard {
  id: number
  name: string
  state: MapState
  mappers: Player[]
  courses: CourseExt[]
  approved_at: string
}

export interface CourseExt {
  name: string
  tier: Tier
  tierNo: number
  tierColor: string
  ranked: boolean
}

export interface CourseInfo {
  id: string
  map: string
  name: string
  tier: Tier
  ranked: boolean
  mappers: Player[]
  created_on: string
  img: string
}

export interface CourseQuery {
  name: string
  mode: Mode
  leaderboardType: LeaderboardType
  tier?: Tier
  sort_by: 'map' | 'tier' | 'created_on'
  sort_order: 'ascending' | 'descending'
  limit: number
  offset: number
}

export type Record = components['schemas']['Record']

export type RecordWithImproved = { timeImproved: number } & Record

export type RecordResponse = paths['/records']['get']['responses']['200']['content']['application/json']

export interface RecordQuery {
  mode: Mode
  // only include pro records
  pro: boolean
  top: boolean
  max_rank?: number
  player: string
  map: string
  course: string
  server: string
  sort_by: 'submitted_at' | 'time'
  sort_order: 'ascending' | 'descending'
  limit: number
  offset: number
}

export type Server = components['schemas']['Server']

export type ServerResponse = paths['/servers']['get']['responses']['200']['content']['application/json']

export interface ServerQuery {
  name: string
  host: string
  owned_by: string
  limit: number
  offset: number
}

export interface Profile {
  id: string
  name: string
  rating: number
  first_joined_at: string
}

export interface ProfileQuery {
  player_id: string
  mode: Mode
}
