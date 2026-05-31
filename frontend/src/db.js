import { openDB } from 'idb'

const DB_NAME = 'roadwatch'
const STORE_NAME = 'geojson'

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME)
    }
  })
}

export async function saveGeoJSON(data) {
  const db = await getDB()
  await db.put(STORE_NAME, data, 'nh_enriched')
}

export async function loadGeoJSON() {
  const db = await getDB()
  return db.get(STORE_NAME, 'nh_enriched')
}