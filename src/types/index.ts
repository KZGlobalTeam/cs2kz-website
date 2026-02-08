import type { paths, components } from '../../openapi-types'

export type Player = components['schemas']['PlayerInfo']

export interface PlayerSteam {
  id: string
  name: string
  country?: string
  profile_url: string
  avatar_url: string
}

export type Tier = components['schemas']['CourseFilterTier']

export type Mode = components['schemas']['Mode']

export type Style = components['schemas']['Styles']

export type MapState = components['schemas']['MapState']

export type Map = components['schemas']['Map']

export type MapResponse = paths['/maps']['get']['responses']['200']['content']['application/json']

export type CourseFilterState = components['schemas']['CourseFilterState']

export type CourseFilter = components['schemas']['CourseFilter']
export type CourseFilters = components['schemas']['CourseFilters']

export type Course = components['schemas']['Course']

export type LeaderboardType = 'overall' | 'pro'

export interface MapQuery {
  name: string
  mapper: string
  randomName: string
  unfinishedOnly: boolean
  state: MapState
  mode: Mode
  leaderboardType: LeaderboardType
  tier: Tier[]
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
  state: CourseFilterState
}

export interface CourseInfo {
  id: string
  map: string
  name: string
  tier: Tier
  state: CourseFilterState
  mappers: Player[]
  approved_at: string
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
  leaderboardType: LeaderboardType
  top: boolean
  max_rank?: number
  player: string
  map: string
  course: string
  server: string
  sort_by: 'submission-date' | 'time'
  sort_order: 'ascending' | 'descending'
  limit: number
  offset: number
}

export type Server = components['schemas']['Server']

export interface RunningServer {
  id: number
  name: string
  host: string
  port: number
  owner: {
    id: string
    name: string
  }
  country: { name: string; code: string } | null
  region: { name: string; code: string } | null
  approved_at: string
  current_map: {
    name: string
    // as in whether it's in the API
    isGlobal: boolean
  }
  num_players: number
  max_players: number
}

export type ServerResponse = paths['/servers']['get']['responses']['200']['content']['application/json']

export interface ServerQuery {
  name: string
  map: string
  owner: string
  region_code?: string
  globalMapOnly: boolean
  sortBy: 'name' | 'num_players' | 'approved_at'
  sortOrder: 'ascending' | 'descending'
}

export interface GeoData {
  ip: string
  country: string
  country_code: string
  region: string | null
  city: string | null
  region_name: string
  region_code: string
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
