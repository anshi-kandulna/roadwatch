import { useState } from 'react'
import { X, Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import {
  getProjectStatus,
  getStatusStyles,
  countOpenIssues,
  getLastUpdated,
  formatDate,
} from './utils'

export default function Sidebar({ data, onClose, open, onReportDefect }) {
  if (!data) return null

  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  function toggleSearch() {
    setSearchOpen(p => !p)
    setSortOpen(false)
    setFilterOpen(false)
  }
  function toggleSort() {
    setSortOpen(p => !p)
    setSearchOpen(false)
    setFilterOpen(false)
  }
  function toggleFilter() {
    setFilterOpen(p => !p)
    setSearchOpen(false)
    setSortOpen(false)
  }

  const projects = data.projects || []
  const openIssues = countOpenIssues(projects)
  const lastUpdated = getLastUpdated(projects)
  const segmentId = data.Name?.replace(/\s+/g, '-').toUpperCase() || '—'

  const filteredProjects = projects
    .filter(p => {
      if (filter === 'all') return true
      const status = getProjectStatus(p).toLowerCase().replace(' ', '_')
      return status === filter
    })
    .filter(p => {
      if (search.trim() === '') return true
      return p.project_name?.toLowerCase().includes(search.toLowerCase())
    })
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.start_date || 0) - new Date(a.start_date || 0)
      if (sort === 'oldest') return new Date(a.start_date || 0) - new Date(b.start_date || 0)
      if (sort === 'name') return (a.project_name || '').localeCompare(b.project_name || '')
      return 0
    })

  return (
    <aside
      className={`fixed top-0 right-0 h-full w-[350px] z-[999] bg-white/20 backdrop-blur-3xl border-l border-white/20 shadow-[-8px_0_32px_rgba(0,0,0,0.2)] flex flex-col transition-[transform,opacity] duration-200 ease-out ${
        open ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      {/* Header */}
      <div className="border-b border-white/10 shrink-0">
        
        {/* Top row — always visible */}
        <div className="px-5 py-4 flex items-center justify-between">
          <h2 className="text-white font-semibold text-base truncate max-w-[160px]">
            {data.Name}
          </h2>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleSearch}
              className={`p-1.5 rounded-lg border transition-all duration-150 
                ${searchOpen 
                  ? 'border-green-400/60 text-green-300 bg-green-400/10' 
                  : 'border-white/20 text-white/60 hover:border-green-400/40 hover:text-white'
                }`}
            >
              <Search size={13} />
            </button>

            <button
              onClick={toggleSort}
              className={`p-1.5 rounded-lg border transition-all duration-150
                ${sortOpen 
                  ? 'border-green-400/60 text-green-300 bg-green-400/10' 
                  : 'border-white/20 text-white/60 hover:border-green-400/40 hover:text-white'
                }`}
            >
              <ArrowUpDown size={13} />
            </button>

            <button
              onClick={toggleFilter}
              className={`p-1.5 rounded-lg border transition-all duration-150
                ${filterOpen 
                  ? 'border-green-400/60 text-green-300 bg-green-400/10' 
                  : 'border-white/20 text-white/60 hover:border-green-400/40 hover:text-white'
                }`}
            >
              <SlidersHorizontal size={13} />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-white/20 hover:border-green-400/40 text-white/60 hover:text-white transition-all duration-150 ml-1"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Expandable row — drops below, never covers road name */}
        {searchOpen && (
          <div className="px-5 pb-3">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full px-3 py-1.5 rounded-lg text-xs bg-white/10 border border-white/20 text-white placeholder:text-white/40 backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-green-400/40 transition-all duration-200"
            />
          </div>
        )}

        {sortOpen && (
          <div className="px-5 pb-3">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg text-xs bg-white/10 border border-white/20 text-white/80 backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-green-400/40"
            >
              <option value="newest" className="bg-zinc-900">Newest First</option>
              <option value="oldest" className="bg-zinc-900">Oldest First</option>
              <option value="name" className="bg-zinc-900">Name A–Z</option>
            </select>
          </div>
        )}

        {filterOpen && (
          <div className="px-5 pb-3">
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg text-xs bg-white/10 border border-white/20 text-white/80 backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-green-400/40"
            >
              <option value="all" className="bg-zinc-900">All Status</option>
              <option value="open" className="bg-zinc-900">Open</option>
              <option value="in_progress" className="bg-zinc-900">In Progress</option>
              <option value="closed" className="bg-zinc-900">Closed</option>
            </select>
          </div>
        )}

      </div>

      {/* Summary chips */}
      <div className="px-5 py-3 flex items-center gap-2 flex-wrap border-b border-white/10 shrink-0">
        <span className="px-2.5 py-1 rounded-full text-xs bg-white/10 border border-white/20 text-white/70">
          {projects.length} Projects
        </span>
        <span className="px-2.5 py-1 rounded-full text-xs bg-green-400/15 border border-green-400/25 text-green-300">
          {projects.filter(p => getProjectStatus(p).toLowerCase() === 'open').length} Open
        </span>
        <span className="px-2.5 py-1 rounded-full text-xs bg-yellow-400/15 border border-yellow-400/25 text-yellow-300">
          {projects.filter(p => getProjectStatus(p).toLowerCase().includes('progress')).length} In Progress
        </span>
        <span className="px-2.5 py-1 rounded-full text-xs bg-zinc-400/15 border border-zinc-400/25 text-zinc-300">
          {projects.filter(p => getProjectStatus(p).toLowerCase() === 'closed').length} Closed
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 sidebar-scroll">
        {filteredProjects.length === 0 ? (
          <p className="text-sm text-white/60 text-center py-8">
            {projects.length === 0 ? 'No projects on this segment' : 'No projects matching filter'}
          </p>
        ) : (
          <div className="space-y-3">
            {filteredProjects.map((proj, i) => {
              const status = getProjectStatus(proj)
              return (
                <div
                  key={i}
                  className="group p-4 rounded-2xl bg-white/8 hover:bg-white/15 border border-white/15 hover:border-white/25 backdrop-blur-sm transition-all duration-150 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-medium text-white/90 leading-snug">
                      {proj.project_name}
                    </p>
                    <span
                      className={`shrink-0 inline-flex px-2 py-0.5 text-[11px] font-medium rounded-md ${getStatusStyles(status)}`}
                    >
                      {status}
                    </span>
                  </div>

                  <p className="text-xs text-white/50 mb-2">
                    {proj.start_date} → {proj.end_date}
                  </p>

                  {(proj.state || proj.work_type) && (
                    <p className="text-xs text-white/50 leading-relaxed">
                      {[proj.state, proj.work_type].filter(Boolean).join(' · ')}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-white/10">
                    <span className="text-xs text-white/50">
                      ₹{proj.sanctioned_amt_cr} Cr
                    </span>
                    <span className="text-xs text-white/50">
                      {proj.physical_progress_pct}% complete
                    </span>
                  </div>

                  {(proj.piu_city || proj.ro_name) && (
                    <p className="text-xs text-white/50 mt-2">
                      {proj.piu_city && `PIU: ${proj.piu_city}`}
                      {proj.piu_city && proj.ro_name && ' · '}
                      {proj.ro_name && `RO: ${proj.ro_name}`}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="shrink-0 px-5 pb-5 pt-3 border-t border-white/10">
      </div>
    </aside>
  )
}
