import { useState } from 'react'
import { Menu, X, Settings, Info, ArrowLeft, GitBranch, Map, Activity, Zap } from 'lucide-react'

const VERSION = '1.0.0'

const STATS = [
  { label: 'NH Segments', value: '1,400+', icon: Map },
  { label: 'Active Projects', value: '6,200+', icon: Activity },
  { label: 'States Covered', value: '28', icon: GitBranch },
  { label: 'AI Powered', value: 'VLM + LLM', icon: Zap },
]

export default function MenuDrawer({ open, onClose }) {
  const [view, setView] = useState('main')

  function handleClose() {
    onClose()
    setTimeout(() => setView('main'), 250)
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-[10000] animate-fade-in"
          onClick={handleClose}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white/10 backdrop-blur-2xl border-r border-white/15 z-[10001] shadow-2xl transition-[transform,opacity] duration-200 ease-out ${
          open ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          {view === 'about' ? (
            <button
              onClick={() => setView('main')}
              className="flex items-center gap-2 text-sm font-semibold text-zinc-900 tracking-tight drop-shadow-sm hover:text-zinc-700 transition-colors duration-150"
            >
              <ArrowLeft size={16} strokeWidth={2} />
              About
            </button>
          ) : (
            <span className="text-sm font-semibold text-zinc-900 tracking-tight drop-shadow-sm">Menu</span>
          )}
          <button
            onClick={handleClose}
            className="p-1.5 text-zinc-700/60 hover:text-zinc-900 hover:bg-white/15 rounded-md transition-all duration-150"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Main nav */}
        {view === 'main' && (
          <nav className="p-3">
            <button
              onClick={handleClose}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-800 hover:text-zinc-900 hover:bg-white/15 rounded-lg transition-all duration-150 drop-shadow-sm"
            >
              <Settings size={18} strokeWidth={1.75} className="text-zinc-700/60" />
              Settings
            </button>
            <button
              onClick={() => setView('about')}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-800 hover:text-zinc-900 hover:bg-white/15 rounded-lg transition-all duration-150 drop-shadow-sm"
            >
              <Info size={18} strokeWidth={1.75} className="text-zinc-700/60" />
              About
            </button>
          </nav>
        )}

        {/* About panel */}
        {view === 'about' && (
          <div className="flex flex-col gap-5 px-5 py-5">
            {/* Version badge */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-zinc-900 drop-shadow-sm">RoadWatch</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-green-400/20 border border-green-400/30 text-green-700">
                  v{VERSION}
                </span>
              </div>
              <p className="text-xs text-zinc-700/60 leading-relaxed">
                AI-powered National Highway monitoring platform for India. Built to surface road defects and track project progress across the NH network.
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2">
              {STATS.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm"
                >
                  <Icon size={14} strokeWidth={1.75} className="text-green-600/80" />
                  <span className="text-sm font-bold text-zinc-900 drop-shadow-sm">{value}</span>
                  <span className="text-[10px] text-zinc-700/60 uppercase tracking-wide">{label}</span>
                </div>
              ))}
            </div>

            {/* Data note */}
            <p className="text-[11px] text-zinc-700/50 leading-relaxed border-t border-white/10 pt-4">
              Data sourced from MoRTH project records. Road segments represent active NH corridors with live project tracking.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 px-5 py-4 border-t border-white/10">
          <p className="text-xs text-zinc-700/60 drop-shadow-sm">RoadWatch v{VERSION}</p>
          <p className="text-xs text-zinc-700/40 mt-0.5">National Highway Monitoring</p>
        </div>
      </div>
    </>
  )
}

export function MenuButton({ onClick }) {
  return (
    <div className="relative z-10 pointer-events-auto">
      <button
        onClick={onClick}
        className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-all duration-150 drop-shadow-sm border border-green-400/40 hover:border-green-400/70"
        aria-label="Open menu"
      >
        <Menu size={22} strokeWidth={2.5} className="text-zinc-800" />
      </button>
    </div>
  )
}
