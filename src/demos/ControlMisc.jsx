import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Cpu, Send } from 'lucide-react'
import { useTheme } from '../lib/theme'
import { cx, sleep } from '../lib/utils'
import { Btn, Controls, Table } from '../components/ui'
import Seq from '../components/Seq'

/* ---------- forwarding vs routing ---------- */

const RANGES = [
  { id: 1, label: 'range 1', out: 3 },
  { id: 2, label: 'range 2', out: 2 },
  { id: 3, label: 'range 3', out: 2 },
  { id: 4, label: 'range 4', out: 1 },
]

export function PlanesDemo() {
  const t = useTheme()
  const [pkt, setPkt] = useState(null) // {dest, phase}
  const [busy, setBusy] = useState(false)
  const [filled, setFilled] = useState(true)
  const [computing, setComputing] = useState(false)

  const send = async (r) => {
    if (busy || !filled) return
    setBusy(true)
    setPkt({ dest: r, phase: 'in' })
    await sleep(700)
    setPkt({ dest: r, phase: 'lookup' })
    await sleep(900)
    setPkt({ dest: r, phase: 'out' })
    await sleep(800)
    setPkt(null)
    setBusy(false)
  }
  const runRouting = async () => {
    if (computing) return
    setComputing(true)
    setFilled(false)
    await sleep(1400)
    setFilled(true)
    setComputing(false)
  }
  const outY = { 1: 30, 2: 100, 3: 170 }
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="relative h-56 overflow-hidden rounded-xl bg-[#0a1020]">
          {/* router box */}
          <div className={cx('absolute left-[28%] right-[28%] top-3 bottom-3 rounded-2xl border-2 border-dashed', t.border)}>
            <div className={cx('absolute left-2 top-1 text-[10px] font-bold uppercase', t.text)}>router</div>
            <motion.div animate={{ opacity: computing ? 1 : 0.7, scale: computing ? 1.06 : 1 }} className="absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-1 rounded-lg bg-amber-400/20 px-2 py-1 text-[10px] font-bold text-amber-200">
              <Cpu size={12} className={computing ? 'animate-spin' : ''} /> routing algorithm
            </motion.div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-lg bg-sky-400/20 px-2 py-1 text-[10px] font-bold text-sky-200">switching fabric</div>
          </div>
          {/* links */}
          <div className="absolute left-0 top-1/2 w-[28%] border-t-2 border-slate-600" />
          {[1, 2, 3].map((o) => (
            <div key={o} className="absolute right-0 w-[28%] border-t-2 border-slate-600" style={{ top: 28 + (o - 1) * 70 }}>
              <span className="absolute -top-5 right-2 font-mono text-[10px] text-slate-400">link {o}</span>
            </div>
          ))}
          <AnimatePresence>
            {pkt && (
              <motion.div
                key={pkt.dest.id}
                initial={{ left: '2%', top: '50%' }}
                animate={pkt.phase === 'in' ? { left: '26%', top: '50%' } : pkt.phase === 'lookup' ? { left: '46%', top: '50%' } : { left: '88%', top: 28 + (pkt.dest.out - 1) * 70 }}
                transition={{ duration: 0.7 }}
                className="absolute -translate-y-1/2 rounded-md bg-amber-400 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-900"
              >
                {pkt.dest.label}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="w-full md:w-52">
          <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Forwarding table</div>
          <div className="overflow-hidden rounded-xl border border-white/10 text-xs">
            <div className="grid grid-cols-2 bg-white/[0.06] px-2 py-1 font-semibold text-slate-400">
              <span>dest address</span>
              <span>output link</span>
            </div>
            {RANGES.map((r) => {
              const hit = pkt && pkt.dest.id === r.id && pkt.phase !== 'in'
              return (
                <motion.div key={r.id} animate={{ backgroundColor: hit ? 'rgba(251,191,36,0.3)' : 'rgba(0,0,0,0)' }} className="grid grid-cols-2 border-t border-white/5 px-2 py-1.5 font-mono text-slate-200">
                  <span>{r.label}</span>
                  <span>{filled ? r.out : '…'}</span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
      <Controls>
        <span className="text-xs font-semibold text-slate-400">Data plane – send a packet to:</span>
        {RANGES.map((r) => (
          <Btn key={r.id} size="sm" variant="soft" icon={Send} disabled={busy || !filled} onClick={() => send(r)}>
            {r.label}
          </Btn>
        ))}
      </Controls>
      <Controls>
        <span className="text-xs font-semibold text-slate-400">Control plane –</span>
        <Btn size="sm" variant="good" icon={Cpu} disabled={computing || busy} onClick={runRouting}>
          {computing ? 'computing…' : 'Run the routing algorithm (rebuild table)'}
        </Btn>
      </Controls>
      <div className="grid gap-2 text-sm sm:grid-cols-2">
        <div className="rounded-xl border border-sky-400/30 bg-sky-400/10 p-3 text-sky-100">
          <b>Forwarding (data plane)</b>: move a packet from input to the right output. Local, per-packet, super fast.
        </div>
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-amber-100">
          <b>Routing (control plane)</b>: work out the end-to-end route and <i>fill in</i> the table. Network-wide, slower.
        </div>
      </div>
    </div>
  )
}

/* ---------- per-router vs centralised control ---------- */

const RPOS = { A: [90, 120], B: [230, 60], C: [230, 180], D: [370, 120] }
const RLINKS = [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D'], ['B', 'C']]

export function ControlStyles() {
  const t = useTheme()
  const [central, setCentral] = useState(false)
  return (
    <div className="space-y-3">
      <Controls>
        {[
          [false, 'Per-router control'],
          [true, 'Logically centralised'],
        ].map(([v, l]) => (
          <button key={l} onClick={() => setCentral(v)} className={cx('rounded-lg px-3 py-1.5 text-xs font-bold', central === v ? cx(t.bgMid, t.textSoft) : 'bg-white/5 text-slate-400 hover:bg-white/10')}>
            {l}
          </button>
        ))}
      </Controls>
      <svg viewBox="0 0 460 250" className="w-full rounded-xl bg-[#0a1020]">
        {RLINKS.map(([a, b]) => (
          <line key={a + b} x1={RPOS[a][0]} y1={RPOS[a][1] + 30} x2={RPOS[b][0]} y2={RPOS[b][1] + 30} stroke={central ? '#334155' : t.hex} strokeWidth={central ? 2 : 2.5} strokeDasharray={central ? undefined : '6 5'} className={central ? '' : 'flow-dash'} />
        ))}
        {central && (
          <>
            <rect x={150} y={2} width={160} height={34} rx={10} fill="#4c1d95" stroke="#c4b5fd" />
            <text x={230} y={24} textAnchor="middle" fontSize={13} fontWeight={800} fill="#ede9fe">
              Remote controller
            </text>
            {Object.entries(RPOS).map(([n, [x, y]]) => (
              <line key={n} x1={230} y1={36} x2={x} y2={y + 6} stroke="#c4b5fd" strokeWidth={2} strokeDasharray="4 4" className="flow-dash" />
            ))}
          </>
        )}
        {Object.entries(RPOS).map(([n, [x, y]]) => (
          <g key={n}>
            <rect x={x - 38} y={y + 8} width={76} height={44} rx={10} fill="#111a30" stroke="#64748b" strokeWidth={2} />
            <text x={x} y={y + 28} textAnchor="middle" fontSize={13} fontWeight={800} fill="#e2e8f0">
              Router {n}
            </text>
            <rect x={x - 32} y={y + 34} width={64} height={14} rx={4} fill={central ? '#6d28d9' : '#b45309'} />
            <text x={x} y={y + 45} textAnchor="middle" fontSize={9} fontWeight={700} fill="#fff">
              {central ? 'control agent' : 'routing alg.'}
            </text>
          </g>
        ))}
      </svg>
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-200">
        {central ? (
          <>
            A distinct (typically remote) <b>controller</b> talks to a small <b>control agent (CA)</b> in each router and computes the forwarding tables for everyone.
          </>
        ) : (
          <>
            An <b>individual routing algorithm in every router</b>. Routers talk to each other (dashed) and each computes its own forwarding table. This is how OSPF / DV / BGP work.
          </>
        )}
      </div>
    </div>
  )
}

/* ---------- OSPF hierarchy ---------- */

const OSPF_NODES = [
  { id: 'b1', x: 230, y: 135, type: 'backbone' },
  { id: 'b2', x: 330, y: 135, type: 'backbone' },
  { id: 'abr1', x: 170, y: 135, type: 'abr' },
  { id: 'abr2', x: 390, y: 135, type: 'abr' },
  { id: 'abr3', x: 280, y: 200, type: 'abr' },
  { id: 'i1', x: 80, y: 100, type: 'internal' },
  { id: 'i2', x: 80, y: 170, type: 'internal' },
  { id: 'i3', x: 480, y: 100, type: 'internal' },
  { id: 'i4', x: 480, y: 170, type: 'internal' },
  { id: 'i5', x: 220, y: 270, type: 'internal' },
  { id: 'i6', x: 340, y: 270, type: 'internal' },
  { id: 'br', x: 280, y: 50, type: 'boundary' },
]
const OSPF_LINKS = [
  ['i1', 'abr1'], ['i2', 'abr1'], ['i1', 'i2'], ['abr1', 'b1'], ['b1', 'b2'], ['b2', 'abr2'], ['abr2', 'i3'], ['abr2', 'i4'], ['i3', 'i4'],
  ['b1', 'abr3'], ['b2', 'abr3'], ['abr3', 'i5'], ['abr3', 'i6'], ['i5', 'i6'], ['b1', 'br'], ['b2', 'br'],
]
const OSPF_INFO = {
  internal: ['Internal router', 'Knows the full topology of its OWN area (floods link-state ads only inside the area) and just the shortest path to nets in other areas.'],
  abr: ['Area border router', '“Summarises” distances to nets in its own area and advertises that summary to the other area border routers.'],
  backbone: ['Backbone router', 'Runs OSPF limited to the backbone (area 0) – the hub that connects all the areas.'],
  boundary: ['Boundary router', 'Connects to OTHER autonomous systems (so it also speaks BGP).'],
}
const OSPF_COLOR = { internal: '#94a3b8', abr: '#fbbf24', backbone: '#38bdf8', boundary: '#fb7185' }

export function OspfAreas() {
  const t = useTheme()
  const [sel, setSel] = useState('abr')
  const pos = Object.fromEntries(OSPF_NODES.map((n) => [n.id, n]))
  const info = OSPF_INFO[sel]
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 560 320" className="w-full rounded-xl bg-[#0a1020]">
        <ellipse cx={280} cy={135} rx={140} ry={42} fill="rgba(56,189,248,0.12)" stroke="#38bdf8" strokeOpacity={0.5} />
        <text x={280} y={104} textAnchor="middle" fontSize={11} fontWeight={800} fill="#7dd3fc">
          backbone (area 0)
        </text>
        <ellipse cx={95} cy={135} rx={80} ry={65} fill="rgba(148,163,184,0.08)" stroke="#64748b" strokeOpacity={0.6} />
        <text x={95} y={62} textAnchor="middle" fontSize={11} fontWeight={800} fill="#cbd5e1">
          area 1
        </text>
        <ellipse cx={470} cy={135} rx={80} ry={65} fill="rgba(148,163,184,0.08)" stroke="#64748b" strokeOpacity={0.6} />
        <text x={470} y={62} textAnchor="middle" fontSize={11} fontWeight={800} fill="#cbd5e1">
          area 2
        </text>
        <ellipse cx={280} cy={270} rx={100} ry={42} fill="rgba(148,163,184,0.08)" stroke="#64748b" strokeOpacity={0.6} />
        <text x={280} y={312} textAnchor="middle" fontSize={11} fontWeight={800} fill="#cbd5e1">
          area 3
        </text>
        <path d="M280,28 Q280,10 330,12" stroke="#fb7185" fill="none" strokeDasharray="4 4" />
        <text x={340} y={16} fontSize={11} fill="#fda4af">
          → other ASes
        </text>
        {OSPF_LINKS.map(([a, b]) => (
          <line key={a + b} x1={pos[a].x} y1={pos[a].y} x2={pos[b].x} y2={pos[b].y} stroke="#475569" strokeWidth={2} />
        ))}
        {OSPF_NODES.map((n) => (
          <g key={n.id} onClick={() => setSel(n.type)} style={{ cursor: 'pointer' }}>
            <circle cx={n.x} cy={n.y} r={sel === n.type ? 15 : 12} fill="#111a30" stroke={OSPF_COLOR[n.type]} strokeWidth={sel === n.type ? 4 : 2.5} />
          </g>
        ))}
      </svg>
      <Controls>
        {Object.entries(OSPF_INFO).map(([k, [name]]) => (
          <button key={k} onClick={() => setSel(k)} className={cx('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold', sel === k ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10')}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: OSPF_COLOR[k] }} />
            {name}
          </button>
        ))}
      </Controls>
      <AnimatePresence mode="wait">
        <motion.div key={sel} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cx('rounded-xl border p-3 text-sm text-slate-200', t.border, t.bgSoft)}>
          <b className="text-white">{info[0]}.</b> {info[1]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ---------- SNMP ---------- */

const SNMP = {
  get: {
    label: 'Request / response',
    steps: [
      { from: 'm', to: 'a', label: 'GetRequest (UDPInDatagrams)', note: 'The managing server asks a managed device’s agent for a MIB value.' },
      { from: 'a', to: 'm', label: 'Response (value = 1 523 044)', tone: 'good', note: 'The agent replies with the value. Request/response mode = manager asks, agent answers.' },
      { from: 'm', to: 'a', label: 'SetRequest (…, new value)', note: 'Manager-to-agent: set a MIB value (i.e. configure the device).' },
      { from: 'a', to: 'm', label: 'Response (done)', tone: 'good' },
    ],
  },
  trap: {
    label: 'Trap mode',
    steps: [
      { from: 'a', to: 'a', label: '⚠ link goes down', tone: 'bad', note: 'Something exceptional happens on the managed device.' },
      { from: 'a', to: 'm', label: 'Trap (link down)', tone: 'bad', note: 'Agent-to-manager, unprompted: “inform the manager of an exceptional event”. No request needed.' },
    ],
  },
}

export function SnmpDemo() {
  const t = useTheme()
  const [k, setK] = useState('get')
  return (
    <div className="space-y-3">
      <Controls>
        {Object.entries(SNMP).map(([id, v]) => (
          <button key={id} onClick={() => setK(id)} className={cx('rounded-lg px-3 py-1.5 text-xs font-bold', k === id ? cx(t.bgMid, t.textSoft) : 'bg-white/5 text-slate-400 hover:bg-white/10')}>
            {v.label}
          </button>
        ))}
      </Controls>
      <Seq key={k} actors={[{ id: 'm', label: 'Managing server', sub: 'controller' }, { id: 'a', label: 'Agent', sub: 'managed device (MIB)' }]} steps={SNMP[k].steps} />
    </div>
  )
}

export function MibTable() {
  return (
    <Table
      mono
      head={['Object ID', 'Name', 'Type', 'Meaning']}
      rows={[
        ['1.3.6.1.2.1.7.1', 'UDPInDatagrams', '32-bit counter', 'total # datagrams delivered'],
        ['1.3.6.1.2.1.7.2', 'UDPNoPorts', '32-bit counter', '# undeliverable (no app at port)'],
        ['1.3.6.1.2.1.7.3', 'UDPInErrors', '32-bit counter', '# undeliverable (other reasons)'],
        ['1.3.6.1.2.1.7.4', 'UDPOutDatagrams', '32-bit counter', 'total # datagrams sent'],
        ['1.3.6.1.2.1.7.5', 'udpTable', 'SEQUENCE', 'one entry per port in use'],
      ]}
    />
  )
}
