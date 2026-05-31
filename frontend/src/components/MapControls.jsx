import { Plus, Minus, Maximize2, Layers, Crosshair } from 'lucide-react'

function ControlButton({ onClick, label, children, active }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-zinc-900 drop-shadow-sm transition-all duration-150 ease-out hover:bg-white/20 hover:scale-105 active:scale-95 ${
        active ? 'bg-white/25 border-white/40' : ''
      }`}
    >
      {children}
    </button>
  )
}

export default function MapControls({ mapRef }) {
  function handleToggleLayer() {
    mapRef.current?.toggleLayer()
  }

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-[9998]">
      <div className="flex flex-col gap-2 p-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl">
        <ControlButton onClick={() => mapRef.current?.zoomIn()} label="Zoom in">
          <Plus size={18} strokeWidth={2} />
        </ControlButton>
        <ControlButton onClick={() => mapRef.current?.zoomOut()} label="Zoom out">
          <Minus size={18} strokeWidth={2} />
        </ControlButton>
        <ControlButton onClick={() => mapRef.current?.fitBounds()} label="Fit to bounds">
          <Maximize2 size={16} strokeWidth={2} />
        </ControlButton>
        <ControlButton onClick={handleToggleLayer} label="Toggle map layer">
          <Layers size={16} strokeWidth={2} />
        </ControlButton>
        <ControlButton onClick={() => mapRef.current?.locateUser()} label="My location">
          <Crosshair size={16} strokeWidth={2} />
        </ControlButton>
      </div>
    </div>
  )
}
