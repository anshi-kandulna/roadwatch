import { MenuButton } from './MenuDrawer'

export default function TopBar({ onMenuOpen }) {
  return (
    <header className="header-gradient fixed top-0 left-0 right-0 z-[999] px-6 py-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-green-500/80 backdrop-blur-md border border-green-400/30 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 10L7 3L12 10H2Z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path d="M4 10H10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="relative z-10 text-2xl font-bold text-zinc-700">RoadWatch</span>
        </div>

        <MenuButton onClick={onMenuOpen} />
      </div>
    </header>
  )
}
