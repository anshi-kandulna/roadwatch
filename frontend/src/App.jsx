import { useState } from 'react'
import Map from './Map'
import Sidebar from './Sidebar'
import DefectModal from './DefectModal'

export default function App() {
  const [selectedNH, setSelectedNH] = useState(null)
  const [showDefect, setShowDefect] = useState(false)

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Map onNHClick={setSelectedNH} />
      
      {selectedNH && (
        <Sidebar data={selectedNH} onClose={() => setSelectedNH(null)} />
      )}

      {/* floating button bottom right */}
      <button
        onClick={() => setShowDefect(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#e85d04',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          padding: '0.75rem 1.5rem',
          fontSize: '15px',
          fontWeight: 500,
          cursor: 'pointer',
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
      >
        🚨 Report Road Issue
      </button>

      {showDefect && (
        <DefectModal
          nhName={selectedNH?.Name || 'Unknown NH'}
          onClose={() => setShowDefect(false)}
        />
      )}
    </div>
  )
}