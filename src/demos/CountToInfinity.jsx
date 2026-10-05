import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, StepForward } from 'lucide-react'
import { useTheme } from '../lib/theme'
import { cx } from '../lib/utils'
import { Btn, Controls } from '../components/ui'

const N = ['x', 'y', 'z']
const key = (a, b) => [a, b].sort().join('')

function cost(costs, a, b) {
  return a === b ? 0 : costs[key(a, b)]
}

/** one synchronous DV round, optionally with poisoned reverse */
function round(st, costs, poison) {
  // what each node advertises to each neighbour (based on previous state)
  const adv = {}
  N.forEach((v) => {
    adv[v] = {}
    N.filter((n) => n !== v).forEach((n) => {
      adv[v][n] = {}
      N.forEach((d) => {
        let val = st.dv[v][d]
        if (poison && d !== n && d !== v && st.next[v][d] === n) val = Infinity
        adv[v][n][d] = val
      })
    })
  })
  const dv = {}
  const next = {}
  N.forEach((x) => {
    dv[x] = { [x]: 0 }
    next[x] = {}
    N.filter((d) => d !== x).forEach((d) => {
      let best = Infinity
      let via = st.next[x][d]
      N.filter((v) => v !== x).forEach((v) => {
        const val = cost(costs, x, v) + (v === d ? 0 : adv[v][x][d])
        if (val < best || (val === best && v === st.next[x][d])) {
          best = val
          via = v
        }
      })
      dv[x][d] = best
      next[x][d] = via
    })
  })
  return { dv, next }
}

function converge(costs) {
  let st = {
    dv: Object.fromEntries(N.map((a) => [a, Object.fromEntries(N.map((b) => [b, a === b ? 0 : cost(costs, a, b)]))])),
    next: Object.fromEntries(N.map((a) => [a, Object.fromEntries(N.filter((b) => b !== a).map((b) => [b, b]))])),
  }
  for (let i = 0; i < 100; i++) {
    const n = round(st, costs, false)
    if (JSON.stringify(n) === JSON.stringify(st)) break
    st = n
  }
  return st
}

const BASE = { xy: 4, yz: 1, xz: 50 }
const f = (v) => (v >= 1e6 ? '∞' : v)

export default function CountToInfinity({ startPoison = false }) {
  const t = useTheme()
  const [costs, setCosts] = useState(BASE)
  const [st, setSt] = useState(() => converge(BASE))
  const [poison, setPoison] = useState(startPoison)
  const [rounds, setRounds] = useState(0)
  const [running, setRunning] = useState(false)
  const [changedKey, setChangedKey] = useState(0)
  const prev = useRef(st)
  const timer = useRef(null)

  const upcoming = round(st, costs, poison)
  const stable = JSON.stringify(upcoming) === JSON.stringify(st)

  const stRef = useRef(st)
  stRef.current = st

  const step = () => {
    const s = stRef.current
    const n = round(s, costs, poison)
    if (JSON.stringify(n) === JSON.stringify(s)) {
      setRunning(false)
      return
    }
    prev.current = s
    stRef.current = n
    setSt(n)
    setRounds((r) => r + 1)
    setChangedKey((k) => k + 1)
  }

  useEffect(() => {
    if (!running) return
    timer.current = setInterval(step, 220)
    return () => clearInterval(timer.current)
  }, [running, poison, costs]) // eslint-disable-line react-hooks/exhaustive-deps

  const apply = (xy) => {
    setRunning(false)
    setCosts((c) => ({ ...c, xy }))
    setRounds(0)
    prev.current = st
  }
  const reset = () => {
    setRunning(false)
    setCosts(BASE)
    setSt(converge(BASE))
    setRounds(0)
  }

  const cell = (a, d) => {
    const ch = prev.current && prev.current.dv[a][d] !== st.dv[a][d]
    return (
      <td key={d} className="px-2 py-1">
        <span key={`${st.dv[a][d]}-${changedKey}`} className={cx('inline-block rounded px-1', ch && 'flash', st.dv[a][d] > 40 && d === 'x' && 'text-rose-300')}>
          {f(st.dv[a][d])}
        </span>
        {a !== d && <span className="text-[10px] text-slate-500"> via {st.next[a][d]}</span>}
      </td>
    )
  }

  return (
    <div className="space-y-3">
      <svg viewBox="0 0 420 170" className="w-full rounded-xl bg-[#0a1020]">
        <line x1={70} y1={40} x2={210} y2={40} stroke={t.hex} strokeWidth={3} />
        <line x1={210} y1={40} x2={350} y2={40} stroke="#334155" strokeWidth={3} />
        <path d="M70,40 Q210,170 350,40" fill="none" stroke="#334155" strokeWidth={3} />
        {[
          ['x', 70, 40],
          ['y', 210, 40],
          ['z', 350, 40],
        ].map(([n, cx_, cy_]) => (
          <g key={n}>
            <circle cx={cx_} cy={cy_} r={21} fill="#111a30" stroke="#475569" strokeWidth={2.5} />
            <text x={cx_} y={cy_ + 6} textAnchor="middle" fontSize={17} fontWeight={800} fill="#e2e8f0">
              {n}
            </text>
          </g>
        ))}
        {[
          [140, 28, costs.xy, costs.xy !== 4],
          [280, 28, costs.yz, false],
          [210, 112, costs.xz, false],
        ].map(([lx, ly, v, hot], i) => (
          <g key={i}>
            <circle cx={lx} cy={ly + 4} r={14} fill="#0a1020" />
            <text x={lx} y={ly + 9} textAnchor="middle" fontSize={14} fontWeight={800} fill={hot ? '#fb7185' : '#cbd5e1'}>
              {v}
            </text>
          </g>
        ))}
      </svg>

      <Controls>
        <span className="text-xs font-semibold text-slate-400">Change cost of x–y:</span>
        <Btn size="sm" variant="good" onClick={() => apply(1)}>
          4 → 1 (good news)
        </Btn>
        <Btn size="sm" variant="danger" onClick={() => apply(60)}>
          4 → 60 (bad news)
        </Btn>
        <button onClick={() => setPoison(!poison)} className={cx('ml-auto flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold transition', poison ? 'border-emerald-400 bg-emerald-400/20 text-emerald-200' : 'border-white/15 text-slate-300')}>
          <span className={cx('h-3 w-6 rounded-full p-0.5 transition', poison ? 'bg-emerald-400' : 'bg-white/20')}>
            <span className={cx('block h-2 w-2 rounded-full bg-slate-900 transition', poison && 'translate-x-3')} />
          </span>
          Poisoned reverse
        </button>
      </Controls>

      <Controls>
        <Btn icon={StepForward} size="sm" onClick={step} disabled={stable}>
          One round
        </Btn>
        <Btn icon={running ? Pause : Play} size="sm" variant="soft" onClick={() => setRunning(!running)} disabled={stable}>
          {running ? 'Pause' : 'Run to the end'}
        </Btn>
        <Btn icon={RotateCcw} size="sm" variant="ghost" onClick={reset}>
          Reset
        </Btn>
        <span className="ml-auto font-mono text-sm text-slate-300">
          rounds: <b className="text-white">{rounds}</b>
        </span>
      </Controls>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[420px] border-collapse text-center font-mono text-sm">
          <thead>
            <tr className="bg-white/[0.06] text-xs text-slate-400">
              <th className="px-2 py-2 text-left">node</th>
              {N.map((d) => (
                <th key={d} className="px-2 py-2">
                  cost to {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {N.map((a) => (
              <tr key={a} className="border-t border-white/5">
                <td className="px-2 py-1 text-left font-bold text-white">{a}</td>
                {N.map((d) => cell(a, d))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={cx('rounded-xl border p-3 text-sm', stable && rounds > 0 ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100' : 'border-white/10 bg-white/[0.04] text-slate-300')}>
        {stable && rounds > 0 ? (
          <>
            <b>Stable after {rounds} rounds.</b>{' '}
            {costs.xy === 60 ? (poison ? 'Poisoned reverse stopped the ping-pong loop between y and z.' : 'It had to count all the way up until z’s direct x–z link (50) was cheaper – the “count to infinity” problem.') : 'Good news travels fast: only a couple of rounds.'}
          </>
        ) : rounds === 0 ? (
          <>Start from a converged network (x–y = 4, y–z = 1, x–z = 50). Pick a change, then step through. Watch the cost to <b>x</b> in rows y and z.</>
        ) : (
          <>Rounds so far: {rounds}. {costs.xy === 60 && !poison ? 'y thinks “z can reach x cheaply” and z thinks “y can” – they bounce the cost up by 1 each round.' : ''}</>
        )}
      </div>
    </div>
  )
}
