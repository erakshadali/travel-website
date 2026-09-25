import { useEffect, useState } from 'react'

// Runs `load()` whenever `deps` change. Keeps the previous data on screen while reloading (no flicker
// when paging) and ignores answers that arrive after the inputs already changed.
export function useFetch(load, deps) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const [reloads, setReloads] = useState(0)

  useEffect(() => {
    let stale = false
    setState((s) => ({ ...s, loading: true, error: null }))
    load().then(
      (data) => !stale && setState({ data, error: null, loading: false }),
      (error) => !stale && setState((s) => ({ data: s.data, error, loading: false })),
    )
    return () => {
      stale = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloads])

  return { ...state, reload: () => setReloads((n) => n + 1) }
}

export function useDebounced(value, ms = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(timer)
  }, [value, ms])
  return debounced
}

// Admin pages must never show up in search results.
export function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow, noarchive'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])
}
