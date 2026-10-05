import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, RotateCcw, Undo2 } from 'lucide-react'
import { useTheme } from '../lib/theme'
import { cx } from '../lib/utils'
import { Btn, Controls } from '../components/ui'

const GRAPHS = {
  sheet: {
    name: 'Problem-sheet graph',
    src: 'u',
    order: ['v', 'w', 'x', 'y', 'z'],
    nodes: { u: [60, 190], v: [220, 80], w: [420, 80], x: [220, 300], y: [420, 300], z: [570, 190] },
    edges: [
      ['u', 'v', 1],
      ['u', 'x', 3],
      ['u', 'w', 8, [240, -50]],
      ['v', 'w', 6],
      ['v', 'x', 1],
      ['w', 'x', 7],
      ['w', 'y', 8],
      ['w', 'z', 1],
      ['x', 'y', 8],
      ['y', 'z', 1],
    ],
  },
  lecture: {
    name: 'Lecture slide 26 graph',
    src: 'u',
    order: ['v', 'w', 'x', 'y', 'z'],
    nodes: { u: [60, 190], x: [250, 60], w: [250, 190], v: [250, 320], y: [430, 190], z: [575, 190] },
    edges: [
      ['u', 'x', 5],
      ['u', 'w', 3],
      ['u', 'v', 7],
      ['x', 'w', 4],
      ['x', 'y', 7],
      ['x', 'z', 9, [420, 20]],
      ['w', 'v', 3],
      ['w', 'y', 8],
      ['v', 'y', 4],
      ['y', 'z', 2],
    ],
  },
}

const cost = (g, a, b) => {
  const e = g.edges.find((e) => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a))
  return e ? e[2] : Infinity
}
const nbrs = (g, a) => g.edges.filter((e) => e[0] === a || e[1] === a).map((e) => (e[0] === a ? e[1] : e[0]))

function init(g) {
  const D = {}
  const p = {}
  Object.keys(g.nodes).forEach((n) => {
    D[n] = n === g.src ? 0 : cost(g, g.src, n)
    p[n] = n !== g.src && D[n] < Infinity ? g.src : null
  })
  return { settled: [g.src], D, p, chosen: null, log: [], changed: [] }
}

function settle(g, st, w) {
  const D = { ...st.D }
  const p = { ...st.p }
  const settled = [...st.settled, w]
  const log = []
  const changed = []
  nbrs(g, w)
    .filter((v) => !settled.includes(v))
    .forEach((v) => {
      const c = cost(g, w, v)
      const alt = D[w] + c
      const improved = alt < D[v]
      log.push({ v, w, old: D[v], c, dw: D[w], alt, improved })
      if (improved) {
        D[v] = alt
        p[v] = w
        changed.push(v)
      }
    })
  return { settled, D, p, chosen: w, log, changed }
}

function nextMin(g, st) {
  const cand = Object.keys(g.nodes).filter((n) => !st.settled.includes(n) && st.D[n] < Infinity)
  if (!cand.length) return null
  const min = Math.min(...cand.map((n) => st.D[n]))
  return g.order.find((n) => cand.includes(n) && st.D[n] === min) || null
}

const inf = (v) => (v === Infinity ? '∞' : v)

function firstHop(g, st, n) {
  let cur = n
  while (st.p[cur] && st.p[cur] !== g.src) cur = st.p[cur]
  return cur
}

export default function DijkstraDemo({ startMode = 'watch', startGraph = 'sheet' }) {
  const t = useTheme()
  const [gk, setGk] = useState(startGraph)
  const g = GRAPHS[gk]
  const [hist, setHist] = useState(() => [init(GRAPHS[startGraph])])
  const [mode, setMode] = useState(startMode)
  const [msg, setMsg] = useState(null)
  const [shakeN, setShakeN] = useState(null)

  const st = hist[hist.length - 1]
  const total = Object.keys(g.nodes).length
  const finished = st.settled.length === total
  const others = g.order

  const reset = (key = gk) => {
    setHist([init(GRAPHS[key])])
    setMsg(null)
  }
  const switchGraph = (k) => {
    setGk(k)
    reset(k)
  }
  const doStep = (w) => setHist((h) => [...h, settle(g, h[h.length - 1], w)])
  const onNext = () => {
    const w = nextMin(g, st)
    if (w) doStep(w)
  }
  const onNode = (n) => {
    if (mode !== 'try' || finished || n === g.src) return
    if (st.settled.includes(n)) return
    const cand = nextMin(g, st)
    const minD = st.D[cand]
    if (st.D[n] === minD) {
      setMsg({ ok: true, text: `Yes! ${n} has the smallest D (${minD}) among nodes not in N'.` })
      doStep(n)
    } else {
      setShakeN(n)
      setTimeout(() => setShakeN(null), 450)
      setMsg({
        ok: false,
        text:
          st.D[n] === Infinity
            ? `${n} is still ∞ – nothing reaches it yet. Pick the smallest finite D.`
            : `${n} has D=${st.D[n]}, but something smaller (D=${minD}) is still outside N'. Always take the minimum.`,
      })
    }
  }

  const geom = (e) => {
    const [a, b, , ctrl] = e
    const [x1, y1] = g.nodes[a]
    const [x2, y2] = g.nodes[b]
    if (ctrl) {
      const [cx_, cy_] = ctrl
      return { d: `M${x1},${y1} Q${cx_},${cy_} ${x2},${y2}`, lx: 0.25 * x1 + 0.5 * cx_ + 0.25 * x2, ly: 0.25 * y1 + 0.5 * cy_ + 0.25 * y2 }
    }
    return { d: `M${x1},${y1} L${x2},${y2}`, lx: (x1 + x2) / 2, ly: (y1 + y2) / 2 }
  }
  const treeEdges = st.settled.filter((n) => n !== g.src).map((n) => [st.p[n], n])
  const isTree = (e) => treeEdges.some(([a, b]) => (a === e[0] && b === e[1]) || (a === e[1] && b === e[0]))

  return (
    <div className="space-y-3">
      <Controls>
        {Object.entries(GRAPHS).map(([k, v]) => (
          <button key={k} onClick={() => switchGraph(k)} className={cx('rounded-lg px-3 py-1 text-xs font-semibold', gk === k ? cx(t.bgMid, t.textSoft) : 'bg-white/5 text-slate-400 hover:bg-white/10')}>
            {v.name}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-white/15" />
        {[
          ['watch', 'Watch'],
          ['try', 'You try'],
        ].map(([k, l]) => (
          <button
            key={k}
            onClick={() => {
              setMode(k)
              setMsg(null)
            }}
            className={cx('rounded-lg px-3 py-1 text-xs font-semibold', mode === k ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10')}
          >
            {l}
          </button>
        ))}
      </Controls>

      <svg viewBox="0 0 640 360" className="w-full rounded-xl bg-[#0a1020]">
        {g.edges.map((e, i) => {
          const gm = geom(e)
          const tree = isTree(e)
          return (
            <g key={i}>
              <path d={gm.d} fill="none" stroke="#334155" strokeWidth={2} />
              {tree && <motion.path d={gm.d} fill="none" stroke={t.hex} strokeWidth={4} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} />}
              <circle cx={gm.lx} cy={gm.ly} r={11} fill="#0a1020" />
              <text x={gm.lx} y={gm.ly + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill={tree ? t.hex : '#94a3b8'}>
                {e[2]}
              </text>
            </g>
          )
        })}
        {Object.entries(g.nodes).map(([n, [x, y]]) => {
          const settled = st.settled.includes(n)
          const isSrc = n === g.src
          const canPick = mode === 'try' && !finished && !settled
          return (
            <g key={n} onClick={() => onNode(n)} style={{ cursor: canPick ? 'pointer' : 'default' }} className={shakeN === n ? 'shake' : ''}>
              {canPick && st.D[n] < Infinity && <circle cx={x} cy={y} r={27} fill="none" stroke={t.hex} strokeOpacity={0.35} strokeDasharray="4 4" />}
              <motion.circle cx={x} cy={y} r={21} animate={{ fill: settled ? t.hex : '#111a30', stroke: settled ? t.hex : '#475569' }} strokeWidth={2.5} />
              <text x={x} y={y + 6} textAnchor="middle" fontSize={17} fontWeight={800} fill={settled ? '#04101f' : '#e2e8f0'}>
                {n}
              </text>
              <text x={x} y={y + 40} textAnchor="middle" fontSize={12} fontWeight={700} fontFamily="monospace" fill={settled ? t.hex : st.D[n] < Infinity ? '#fbbf24' : '#64748b'}>
                {isSrc ? 'src' : `D=${inf(st.D[n])}`}
              </text>
            </g>
          )
        })}
      </svg>

      <Controls>
        {mode === 'watch' ? (
          <Btn icon={ChevronRight} onClick={onNext} disabled={finished}>
            Next step
          </Btn>
        ) : (
          <span className="text-sm text-amber-200">{finished ? 'Done!' : 'Click the node that joins N′ next ↑'}</span>
        )}
        <Btn variant="ghost" size="sm" icon={Undo2} disabled={hist.length === 1} onClick={() => { setHist((h) => h.slice(0, -1)); setMsg(null) }}>
          Undo
        </Btn>
        <Btn variant="ghost" size="sm" icon={RotateCcw} onClick={() => reset()}>
          Reset
        </Btn>
        <span className="ml-auto font-mono text-xs text-slate-400">N′ = {'{' + st.settled.join(', ') + '}'}</span>
      </Controls>

      {/* explanation of the latest step */}
      <AnimatePresence mode="wait">
        <motion.div key={hist.length + (msg ? msg.text : '')} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cx('rounded-xl border p-3 text-sm', msg ? (msg.ok ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100' : 'border-rose-400/40 bg-rose-400/10 text-rose-100') : 'border-white/10 bg-white/[0.04] text-slate-200')}>
          {msg ? (
            msg.text
          ) : hist.length === 1 ? (
            <>
              <b>Step 0 – initialise.</b> N′={'{'}u{'}'}. D(v)=c(u,v) for neighbours of u, ∞ for everyone else.
            </>
          ) : (
            <div className="space-y-1">
              <div>
                <b>
                  Add {st.chosen} to N′
                </b>{' '}
                (smallest D among nodes outside N′ = {st.D[st.chosen]}). Then update its neighbours not in N′:
              </div>
              {st.log.length === 0 && <div className="text-slate-400">…no neighbours left to update.</div>}
              {st.log.map((l) => (
                <div key={l.v} className="font-mono text-xs">
                  D({l.v}) = min({inf(l.old)}, {l.dw}+{l.c}) = min({inf(l.old)}, {l.alt}) = <b className={l.improved ? 'text-amber-300' : 'text-slate-400'}>{inf(Math.min(l.old, l.alt))}</b>
                  {l.improved ? <span className="text-amber-300">  ← improved, p({l.v})={l.w}</span> : null}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* table exactly like the slides */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[420px] border-collapse text-center font-mono text-sm">
          <thead>
            <tr className="bg-white/[0.06] text-xs text-slate-400">
              <th className="px-2 py-2">Step</th>
              <th className="px-2 py-2 text-left">N′</th>
              {others.map((o) => (
                <th key={o} className="px-2 py-2">
                  D({o}),p({o})
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hist.map((h, k) => (
              <tr key={k} className="border-t border-white/5">
                <td className="px-2 py-1.5 text-slate-500">{k}</td>
                <td className="px-2 py-1.5 text-left text-slate-100">{h.settled.join('')}</td>
                {others.map((o) => {
                  const done = h.settled.includes(o)
                  const ch = k === hist.length - 1 && h.changed.includes(o)
                  return (
                    <td key={o} className={cx('px-2 py-1.5', done ? 'text-slate-700' : h.D[o] === Infinity ? 'text-slate-500' : 'text-amber-200')}>
                      {done ? '' : h.D[o] === Infinity ? '∞' : <span key={h.D[o]} className={cx('inline-block rounded px-1', ch && 'flash')}>{h.D[o]},{h.p[o]}</span>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {finished && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-100">
          <div className="mb-1 font-bold">Result → forwarding table in u</div>
          <div className="flex flex-wrap gap-2 font-mono text-xs">
            {others.map((o) => (
              <span key={o} className="rounded-lg bg-black/30 px-2 py-1">
                {o} → (u,{firstHop(g, st, o)}) <span className="text-slate-400">cost {st.D[o]}</span>
              </span>
            ))}
          </div>
          <div className="mt-2 text-xs text-emerald-200/80">Trace predecessors p(·) backwards to build the shortest-path tree (thick lines).</div>
        </motion.div>
      )}
    </div>
  )
}
