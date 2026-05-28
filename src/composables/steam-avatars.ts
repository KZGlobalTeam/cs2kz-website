import { reactive } from 'vue'

interface SteamPlayerSummary {
  steamid: string
  steamid32: string
  personaname: string
  profileurl: string
  avatarmedium?: string
  avatarfull?: string
  loccountrycode?: string
}

const avatarsByPlayerId = reactive<Record<string, string | undefined>>({})
const loadingAvatarIds = new Set<string>()

export async function getPlayersAvatars(playerIds: string[]) {
  if (playerIds.length === 0) {
    return avatarsByPlayerId
  }

  const uncachedPlayerIds = [...new Set(playerIds)].filter((playerId) => {
    return !Object.prototype.hasOwnProperty.call(avatarsByPlayerId, playerId) && !loadingAvatarIds.has(playerId)
  })

  if (uncachedPlayerIds.length === 0) {
    return avatarsByPlayerId
  }

  uncachedPlayerIds.forEach((playerId) => {
    loadingAvatarIds.add(playerId)
  })

  try {
    const res = await fetch(`/api/steam?steamids=${encodeURIComponent(uncachedPlayerIds.join(','))}`)

    if (!res.ok) {
      throw new Error(`Failed to fetch steam profiles: ${res.status}`)
    }

    const playerSummaries = (await res.json()) as SteamPlayerSummary[]

    playerSummaries.forEach((summary) => {
      if (summary.steamid32) {
        avatarsByPlayerId[summary.steamid32] = summary.avatarfull
      }
    })

    uncachedPlayerIds.forEach((playerId) => {
      if (!Object.prototype.hasOwnProperty.call(avatarsByPlayerId, playerId)) {
        avatarsByPlayerId[playerId] = undefined
      }
    })
  } catch (error) {
    console.error('[fetch error]', error)

    uncachedPlayerIds.forEach((playerId) => {
      avatarsByPlayerId[playerId] = undefined
    })
  } finally {
    uncachedPlayerIds.forEach((playerId) => {
      loadingAvatarIds.delete(playerId)
    })
  }

  return avatarsByPlayerId
}

export async function attachAvatarsToPlayers<T extends { id: string }>(players: T[]) {
  if (players.length === 0) {
    return players.map((player) => ({ ...player, playerAvatar: undefined }))
  }

  await getPlayersAvatars(players.map((player) => player.id))

  return players.map((player) => ({
    ...player,
    playerAvatar: avatarsByPlayerId[player.id],
  }))
}

export async function attachAvatarsToPlayerRecords<T extends { player: { id: string } }>(records: T[]) {
  if (records.length === 0) {
    return records.map((record) => ({ ...record, playerAvatar: undefined }))
  }

  await getPlayersAvatars(records.map((record) => record.player.id))

  return records.map((record) => ({
    ...record,
    playerAvatar: avatarsByPlayerId[record.player.id],
  }))
}
