import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { saveGeoJSON, loadGeoJSON } from './db'

async function fetchGeoJSON() {
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

export default function Map({ onNHClick }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const onNHClickRef = useRef(onNHClick)

  useEffect(() => {
    onNHClickRef.current = onNHClick
  }, [onNHClick])

  useEffect(() => {
    if (mapInstanceRef.current) return

    const map = L.map(mapRef.current).setView([22.5, 80.0], 5)
    mapInstanceRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    fetchGeoJSON().then(data => {
      L.geoJSON(data, {
        style: {
          color: '#e85d04',
          weight: 3,
          opacity: 0.8
        },
        onEachFeature: (feature, layer) => {
          layer.on('click', (e) => {
            L.DomEvent.stopPropagation(e)
            onNHClickRef.current(feature.properties)
            layer.setStyle({ color: '#ffba08', weight: 5 })
            setTimeout(() => layer.setStyle({ color: '#e85d04', weight: 3 }), 2000)
          })
        }
      }).addTo(map)
    })
  }, [])

  return (
    <div
      ref={mapRef}
      style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0 }}
    />
  )
}