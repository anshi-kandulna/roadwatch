import { saveGeoJSON, loadGeoJSON } from './db'

export async function fetchGeoJSON() {
  try {
    const cached = await loadGeoJSON()
    if (cached) {
      console.log('loaded from IndexedDB')
      return cached
    }
  } catch (e) {
    console.error('IndexedDB read failed:', e)
  }

  console.log('fetching from network')
  const res = await fetch('/nh_enriched.geojson')
  const data = await res.json()

  try {
    await saveGeoJSON(data)
    console.log('saved to IndexedDB')
  } catch (e) {
    console.error('IndexedDB save failed:', e)
  }

  return data
}
