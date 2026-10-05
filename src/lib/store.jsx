import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const KEY = 'netprep364.v1'

const empty = { done: {}, answers: {}, plan: {}, pins: {}, mocks: [] }

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...empty, ...JSON.parse(raw) }
  } catch {
    /* storage unavailable – fine, run in memory */
  }
  return empty
}

const Ctx = createContext(null)

export function ProgressProvider({ children }) {
  const [state, setState] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state])

  const markDone = useCallback((id, v = true) => setState((s) => ({ ...s, done: { ...s.done, [id]: v } })), [])
  const record = useCallback(
    (qid, correct) =>
      setState((s) => {
        const prev = s.answers[qid] || { right: 0, wrong: 0 }
        return {
          ...s,
          answers: {
            ...s.answers,
            [qid]: { right: prev.right + (correct ? 1 : 0), wrong: prev.wrong + (correct ? 0 : 1), last: correct },
          },
        }
      }),
    [],
  )
  const togglePlan = useCallback((id) => setState((s) => ({ ...s, plan: { ...s.plan, [id]: !s.plan[id] } })), [])
  const togglePin = useCallback((id) => setState((s) => ({ ...s, pins: { ...s.pins, [id]: !s.pins[id] } })), [])
  const addMock = useCallback((m) => setState((s) => ({ ...s, mocks: [...s.mocks, m].slice(-20) })), [])
  const reset = useCallback(() => setState(empty), [])

  const value = useMemo(
    () => ({ ...state, markDone, record, togglePlan, togglePin, addMock, reset }),
    [state, markDone, record, togglePlan, togglePin, addMock, reset],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useProgress = () => useContext(Ctx)
