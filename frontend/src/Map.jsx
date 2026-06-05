import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import L from 'leaflet'
import { fetchGeoJSON } from './geojson'
import { getSegmentColor } from './utils'

const DEFAULT_STYLE = {
  color: '#7d9a8a',
  weight: 3,
  opacity: 0.85,
}

const HOVER_STYLE = {
  weight: 4,
  opacity: 1,
}

const ACTIVE_STYLE = {
  color: '#4ade80',
  weight: 6,
  opacity: 1,
}

const HALO_STYLE = {
  color: '#4ade80',
  weight: 14,
  opacity: 0.25,
}

const SIDEBAR_WIDTH = 350
const INITIAL_VIEW = {
  center: [22.5, 80.0],
  zoom: window.innerWidth < 640 ? 4 : 5
}

function applyDefaultStyle(layer, projects) {
  const color = getSegmentColor(projects)
  layer.setStyle({ ...DEFAULT_STYLE, color })
}

const RoadMap = forwardRef(function RoadMap(
  { onNHClick, selectedNH, sidebarOpen, onGeoJSONLoaded },
  ref
) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const geoJSONLayerRef = useRef(null)
  const osmLayerRef = useRef(null)
  const satelliteLayerRef = useRef(null)
  const isSatelliteRef = useRef(false)
  const locationMarkerRef = useRef(null)
  const layersRef = useRef(new globalThis.Map())
  const projectsByNameRef = useRef(new globalThis.Map())
  const featureByNameRef = useRef(new globalThis.Map())
  const activeLayerRef = useRef(null)
  const activeHaloRef = useRef(null)
  const pulseIntervalRef = useRef(null)
  const onNHClickRef = useRef(onNHClick)
  const sidebarOpenRef = useRef(sidebarOpen)

  useEffect(() => {
    onNHClickRef.current = onNHClick
  }, [onNHClick])

  useEffect(() => {
    sidebarOpenRef.current = sidebarOpen
  }, [sidebarOpen])

  function findLayerName(layer) {
    return [...layersRef.current.entries()].find(([, l]) => l === layer)?.[0]
  }

  function clearPulse() {
    if (pulseIntervalRef.current) {
      clearInterval(pulseIntervalRef.current)
      pulseIntervalRef.current = null
    }
  }

  function clearHalo(map) {
    if (activeHaloRef.current) {
      map.removeLayer(activeHaloRef.current)
      activeHaloRef.current = null
    }
  }

  function deselectActive(map) {
    clearPulse()
    clearHalo(map)
    if (activeLayerRef.current) {
      const prevName = findLayerName(activeLayerRef.current)
      applyDefaultStyle(
        activeLayerRef.current,
        prevName ? projectsByNameRef.current.get(prevName) : null
      )
      activeLayerRef.current = null
    }
  }

  function startHaloPulse(halo) {
    clearPulse()
    let pulseCount = 0
    pulseIntervalRef.current = setInterval(() => {
      if (!activeHaloRef.current) {
        clearPulse()
        return
      }
      pulseCount++
      const opacity = pulseCount % 2 === 1 ? 0.35 : 0.15
      activeHaloRef.current.setStyle({ ...HALO_STYLE, opacity })
      if (pulseCount >= 6) {
        clearPulse()
        activeHaloRef.current.setStyle({ ...HALO_STYLE, opacity: 0.25 })
      }
    }, 800)
  }

  function selectSegment(name, map) {
    const layer = layersRef.current.get(name)
    const feature = featureByNameRef.current.get(name)
    if (!layer || !feature) return

    if (activeLayerRef.current === layer && activeHaloRef.current) return

    if (activeLayerRef.current && activeLayerRef.current !== layer) {
      deselectActive(map)
    } else if (activeLayerRef.current === layer) {
      clearPulse()
      clearHalo(map)
    }

    activeLayerRef.current = layer

    const halo = L.geoJSON(feature, {
      style: HALO_STYLE,
      interactive: false,
    })
    halo.addTo(map)
    if (halo.bringToBack) halo.bringToBack()
    activeHaloRef.current = halo

    layer.setStyle(ACTIVE_STYLE)
    if (layer.bringToFront) layer.bringToFront()
    startHaloPulse(halo)
  }

  function getFlyPadding() {
    return sidebarOpenRef.current
      ? { paddingTopLeft: [40, 80], paddingBottomRight: [SIDEBAR_WIDTH + 40, 40] }
      : { padding: [80, 40] }
  }

  useImperativeHandle(ref, () => ({
    flyToSegment(name) {
      const layer = layersRef.current.get(name)
      const map = mapInstanceRef.current
      if (!layer || !map) return
      selectSegment(name, map)
      map.flyToBounds(layer.getBounds(), { ...getFlyPadding(), duration: 0.6, maxZoom: 12 })
    },
    zoomIn() {
      mapInstanceRef.current?.zoomIn()
    },
    zoomOut() {
      mapInstanceRef.current?.zoomOut()
    },
    fitBounds() {
      const map = mapInstanceRef.current
      const geoLayer = geoJSONLayerRef.current
      if (map && geoLayer) {
        map.flyToBounds(geoLayer.getBounds(), { ...getFlyPadding(), duration: 0.6 })
      }
    },
    toggleLayer() {
      const map = mapInstanceRef.current
      const osm = osmLayerRef.current
      const satellite = satelliteLayerRef.current
      if (!map || !osm || !satellite) return

      if (isSatelliteRef.current) {
        map.removeLayer(satellite)
        osm.addTo(map)
      } else {
        map.removeLayer(osm)
        satellite.addTo(map)
      }
      isSatelliteRef.current = !isSatelliteRef.current
    },
    locateUser() {
      const map = mapInstanceRef.current
      if (!map) return

      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords
          map.flyTo([latitude, longitude], 14, { duration: 0.8 })

          if (locationMarkerRef.current) {
            map.removeLayer(locationMarkerRef.current)
          }
          locationMarkerRef.current = L.circleMarker([latitude, longitude], {
            radius: 8,
            color: '#16a34a',
            fillColor: '#4ade80',
            fillOpacity: 0.8,
            weight: 2,
          }).addTo(map)
        },
        err => console.error('Geolocation failed:', err)
      )
    },
  }))

  useEffect(() => {
    if (mapInstanceRef.current) return

    const map = L.map(mapRef.current, { zoomControl: false }).setView(
      INITIAL_VIEW.center,
      INITIAL_VIEW.zoom
    )
    map.getContainer().focus = () => { }
    mapInstanceRef.current = map

    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map)
    osmLayerRef.current = osm

    satelliteLayerRef.current = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: '© Esri' }
    )

    fetchGeoJSON()
      .then(data => {
        onGeoJSONLoaded?.(data.features || [])

        const geoLayer = L.geoJSON(data, {
          style: feature => ({
            ...DEFAULT_STYLE,
            color: getSegmentColor(feature.properties?.projects),
          }),
          onEachFeature: (feature, layer) => {
            const name = feature.properties?.Name
            if (name) {
              layersRef.current.set(name, layer)
              projectsByNameRef.current.set(name, feature.properties?.projects)
              featureByNameRef.current.set(name, feature)
            }

            const displayName = feature.properties?.nh_name || feature.properties?.road_name || feature.properties?.Name || feature.properties?.name || 'Unknown NH'
            layer.bindTooltip(displayName, {
              sticky: true,
              className: 'road-tooltip',
            })

            layer.on('mouseover', () => {
              if (layer === activeLayerRef.current) return
              const color = getSegmentColor(feature.properties?.projects)
              layer.setStyle({ ...HOVER_STYLE, color })
              if (layer.bringToFront) layer.bringToFront()
              mapRef.current.style.cursor = 'pointer'
            })

            layer.on('mouseout', () => {
              if (layer === activeLayerRef.current) return
              applyDefaultStyle(layer, feature.properties?.projects)
              mapRef.current.style.cursor = ''
            })

            layer.on('click', e => {
              L.DomEvent.stopPropagation(e)
              selectSegment(name, map)
              onNHClickRef.current(feature.properties)
            })
          },
        }).addTo(map)

        geoJSONLayerRef.current = geoLayer
      })
      .catch(err => {
        console.error('Failed to load GeoJSON:', err)
      })

    return () => {
      clearPulse()
    }
  }, [onGeoJSONLoaded])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    map.invalidateSize({ animate: true })

    if (selectedNH && activeLayerRef.current) {
      const bounds = activeLayerRef.current.getBounds()
      map.flyToBounds(bounds, { ...getFlyPadding(), duration: 0.5, maxZoom: 12 })
    }
  }, [sidebarOpen, selectedNH])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (!selectedNH) {
      deselectActive(map)
      return
    }

    selectSegment(selectedNH.Name, map)
  }, [selectedNH])



  return (
    <div
      ref={mapRef}
      className="absolute inset-0 transition-[width] duration-200 ease-out"
      style={{
        width: sidebarOpen ? `calc(100% - ${SIDEBAR_WIDTH}px)` : '100%',
      }}
    />
  )
})

export default RoadMap
