import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, RotateCcw, Undo2 } from 'lucide-react'
import { useTheme } from '../lib/theme'
import { cx } from '../lib/utils'
import { Btn, Controls } from '../components/ui'

// Problem sheet, question 3
const NODES = ['u', 'v', 'w', 'x', 'y']
const POS = { u: [60, 60], v: [220, 60], w: [390, 60], x: [300, 175], y: [470, 175] }
const EDGES = [
  ['u', 'v', 4],
  ['v', 'w', 9],
  ['v', 'x', 7],
  ['w', 'x', 2],
  ['x', 'y', 7],
]
const c = (a, b) => {
  if (a === b) return 0
  const e = EDGES.find((e) => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a))
  return e ? e[2] : Infinity
}
const nbrs = (a) => NODES.filter((n) => n !== a && c(a, n) < Infinity)

function t0() {
  const m = {}
  NODES.forEach((a) => {
    m[a] = {}
    NODES.forEach((b) => (m[a][b] = c(a, b)))
  })
  return m
}

function nextRound(prev) {
  const m = {}
  NODES.forEach((x) => {
    m[x] = {}
    NODES.forEach((y) => {
      if (x === y) return (m[x][y] = 0)
      m[x][y] = Math.min(...nbrs(x).map((v) => c(x, v) + prev[v][y]))
    })
  })
  return m
}

const f = (v) => (v === Infinity ? '∞' : v)

export default function DVTables() {
  const t = useTheme()
  const [hist, setHist] = useState([t0()])
  const [sel, setSel] = useState({ x: 'u', y: 'w' })
  const k = hist.length - 1
  const cur = hist[k]
  const prev = k > 0 ? hist[k - 1] : null
  const upcoming = useMemo(() => nextRound(cur), [cur])
  const converged = JSON.stringify(upcoming) === JSON.stringify(cur)

  const terms = sel && prev ? nbrs(sel.x).map((v) => ({ v, cxv: c(sel.x, v), dv: prev[v][sel.y], sum: c(sel.x, v) + prev[v][sel.y] })) : []
  const best = terms.length ? Math.min(...terms.map((x) => x.sum)) : null

  return (
    <div className="space-y-3">
      <svg viewBox="0 0 540 230" className="w-full rounded-xl bg-[#0a1020]">
        {EDGES.map(([a, b, w]) => {
          const [x1, y1] = POS[a]
          const [x2, y2] = POS[b]
          const hot = sel && (sel.x === a || sel.x === b)
          return (
            <g key={a + b}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={hot ? t.hex : '#334155'} strokeWidth={hot ? 3 : 2} />
              <circle cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} r={11} fill="#0a1020" />
              <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill="#cbd5e1">
                {w}
              </text>
            </g>
          )
        })}
        {NODES.map((n) => (
          <g key={n} onClick={() => setSel({ x: n, y: sel?.y === n ? 'u' : sel?.y || 'u' })} style={{ cursor: 'pointer' }}>
            <circle cx={POS[n][0]} cy={POS[n][1]} r={21} fill={sel?.x === n ? t.hex : '#111a30'} stroke={sel?.x === n ? t.hex : '#475569'} strokeWidth={2.5} />
            <text x={POS[n][0]} y={POS[n][1] + 6} textAnchor="middle" fontSize={17} fontWeight={800} fill={sel?.x === n ? '#04101f' : '#e2e8f0'}>
              {n}
            </text>
          </g>
        ))}
      </svg>

      <Controls>
        <Btn icon={ChevronRight} disabled={converged} onClick={() => setHist([...hist, upcoming])}>
          {k === 0 ? 'First exchange (t1)' : `Exchange again (t${k + 1})`}
        </Btn>
        <Btn variant="ghost" size="sm" icon={Undo2} disabled={k === 0} onClick={() => setHist(hist.slice(0, -1))}>
          Undo
        </Btn>
        <Btn variant="ghost" size="sm" icon={RotateCcw} onClick={() => setHist([t0()])}>
          Reset
        </Btn>
        <span className="ml-auto font-mono text-xs text-slate-400">time t{k}</span>
      </Controls>

      <div className={cx('rounded-xl border px-3 py-2 text-sm', converged ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100' : 'border-white/10 bg-white/[0.04] text-slate-300')}>
        {converged ? <><b>Converged.</b> A new exchange would change nothing – “no more DV changes to process”. That’s when DV stops.</> : k === 0 ? 't0: every node only knows its direct links. Everything else is ∞.' : 'Each node sent its vector to its neighbours, then recomputed with Bellman-Ford. Yellow = changed.'}
      </div>

      {/* all distance vectors */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[360px] border-collapse text-center font-mono text-sm">
          <thead>
            <tr className="bg-white/[0.06] text-xs text-slate-400">
              <th className="px-2 py-2 text-left">node ↓ to →</th>
              {NODES.map((n) => (
                <th key={n} className="px-2 py-2">
                  {n}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NODES.map((x) => (
              <tr key={x} className="border-t border-white/5">
                <td className="px-2 py-1.5 text-left font-bold text-slate-100">{x}</td>
                {NODES.map((y) => {
                  const changed = prev && prev[x][y] !== cur[x][y]
                  const isSel = sel && sel.x === x && sel.y === y
                  return (
                    <td key={y} className="p-0.5">
                      <button
                        onClick={() => setSel({ x, y })}
                        className={cx('w-full rounded-md px-2 py-1 transition', isSel ? 'bg-white/25 text-white ring-1 ring-white/60' : 'hover:bg-white/10', cur[x][y] === Infinity ? 'text-slate-600' : changed ? 'text-amber-300' : 'text-slate-200')}
                      >
                        <span key={cur[x][y]} className={cx('inline-block rounded px-1', changed && 'flash')}>
                          {f(cur[x][y])}
                        </span>
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* click-a-cell explainer */}
      <AnimatePresence mode="wait">
        <motion.div key={`${sel?.x}${sel?.y}${k}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-200">
          {sel && (
            <>
              <div className="mb-1 text-xs text-slate-400">Tap any cell to see its Bellman-Ford calculation.</div>
              <div className="font-mono text-[13px]">
                D<sub>{sel.x}</sub>({sel.y}) {k === 0 ? `= c(${sel.x},${sel.y}) = ${f(cur[sel.x][sel.y])}  (t0: direct link only)` : sel.x === sel.y ? '= 0' : `= min over neighbours v of ${sel.x}:`}
              </div>
              {k > 0 && sel.x !== sel.y && (
                <div className="mt-1 space-y-0.5 font-mono text-xs">
                  {terms.map((tm) => (
                    <div key={tm.v} className={tm.sum === best ? 'text-amber-300' : 'text-slate-400'}>
                      v={tm.v}: c({sel.x},{tm.v}) + D<sub>{tm.v}</sub>({sel.y}) = {tm.cxv} + {f(tm.dv)} = {f(tm.sum)}
                      {tm.sum === best ? '  ← minimum' : ''}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
