import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { useTheme } from '../lib/theme'
import { cx } from '../lib/utils'
import { Btn, Controls } from '../components/ui'

/* ---------------- shared AS figure (matches your slides 71 / 74 / 79) ---------------- */

const R = {
  '1a': [55, 130], '1b': [130, 62], '1c': [205, 130], '1d': [130, 198],
  '2a': [250, 245], '2b': [330, 195], '2c': [410, 245], '2d': [330, 300],
  '3a': [470, 130], '3b': [545, 62], '3c': [618, 130], '3d': [545, 198], X: [640, 262],
}
const GATEWAYS = ['1c', '2a', '2c', '3a']
const INTRA = [
  ['1a', '1b'], ['1b', '1c'], ['1a', '1d'], ['1d', '1c'],
  ['2a', '2b'], ['2b', '2c'], ['2a', '2d'], ['2d', '2c'], ['2b', '2d'],
  ['3a', '3b'], ['3b', '3c'], ['3a', '3d'], ['3d', '3c'], ['3d', 'X'],
]
const MESH = [['1a', '1c'], ['1b', '1d'], ['2a', '2c'], ['3a', '3c'], ['3b', '3d']]
const EBGP = [['1c', '2a'], ['2c', '3a']]
const BLOBS = [
  { id: 'AS1', cx: 130, cy: 130, rx: 115, ry: 100, lx: 40, ly: 38 },
  { id: 'AS2', cx: 330, cy: 245, rx: 120, ry: 88, lx: 245, ly: 175 },
  { id: 'AS3', cx: 550, cy: 135, rx: 125, ry: 105, lx: 480, ly: 38 },
]
const same = (k, a, b) => k === `${a}-${b}` || k === `${b}-${a}`

export function AsFigure({ mode = 'plain', active = [], badges = {}, focus = [], tag }) {
  const t = useTheme()
  const links = [
    ...INTRA.map(([a, b]) => ({ a, b, kind: 'intra' })),
    ...MESH.map(([a, b]) => ({ a, b, kind: 'mesh' })),
    ...EBGP.map(([a, b]) => ({ a, b, kind: 'ebgp' })),
  ]
  const style = (l) => {
    if (active.some((k) => same(k, l.a, l.b))) return { stroke: '#fbbf24', w: 4, dash: '8 6', flow: true, o: 1 }
    if (l.kind === 'mesh') return mode === 'ibgp' ? { stroke: '#60a5fa', w: 2, dash: '4 4', o: 0.9 } : { o: 0 }
    if (l.kind === 'intra') {
      if (mode === 'intra') return { stroke: t.hex, w: 3, o: 1 }
      if (mode === 'ibgp') return { stroke: '#60a5fa', w: 2, dash: '4 4', o: 0.9 }
      return { stroke: '#475569', w: 2, o: mode === 'inter' ? 0.35 : 0.9 }
    }
    if (mode === 'inter') return { stroke: '#fb7185', w: 4, dash: '8 6', o: 1 }
    return { stroke: '#475569', w: 2, dash: '8 6', o: mode === 'plain' ? 0.9 : 0.4 }
  }
  return (
    <svg viewBox="0 0 690 340" className="w-full rounded-xl bg-[#0a1020]">
      {BLOBS.map((b) => (
        <g key={b.id}>
          <ellipse cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry} fill="rgba(56,189,248,0.10)" stroke="rgba(56,189,248,0.35)" strokeWidth={1.5} />
          <text x={b.lx} y={b.ly} fontSize={15} fontWeight={800} fill="#7dd3fc">
            {b.id}
          </text>
        </g>
      ))}
      {links.map((l, i) => {
        const s = style(l)
        if (!s.o) return null
        const [x1, y1] = R[l.a]
        const [x2, y2] = R[l.b]
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={s.stroke} strokeWidth={s.w} strokeDasharray={s.dash} strokeOpacity={s.o} className={s.flow ? 'flow-dash' : ''} />
      })}
      {Object.entries(R).map(([n, [x, y]]) => {
        const gw = GATEWAYS.includes(n)
        const isX = n === 'X'
        const f = focus.includes(n)
        return (
          <g key={n}>
            {gw && <circle cx={x} cy={y} r={22} fill="none" stroke="#f472b6" strokeWidth={2} strokeDasharray="3 3" />}
            {f && <circle cx={x} cy={y} r={22} fill="none" stroke="#fbbf24" strokeWidth={3} />}
            <circle cx={x} cy={y} r={15} fill={isX ? '#7c3aed' : '#111a30'} stroke={isX ? '#c4b5fd' : '#64748b'} strokeWidth={2} />
            <text x={x} y={y + 4.5} textAnchor="middle" fontSize={12} fontWeight={800} fill="#e2e8f0">
              {n}
            </text>
          </g>
        )
      })}
      {Object.entries(badges).map(([n, text]) => {
        const [x, y] = R[n]
        const w = text.length * 6.4 + 14
        return (
          <motion.g key={n + text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <rect x={x - w / 2} y={y - 44} width={w} height={20} rx={6} fill="#78350f" stroke="#fbbf24" />
            <text x={x} y={y - 30} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fde68a" fontFamily="monospace">
              {text}
            </text>
          </motion.g>
        )
      })}
      {tag && (
        <text x={14} y={328} fontSize={11} fill="#94a3b8">
          {tag}
        </text>
      )}
    </svg>
  )
}

/* ---------------- 1. which link is which ---------------- */

const MODES = [
  { id: 'intra', label: 'Intra-AS (OSPF)', text: 'Routers inside ONE AS run the same intra-AS protocol (e.g. OSPF). It fills in forwarding-table entries for destinations inside the AS.' },
  { id: 'inter', label: 'eBGP', text: 'External BGP runs between gateway routers of neighbouring ASes (1c↔2a, 2c↔3a). Over a TCP connection. It learns which prefixes the neighbour AS can reach.' },
  { id: 'ibgp', label: 'iBGP', text: 'Internal BGP spreads what a gateway learned via eBGP to all other routers inside its own AS. Gateways run BOTH eBGP and iBGP.' },
]

export function AsMap({ start = 'intra' }) {
  const t = useTheme()
  const [m, setM] = useState(start)
  const cur = MODES.find((x) => x.id === m)
  return (
    <div className="space-y-3">
      <Controls>
        {MODES.map((x) => (
          <button key={x.id} onClick={() => setM(x.id)} className={cx('rounded-lg px-3 py-1.5 text-xs font-bold', m === x.id ? cx(t.bgMid, t.textSoft) : 'bg-white/5 text-slate-400 hover:bg-white/10')}>
            {x.label}
          </button>
        ))}
      </Controls>
      <AsFigure mode={m} tag="pink dashed ring = gateway router (runs eBGP + iBGP)" />
      <AnimatePresence mode="wait">
        <motion.div key={m} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-200">
          {cur.text}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ---------------- 2. path advertisement ---------------- */

const ADV = [
  { active: [], badges: {}, focus: ['X'], text: 'Prefix X lives in AS3. Inside AS3, router 3a learns about X (intra-AS routing).' },
  { active: ['2c-3a'], badges: { '2c': 'AS3, X' }, focus: ['3a', '2c'], text: 'eBGP: 3a advertises “AS3, X” to 2c. AS3 is promising AS2: “send me datagrams for X and I’ll forward them”.' },
  { active: ['2a-2c', '2b-2c', '2c-2d', '2a-2d'], badges: { '2c': 'AS3, X', '2a': 'AS3, X', '2b': 'AS3, X', '2d': 'AS3, X' }, focus: ['2c'], text: 'Import policy accepts it. iBGP: 2c passes “AS3, X” to every router in AS2. NEXT-HOP = the router interface towards the next AS.' },
  { active: ['1c-2a'], badges: { '2a': 'AS3, X', '1c': 'AS2 AS3, X' }, focus: ['2a', '1c'], text: 'Export policy lets 2a advertise it. eBGP: 2a → 1c with its own AS prepended: “AS2, AS3, X”. AS-PATH grows by one AS each hop.' },
  { active: ['1a-1c', '1b-1c', '1c-1d'], badges: { '1c': 'AS2 AS3, X', '1a': 'AS2 AS3, X', '1b': 'AS2 AS3, X', '1d': 'AS2 AS3, X' }, focus: ['1c'], text: 'iBGP again: 1c tells 1a, 1b, 1d. Now every router in AS1 knows a path to X: AS-PATH = AS2, AS3.' },
]

export function BgpAdvert() {
  const [i, setI] = useState(0)
  const s = ADV[i]
  return (
    <div className="space-y-3">
      <AsFigure mode="plain" active={s.active} badges={s.badges} focus={s.focus} tag="amber = advertisement travelling · yellow label = route being held" />
      <Controls>
        <Btn variant="ghost" size="sm" icon={ChevronLeft} disabled={i === 0} onClick={() => setI(i - 1)}>
          Back
        </Btn>
        <Btn size="sm" icon={ChevronRight} disabled={i === ADV.length - 1} onClick={() => setI(i + 1)}>
          Next hop
        </Btn>
        <Btn variant="ghost" size="sm" icon={RotateCcw} onClick={() => setI(0)}>
          Reset
        </Btn>
        <span className="ml-auto font-mono text-xs text-slate-500">
          {i + 1}/{ADV.length}
        </span>
      </Controls>
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-200">
          {s.text}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ---------------- 3. hot potato (slide 79 weights) ---------------- */

export function HotPotato() {
  const t = useTheme()
  const [ca, setCa] = useState(201) // 2d–2a
  const [cc, setCc] = useState(263) // 2d–2c
  const via2b = 152 + 112
  const to2c = Math.min(cc, via2b)
  const pickA = ca <= to2c
  const choice = pickA ? '2a' : '2c'
  const w = (v, set, lab) => (
    <label className="block text-xs text-slate-300">
      {lab}: <b className="font-mono text-white">{v}</b>
      <input type="range" min={20} max={400} value={v} onChange={(e) => set(+e.target.value)} className="mt-1 block w-full accent-sky-400" />
    </label>
  )
  const line = (a, b, label, hot, curve) => {
    const [x1, y1] = R[a]
    const [x2, y2] = R[b]
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={hot ? '#fbbf24' : '#475569'} strokeWidth={hot ? 5 : 2} className={hot ? 'flow-dash' : ''} strokeDasharray={hot ? '8 6' : undefined} />
        <rect x={(x1 + x2) / 2 - 18} y={(y1 + y2) / 2 - 10} width={36} height={20} rx={6} fill="#0a1020" />
        <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill={hot ? '#fde68a' : '#94a3b8'}>
          {label}
        </text>
      </g>
    )
  }
  return (
    <div className="space-y-3">
      <svg viewBox="150 120 400 230" className="w-full rounded-xl bg-[#0a1020]">
        <ellipse cx={330} cy={245} rx={125} ry={92} fill="rgba(56,189,248,0.10)" stroke="rgba(56,189,248,0.35)" />
        {line('2a', '2d', ca, pickA)}
        {line('2d', '2c', cc, !pickA && cc <= via2b)}
        {line('2b', '2d', 152, !pickA && cc > via2b)}
        {line('2b', '2c', 112, !pickA && cc > via2b)}
        {['2a', '2b', '2c', '2d'].map((n) => (
          <g key={n}>
            <circle cx={R[n][0]} cy={R[n][1]} r={16} fill={n === '2d' ? t.hex : '#111a30'} stroke={n === choice ? '#fbbf24' : '#64748b'} strokeWidth={n === choice ? 4 : 2} />
            <text x={R[n][0]} y={R[n][1] + 4.5} textAnchor="middle" fontSize={12} fontWeight={800} fill={n === '2d' ? '#04101f' : '#e2e8f0'}>
              {n}
            </text>
          </g>
        ))}
        <text x={200} y={178} fontSize={12} fill="#7dd3fc" fontWeight={700}>
          AS2 (OSPF link weights)
        </text>
        <text x={R['2a'][0] - 40} y={R['2a'][1] + 40} fontSize={11} fill="#f9a8d4">
          → to AS1 → AS3 → X
        </text>
        <text x={R['2c'][0] - 5} y={R['2c'][1] + 40} fontSize={11} fill="#f9a8d4">
          → to AS3 → X
        </text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        {w(ca, setCa, 'cost 2d → 2a')}
        {w(cc, setCc, 'cost 2d → 2c')}
      </div>
      <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">
        2d has two exits to reach X. Cheapest inside AS2: to 2a = <b>{ca}</b>, to 2c = <b>{to2c}</b>. Hot potato picks <b>{choice}</b> – the <i>lowest intra-AS cost</i> – and ignores that the other exit has fewer AS hops.
      </div>
    </div>
  )
}

/* ---------------- 4. route selection ---------------- */

const SCENARIOS = [
  {
    name: 'Policy decides',
    routes: [
      { id: 'R1', lp: 100, path: 'AS2 AS3', hops: 2, igp: 201 },
      { id: 'R2', lp: 200, path: 'AS4 AS5 AS3', hops: 3, igp: 500 },
      { id: 'R3', lp: 100, path: 'AS3', hops: 1, igp: 263 },
    ],
  },
  {
    name: 'Shorter AS-PATH wins',
    routes: [
      { id: 'R1', lp: 100, path: 'AS2 AS3', hops: 2, igp: 201 },
      { id: 'R2', lp: 100, path: 'AS4 AS5 AS3', hops: 3, igp: 120 },
      { id: 'R3', lp: 100, path: 'AS3', hops: 1, igp: 263 },
    ],
  },
  {
    name: 'Hot potato breaks the tie',
    routes: [
      { id: 'R1', lp: 100, path: 'AS2 AS3', hops: 2, igp: 201 },
      { id: 'R2', lp: 100, path: 'AS6 AS3', hops: 2, igp: 120 },
      { id: 'R3', lp: 100, path: 'AS7 AS8 AS3', hops: 3, igp: 90 },
    ],
  },
]

export function BgpSelect() {
  const t = useTheme()
  const [sc, setSc] = useState(0)
  const [rule, setRule] = useState(0) // how many rules applied
  const routes = SCENARIOS[sc].routes
  const survivors = (upto) => {
    let s = routes
    if (upto >= 1) {
      const m = Math.max(...s.map((r) => r.lp))
      s = s.filter((r) => r.lp === m)
    }
    if (upto >= 2) {
      const m = Math.min(...s.map((r) => r.hops))
      s = s.filter((r) => r.hops === m)
    }
    if (upto >= 3) {
      const m = Math.min(...s.map((r) => r.igp))
      s = s.filter((r) => r.igp === m)
    }
    return s
  }
  const alive = survivors(rule).map((r) => r.id)
  const rules = ['1. Highest local preference (policy)', '2. Shortest AS-PATH', '3. Closest NEXT-HOP router (hot potato)']
  return (
    <div className="space-y-3">
      <Controls>
        {SCENARIOS.map((s, i) => (
          <button key={i} onClick={() => { setSc(i); setRule(0) }} className={cx('rounded-lg px-3 py-1.5 text-xs font-bold', sc === i ? cx(t.bgMid, t.textSoft) : 'bg-white/5 text-slate-400 hover:bg-white/10')}>
            {s.name}
          </button>
        ))}
      </Controls>
      <div className="text-xs text-slate-400">Router learns 3 routes to prefix X. Apply BGP’s rules in order – losing routes fade out.</div>
      <div className="space-y-2">
        {routes.map((r) => {
          const ok = alive.includes(r.id)
          const winner = rule === 3 && ok
          return (
            <motion.div key={r.id} animate={{ opacity: ok ? 1 : 0.28, scale: winner ? 1.02 : 1 }} className={cx('grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 rounded-xl border px-3 py-2 text-sm', winner ? 'border-emerald-400 bg-emerald-400/15' : 'border-white/10 bg-white/[0.04]')}>
              <span className="font-mono font-bold text-white">{r.id}</span>
              <span className="font-mono text-xs text-slate-300">AS-PATH: {r.path}</span>
              <span className={cx('rounded-md px-2 py-0.5 font-mono text-xs', rule >= 1 ? 'bg-sky-500/20 text-sky-200' : 'bg-white/10 text-slate-300')}>pref {r.lp}</span>
              <span className={cx('rounded-md px-2 py-0.5 font-mono text-xs', rule >= 3 ? 'bg-amber-500/20 text-amber-200' : 'bg-white/10 text-slate-300')}>IGP {r.igp}</span>
            </motion.div>
          )
        })}
      </div>
      <Controls>
        <Btn size="sm" icon={ChevronRight} disabled={rule >= 3} onClick={() => setRule(rule + 1)}>
          {rule < 3 ? `Apply: ${rules[rule]}` : 'Done'}
        </Btn>
        <Btn variant="ghost" size="sm" icon={RotateCcw} onClick={() => setRule(0)}>
          Reset
        </Btn>
      </Controls>
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-200">
        {rule === 0 ? 'Nothing eliminated yet.' : `After rule ${rule}: ${alive.join(', ')} still in the running.`}
        {rule === 3 && alive.length === 1 && <b className="text-emerald-300"> Winner: {alive[0]}.</b>}
      </div>
    </div>
  )
}
