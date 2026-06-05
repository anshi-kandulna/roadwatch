import { useState, useRef, useCallback } from 'react'
import { AlertTriangle } from 'lucide-react'
import Map from './Map'
import Sidebar from './Sidebar'
import DefectModal from './DefectModal'
import TopBar from './components/TopBar'
import MenuDrawer from './components/MenuDrawer'
import ChatBot from './components/ChatBot'
import SearchBar from './components/SearchBar'
import MapControls from './components/MapControls'

export default function App() {
  const [selectedNH, setSelectedNH] = useState(null)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [features, setFeatures] = useState([])
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const mapRef = useRef(null)

  const handleGeoJSONLoaded = useCallback(feats => {
    setFeatures(feats)
  }, [])

  function handleNHSelect(properties) {
    setSelectedNH(properties)
    setSidebarVisible(true)
  }

  function handleSidebarClose() {
    setSidebarVisible(false)
    setTimeout(() => setSelectedNH(null), 200)
  }

  function handleSearchSelect(properties) {
    setSelectedNH(properties)
    setSidebarVisible(true)
    setTimeout(() => mapRef.current?.flyToSegment(properties.Name), 100)
  }

  const defectRoadName = selectedNH?.Name || 'Unknown — click a road to auto-fill'
  const hasSelectedRoad = Boolean(selectedNH?.Name)

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-zinc-900">
      <Map
        ref={mapRef}
        onNHClick={handleNHSelect}
        selectedNH={selectedNH}
        sidebarOpen={sidebarVisible}
        onGeoJSONLoaded={handleGeoJSONLoaded}
      />

      <TopBar onMenuOpen={() => setMenuOpen(true)} />

      <SearchBar features={features} onSelect={handleSearchSelect} />

      <MapControls mapRef={mapRef} />

      <MenuDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      {selectedNH && (
        <Sidebar
          data={selectedNH}
          open={sidebarVisible}
          onClose={handleSidebarClose}
          onReportDefect={() => setReportModalOpen(true)}
        />
      )}

      <button
        type="button"
        onClick={() => setReportModalOpen(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-800/80 hover:bg-red-700/90 border border-red-500/60 hover:border-red-400/80 text-red-200 hover:text-white text-sm font-medium backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.12)] hover:shadow-[0_0_28px_rgba(239,68,68,0.25)] transition-all duration-200"
      >
        <AlertTriangle size={15} strokeWidth={2} />
        Report Road Issue
      </button>

      {reportModalOpen && (
        <DefectModal
          nhName={defectRoadName}
          hasSelectedRoad={hasSelectedRoad}
          onClose={() => setReportModalOpen(false)}
        />
      )}

      <ChatBot sidebarOpen={sidebarVisible} />
    </div>
  )
}
