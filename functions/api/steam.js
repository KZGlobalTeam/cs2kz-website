import SteamID from 'steamid'

function toSteamId64(steamId) {
  if (!steamId) {
    return null
  }

  try {
    const parsedSteamId = new SteamID(steamId.trim())

    return parsedSteamId.isValidIndividual() ? parsedSteamId.getSteamID64() : null
  } catch {
    return null
  }
}

export async function onRequest(context) {
  const apiKey = context.env.STEAM_WEB_API_KEY

  const url = new URL(context.request.url)

  const steamids32 = (url.searchParams.get('steamids') ?? '')
    .split(',')
    .map((steamId) => steamId.trim())
    .filter(Boolean)

  const steamId32By64 = new Map()

  const steamids = steamids32
    .map((steamId32) => {
      const steamId64 = toSteamId64(steamId32)

      if (steamId64) {
        steamId32By64.set(steamId64, steamId32)
      }

      return steamId64
    })
    .filter(Boolean)

  if (steamids.length === 0) {
    return Response.json({ error: 'Invalid or missing steamid query parameter' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2?key=${apiKey}&steamids=${encodeURIComponent(steamids.join(','))}`,
    )

    const data = await res.json()

    const players = data?.response?.players || []

    players.forEach((player) => {
      player['steamid32'] = steamId32By64.get(player.steamid)
    })

    return Response.json(players)
  } catch (error) {
    console.log('[fetch error]', error)

    return Response.json({ error: "Failed to fetch players' steam profiles" }, { status: 500 })
  }
}
