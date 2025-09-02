import type { paths, components } from '../../openapi-types'

export type PlayerInfo = components['schemas']['PlayerInfo']

export type Player = components['schemas']['Player']

export type PlayerResponse = paths['/players']['get']['responses']['200']['content']['application/json']

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

export type MapResponse = {
  total: number
  values: Map[]
}

export type Filters = components['schemas']['Filters']

/* eslint-disable */
export type CSGOFilters = Extract<Filters, { kzt: any }>

export type CS2Filters = Extract<Filters, { ckz: any }>
/* eslint-enable */

export type Course = components['schemas']['Course']

export interface MapQuery {
  game: 'cs2' | 'csgo'
  name: string
  randomName: string
  state: MapState
  mode: Mode
  pro: boolean
  tier: Tier[]
  limit: number
  offset: number
}

export interface MapCard {
  id: number
  name: string
  state: MapState
  creator: PlayerInfo
  courses: CourseExt[]
  created_at: string
}

export interface CourseExt {
  id: number
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
  mappers: PlayerInfo[]
  created_at: string
  img: string
}

export interface CourseQuery {
  name: string
  mode: Mode
  pro: boolean
  tier?: Tier
  sort_by: 'map' | 'tier' | 'created_at'
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
  player?: string
  // course id
  course?: number
  server?: string
  sort_by: 'submission-date' | 'time'
  sort_order: 'ascending' | 'descending'
  limit: number
}

export type Server = components['schemas']['Server']

export type ServerResponse = paths['/servers']['get']['responses']['200']['content']['application/json']

export interface ServerQuery {
  name: string
  host: string
  owned_by: string
  include_degloballed: boolean
  limit: number
  offset: number
}

export interface Profile {
  id: string
  name: string
  rating: number
  created_at: string
}

export interface ProfileQuery {
  player_id: string
}
