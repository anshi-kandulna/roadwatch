import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { searchRoads } from '../utils'

export default function SearchBar({ features, onSelect }) {
  const [expanded, setExpanded] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [expanded])

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        collapse()
      }
    }

    function handleEscape(e) {
      if (e.key === 'Escape') collapse()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function collapse() {
    setQuery('')
    setResults([])
    setExpanded(false)
  }

  function handleQueryChange(value) {
    setQuery(value)
    setResults(searchRoads(features, value))
  }

  function handleSelect(result) {
    onSelect(result.properties)
    collapse()
  }

  return (
    <div
      ref={containerRef}
      className="fixed top-16 left-1/2 -translate-x-1/2 z-[9998] flex flex-col items-center"
    >
      <div
        className={`flex items-center gap-2 bg-white/10 backdrop-blur-md border rounded-full shadow-md transition-all duration-300 ease-in-out overflow-hidden ${
          expanded
            ? 'w-[480px] py-2.5 px-4 border-white/40 ring-2 ring-green-400/30'
            : 'w-[160px] py-2 px-4 border-white/20 cursor-pointer'
        }`}
        onClick={() => !expanded && setExpanded(true)}
      >
        <Search size={15} strokeWidth={2} className="text-zinc-800/70 shrink-0 drop-shadow-sm" />
        {expanded ? (
          <>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
              placeholder="Search roads..."
              className="flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-700/60 outline-none drop-shadow-sm min-w-0"
            />
            <button
              onClick={e => {
                e.stopPropagation()
                collapse()
              }}
              className="p-0.5 text-zinc-700/60 hover:text-zinc-900 transition-colors duration-150"
            >
              <X size={15} strokeWidth={2} />
            </button>
          </>
        ) : (
          <span className="text-sm text-zinc-800/70 truncate drop-shadow-sm">Search roads...</span>
        )}
      </div>

      {expanded && results.length > 0 && (
        <div className="w-[480px] mt-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl shadow-xl overflow-hidden">
          {results.map((result, i) => (
            <button
              key={result.name}
              onClick={() => handleSelect(result)}
              style={{ animationDelay: `${i * 40}ms` }}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/20 transition-all duration-150 border-b border-white/10 last:border-b-0 animate-suggestion-in opacity-0"
            >
              <div>
                <span className="text-sm font-semibold text-zinc-900 drop-shadow-sm">{result.name}</span>
                <span className="block text-xs text-zinc-700/60 font-mono mt-0.5">{result.segmentId}</span>
              </div>
              <span className="text-xs text-zinc-700/50 tabular-nums drop-shadow-sm">
                {result.projectCount} {result.projectCount === 1 ? 'project' : 'projects'}
              </span>
            </button>
          ))}
        </div>
      )}

      {expanded && query && results.length === 0 && (
        <div className="w-[480px] mt-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl shadow-xl px-4 py-3 animate-suggestion-in">
          <p className="text-sm text-zinc-700/60 drop-shadow-sm">No results for "{query}"</p>
        </div>
      )}
    </div>
  )
}
