const DEFAULT_COLOR = '#7d9a8a'

export function getSegmentColor(projects) {
  if (!projects?.length) return DEFAULT_COLOR

  const progressValues = projects
    .map(p => parseFloat(p.physical_progress_pct))
    .filter(n => !Number.isNaN(n))

  if (!progressValues.length) return DEFAULT_COLOR

  const avg = progressValues.reduce((a, b) => a + b, 0) / progressValues.length

  if (avg >= 80) return '#16a34a'
  if (avg >= 40) return '#ca8a04'
  return '#dc2626'
}

export function getProjectStatus(project) {
  const progress = parseFloat(project.physical_progress_pct)
  const now = new Date()
  const endDate = project.end_date ? new Date(project.end_date) : null

  if (!Number.isNaN(progress) && progress >= 100) return 'Closed'
  if (endDate && endDate < now) return 'Closed'
  if (!Number.isNaN(progress) && progress >= 50) return 'In Progress'
  return 'Open'
}

export function getStatusStyles(status) {
  switch (status) {
    case 'Closed':
      return 'bg-zinc-400/20 text-zinc-300 border border-zinc-400/30'
    case 'In Progress':
      return 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30'
    default:
      return 'bg-green-400/20 text-green-300 border border-green-400/30'
  }
}

export function countOpenIssues(projects) {
  if (!projects?.length) return 0
  return projects.filter(p => getProjectStatus(p) !== 'Closed').length
}

export function getLastUpdated(projects) {
  if (!projects?.length) return null

  const dates = projects
    .flatMap(p => [p.end_date, p.start_date])
    .filter(Boolean)
    .map(d => new Date(d))
    .filter(d => !Number.isNaN(d.getTime()))

  if (!dates.length) return null
  return new Date(Math.max(...dates))
}

export function formatDate(date) {
  if (!date) return '—'
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function searchRoads(features, query) {
  if (!query.trim()) return []

  const q = query.toLowerCase().trim()

  return features
    .filter(feature => {
      const name = feature.properties?.Name?.toLowerCase() || ''
      const projects = feature.properties?.projects || []
      const matchesName = name.includes(q)
      const matchesProject = projects.some(
        p =>
          p.project_name?.toLowerCase().includes(q) ||
          String(p.sanctioned_amt_cr || '').includes(q)
      )
      return matchesName || matchesProject
    })
    .slice(0, 8)
    .map(feature => ({
      name: feature.properties.Name,
      segmentId: feature.properties.Name?.replace(/\s+/g, '-').toUpperCase() || '—',
      projectCount: feature.properties.projects?.length || 0,
      properties: feature.properties,
    }))
}
