import { Plus, Minus, Maximize2, Layers, Crosshair } from 'lucide-react'

function ControlButton({ onClick, label, children, active }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 backdrop-blur-md border border-green-400/40 hover:border-green-400/70 shadow-lg text-zinc-900 drop-shadow-sm transition-all duration-150 ease-out hover:bg-white/20 hover:scale-105 active:scale-95 ${
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
    <div className="
      fixed z-[9998]
      sm:left-4 sm:top-1/2 sm:-translate-y-1/2
      bottom-24 left-4 sm:bottom-auto
    ">
      <div className="
        flex flex-col gap-1.5 sm:gap-2
        p-1.5 sm:p-2
        bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl
      ">

        {/* Desktop only — zoom */}
        <div className="hidden sm:flex flex-col gap-2">
          <ControlButton onClick={() => mapRef.current?.zoomIn()} label="Zoom in">
            <Plus size={18} strokeWidth={2} />
          </ControlButton>
          <ControlButton onClick={() => mapRef.current?.zoomOut()} label="Zoom out">
            <Minus size={18} strokeWidth={2} />
          </ControlButton>
        </div>

        {/* Always visible */}
        <ControlButton onClick={() => mapRef.current?.fitBounds()} label="Fit to bounds">
          <Maximize2 size={14} strokeWidth={2} />
        </ControlButton>
        <ControlButton onClick={handleToggleLayer} label="Toggle map layer">
          <Layers size={14} strokeWidth={2} />
        </ControlButton>
        <ControlButton onClick={() => mapRef.current?.locateUser()} label="My location">
          <Crosshair size={14} strokeWidth={2} />
        </ControlButton>

      </div>
    </div>
  )
}

