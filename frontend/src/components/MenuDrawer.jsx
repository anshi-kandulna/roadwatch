import { Menu, X, LayoutDashboard, FileText, Settings, Info } from 'lucide-react'

const MENU_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Reports', icon: FileText },
  { label: 'Settings', icon: Settings },
  { label: 'About', icon: Info },
]

export default function MenuDrawer({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-[10000] animate-fade-in"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white/10 backdrop-blur-2xl border-r border-white/15 z-[10001] shadow-2xl transition-[transform,opacity] duration-200 ease-out ${
          open ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <span className="text-sm font-semibold text-zinc-900 tracking-tight drop-shadow-sm">Menu</span>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-700/60 hover:text-zinc-900 hover:bg-white/15 rounded-md transition-all duration-150"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <nav className="p-3">
          {MENU_ITEMS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={onClose}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-800 hover:text-zinc-900 hover:bg-white/15 rounded-lg transition-all duration-150 drop-shadow-sm"
            >
              <Icon size={18} strokeWidth={1.75} className="text-zinc-700/60" />
              {label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 px-5 py-4 border-t border-white/10">
          <p className="text-xs text-zinc-700/60 drop-shadow-sm">RoadWatch v1.0</p>
          <p className="text-xs text-zinc-700/40 mt-0.5">National Highway Monitoring</p>
        </div>
      </div>
    </>
  )
}

export function MenuButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-all duration-150 drop-shadow-sm"
      aria-label="Open menu"
    >
      <Menu size={20} strokeWidth={2} />
    </button>
  )
}
