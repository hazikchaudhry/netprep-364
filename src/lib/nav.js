import { useCallback, useSyncExternalStore } from 'react'

const subscribe = (cb) => {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}
const snapshot = () => window.location.hash.replace(/^#/, '') || '/'

export function useRoute() {
  const path = useSyncExternalStore(subscribe, snapshot, () => '/')
  const go = useCallback((p) => {
    window.location.hash = p
    window.scrollTo({ top: 0 })
  }, [])
  return [path, go]
}
