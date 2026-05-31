let piuData = null

async function loadPIU() {
  if (piuData) return piuData
  const res = await fetch('/piu_locations.json')
  piuData = await res.json()
  return piuData
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export async function findNearestPIU(userLat, userLng) {
  const pius = await loadPIU()
  let nearest = null
  let minDist = Infinity

  for (const piu of pius) {
    const dist = haversine(userLat, userLng, piu.lat, piu.lng)
    if (dist < minDist) {
      minDist = dist
      nearest = piu
    }
  }

  return nearest
}