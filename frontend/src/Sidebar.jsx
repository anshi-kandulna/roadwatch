import { X, AlertTriangle } from 'lucide-react'
import {
  getProjectStatus,
  getStatusStyles,
  countOpenIssues,
  getLastUpdated,
  formatDate,
} from './utils'

export default function Sidebar({ data, onClose, open, onReportDefect }) {
  if (!data) return null

  const projects = data.projects || []
  const openIssues = countOpenIssues(projects)
  const lastUpdated = getLastUpdated(projects)
  const segmentId = data.Name?.replace(/\s+/g, '-').toUpperCase() || '—'

  return (
    <aside
      className={`fixed top-0 right-0 h-full w-[350px] bg-white/10 backdrop-blur-2xl border-l border-white/15 z-[9999] flex flex-col shadow-2xl transition-[transform,opacity] duration-200 ease-out ${
        open ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="shrink-0 px-5 pt-5 pb-4 border-b border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-white tracking-tight truncate">
              {data.Name}
            </h2>
            <p className="text-xs text-white/60 mt-0.5 font-mono">{segmentId}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-150"
            aria-label="Close panel"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-white/80 bg-white/10 border border-white/20 rounded-full">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-white/80 bg-white/10 border border-white/20 rounded-full">
            {openIssues} open
          </span>
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-white/80 bg-white/10 border border-white/20 rounded-full">
            Updated {formatDate(lastUpdated)}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 sidebar-scroll">
        {projects.length === 0 ? (
          <p className="text-sm text-white/60 text-center py-8">No projects on this segment</p>
        ) : (
          <div className="space-y-3">
            {projects.map((proj, i) => {
              const status = getProjectStatus(proj)
              return (
                <div
                  key={i}
                  className="group p-4 bg-white/8 border border-white/15 rounded-2xl transition-all duration-150 ease-out hover:bg-white/15"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-medium text-white leading-snug">
                      {proj.project_name}
                    </p>
                    <span
                      className={`shrink-0 inline-flex px-2 py-0.5 text-[11px] font-medium rounded-md ${getStatusStyles(status)}`}
                    >
                      {status}
                    </span>
                  </div>

                  <p className="text-sm text-white/60 mb-2">
                    {proj.start_date} → {proj.end_date}
                  </p>

                  {(proj.state || proj.work_type) && (
                    <p className="text-sm text-white/60 leading-relaxed">
                      {[proj.state, proj.work_type].filter(Boolean).join(' · ')}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-white/10">
                    <span className="text-xs text-white/60">
                      ₹{proj.sanctioned_amt_cr} Cr
                    </span>
                    <span className="text-xs text-white/60">
                      {proj.physical_progress_pct}% complete
                    </span>
                  </div>

                  {(proj.piu_city || proj.ro_name) && (
                    <p className="text-xs text-white/60 mt-2">
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
        <button
          type="button"
          onClick={onReportDefect}
          className="w-full mt-4 py-2.5 px-4 rounded-xl font-medium text-sm bg-green-400/30 hover:bg-green-400/50 border border-green-400/50 hover:border-green-400/80 text-green-200 hover:text-white backdrop-blur-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(74,222,128,0.15)] hover:shadow-[0_0_20px_rgba(74,222,128,0.3)]"
        >
          <AlertTriangle size={15} strokeWidth={2} />
          Report Road Issue
        </button>
      </div>
    </aside>
  )
}
