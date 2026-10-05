import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, RotateCcw, Send } from 'lucide-react'
import { useTheme } from '../lib/theme'
import { cx, sleep } from '../lib/utils'
import { Btn, Controls } from '../components/ui'

/* ============================ ARP ============================ */

const NODES = [
  { id: 'A', ip: '137.196.7.23', mac: '71-65-F7-2B-08-53', x: 9 },
  { id: 'B', ip: '137.196.7.14', mac: '58-23-D7-FA-20-B0', x: 31 },
  { id: 'C', ip: '137.196.7.78', mac: '1A-2F-BB-76-09-AD', x: 53 },
  { id: 'D', ip: '137.196.7.88', mac: '0C-C4-11-6F-E3-98', x: 75 },
  { id: 'R', ip: '137.196.7.1', mac: 'E6-E9-00-17-BB-4B', x: 94, router: true },
]
const BCAST = 'FF-FF-FF-FF-FF-FF'

export function ArpDemo() {
  const t = useTheme()
  const [dest, setDest] = useState('same')
  const [i, setI] = useState(0)
  const A = NODES[0]
  const X = dest === 'same' ? NODES[1] : NODES[4]
  const finalIp = dest === 'same' ? X.ip : '8.8.8.8'

  const steps = [
    {
      from: null,
      to: [],
      text: dest === 'same' ? `A wants to send a datagram to B (${X.ip}). B’s MAC isn’t in A’s ARP table.` : `A wants to reach 8.8.8.8. That’s NOT in A’s subnet (137.196.7/24), so A must hand the frame to its first-hop router R. R’s MAC isn’t in the ARP table.`,
      fields: null,
    },
    {
      from: 'A',
      to: ['B', 'C', 'D', 'R'],
      label: 'ARP query',
      text: `A BROADCASTS an ARP query: “Who has ${X.ip}?” Ethernet destination = ${BCAST}, so every node on the LAN receives it.`,
      fields: [['Frame dest MAC', BCAST], ['Frame src MAC', A.mac], ['ARP sender IP', A.ip], ['ARP target IP', X.ip]],
    },
    {
      from: X.id,
      to: ['A'],
      label: 'ARP reply',
      text: `Only ${X.id} matches the target IP. It replies directly to A (unicast, not broadcast) giving its MAC address.`,
      fields: [['Frame dest MAC', A.mac], ['Frame src MAC', X.mac], ['ARP sender IP', X.ip], ['ARP says', `${X.ip} is at ${X.mac}`]],
    },
    {
      from: 'A',
      to: [X.id],
      label: 'IP datagram',
      text: `A caches the pair in its ARP table (soft state – forgotten after a TTL, typically ~20 min) and now sends the real frame${dest === 'same' ? '' : ' to the ROUTER’s MAC, while the IP destination stays 8.8.8.8'}.`,
      fields: [['Frame dest MAC', X.mac], ['Frame src MAC', A.mac], ['IP src', A.ip], ['IP dest', finalIp]],
    },
  ]
  const s = steps[i]
  const x = (id) => `${NODES.find((n) => n.id === id).x}%`

  return (
    <div className="space-y-3">
      <Controls>
        {[
          ['same', 'Dest on same LAN (B)'],
          ['other', 'Dest on another network (8.8.8.8)'],
        ].map(([k, l]) => (
          <button key={k} onClick={() => { setDest(k); setI(0) }} className={cx('rounded-lg px-3 py-1.5 text-xs font-bold', dest === k ? cx(t.bgMid, t.textSoft) : 'bg-white/5 text-slate-400 hover:bg-white/10')}>
            {l}
          </button>
        ))}
      </Controls>
      <div className="relative h-40 overflow-hidden rounded-xl bg-[#0a1020]">
        <div className="absolute left-[4%] right-[4%] top-[58%] h-1 rounded bg-slate-700" />
        {NODES.map((n) => {
          const sender = s.from === n.id
          const rec = s.to.includes(n.id)
          return (
            <div key={n.id} className="absolute top-[40%] -translate-x-1/2 text-center" style={{ left: `${n.x}%` }}>
              <motion.div animate={{ scale: sender ? 1.15 : 1 }} className={cx('mx-auto flex h-10 w-10 items-center justify-center rounded-xl border-2 text-sm font-extrabold', sender ? 'border-amber-400 bg-amber-400/20 text-amber-200' : rec ? 'border-emerald-400 bg-emerald-400/15 text-emerald-200' : 'border-slate-600 bg-slate-800 text-slate-300', n.router && 'rounded-full')}>
                {n.id}
              </motion.div>
              <div className="mt-1 font-mono text-[8px] leading-tight text-slate-400 sm:text-[9px]">
                {n.ip.replace('137.196.', '…')}
                <div className="text-slate-600">{n.mac.slice(0, 8)}…</div>
              </div>
            </div>
          )
        })}
        <AnimatePresence>
          {s.from &&
            s.to.map((id) => (
              <motion.div key={`${i}-${s.from}-${id}`} initial={{ left: x(s.from), opacity: 1 }} animate={{ left: x(id) }} transition={{ duration: 0.8, ease: 'easeOut' }} className={cx('absolute top-[22%] -translate-x-1/2 rounded-md px-1.5 py-0.5 text-[9px] font-extrabold', i === 1 ? 'bg-amber-400 text-slate-900' : i === 2 ? 'bg-emerald-400 text-slate-900' : 'bg-sky-400 text-slate-900')}>
                {s.label}
              </motion.div>
            ))}
        </AnimatePresence>
        <div className="absolute bottom-1.5 left-3 text-[10px] text-slate-500">all on one LAN · R = first-hop router (to the Internet)</div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={`${dest}${i}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-200">
          <div>{s.text}</div>
          {s.fields && (
            <div className="mt-2 grid gap-1 font-mono text-[11px] sm:grid-cols-2">
              {s.fields.map(([a, b]) => (
                <div key={a} className="rounded-md bg-black/30 px-2 py-1">
                  <span className="text-slate-500">{a}: </span>
                  <span className={cx(b === BCAST ? 'text-amber-300' : 'text-slate-100')}>{b}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 p-2">
          <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">ARP table in A</div>
          <div className="grid grid-cols-[1fr_1.4fr_auto] gap-x-2 font-mono text-[11px] text-slate-500">
            <span>IP</span><span>MAC</span><span>TTL</span>
          </div>
          {i >= 3 ? (
            <motion.div initial={{ backgroundColor: 'rgba(251,191,36,0.4)' }} animate={{ backgroundColor: 'rgba(0,0,0,0)' }} transition={{ duration: 1.2 }} className="grid grid-cols-[1fr_1.4fr_auto] gap-x-2 rounded font-mono text-[11px] text-slate-100">
              <span>{X.ip}</span><span>{X.mac}</span><span>~20m</span>
            </motion.div>
          ) : (
            <div className="font-mono text-[11px] text-slate-600">(empty)</div>
          )}
        </div>
        <Controls className="items-start justify-end">
          <Btn variant="ghost" size="sm" icon={ChevronLeft} disabled={i === 0} onClick={() => setI(i - 1)}>
            Back
          </Btn>
          <Btn size="sm" icon={ChevronRight} disabled={i === steps.length - 1} onClick={() => setI(i + 1)}>
            Next
          </Btn>
          <Btn variant="ghost" size="sm" icon={RotateCcw} onClick={() => setI(0)}>
            Reset
          </Btn>
        </Controls>
      </div>
    </div>
  )
}

/* ============================ frames at each point (problem sheet Q3) ============================ */

const HOSTS = {
  A: { ip: '128.119.149.235', mac: '44-E0-4E-95-7E-61' },
  rA: { ip: '128.119.149.226', mac: '27-1F-BF-6F-90-AA' },
  rB: { ip: '128.119.90.254', mac: '85-14-BD-7C-D0-E6' },
  B: { ip: '128.119.90.182', mac: '60-E2-34-53-EF-3D' },
}

export function HopFrames() {
  const t = useTheme()
  const [dir, setDir] = useState('BA')
  const [pt, setPt] = useState(3)
  const [reveal, setReveal] = useState(true)

  const frameAt = (p) => {
    const BA = dir === 'BA'
    const src = BA ? HOSTS.B : HOSTS.A
    const dst = BA ? HOSTS.A : HOSTS.B
    const onBSide = p === 3
    // which LAN is the frame on?
    let macSrc, macDst
    if (BA) {
      if (onBSide) [macSrc, macDst] = [HOSTS.B.mac, HOSTS.rB.mac]
      else [macSrc, macDst] = [HOSTS.rA.mac, HOSTS.A.mac]
    } else if (onBSide) [macSrc, macDst] = [HOSTS.rB.mac, HOSTS.B.mac]
    else [macSrc, macDst] = [HOSTS.A.mac, HOSTS.rA.mac]
    return { macSrc, macDst, ipSrc: src.ip, ipDst: dst.ip }
  }
  const fr = frameAt(pt)
  const order = dir === 'BA' ? [3, 2, 1] : [1, 2, 3]
  const prevPt = order[order.indexOf(pt) - 1]
  const prev = prevPt ? frameAt(prevPt) : null
  const chg = (k) => prev && prev[k] !== fr[k]

  const P = { 1: 160, 2: 255, 3: 465 }
  return (
    <div className="space-y-3">
      <Controls>
        {[
          ['BA', 'Datagram from B → A'],
          ['AB', 'Datagram from A → B'],
        ].map(([k, l]) => (
          <button key={k} onClick={() => setDir(k)} className={cx('rounded-lg px-3 py-1.5 text-xs font-bold', dir === k ? cx(t.bgMid, t.textSoft) : 'bg-white/5 text-slate-400 hover:bg-white/10')}>
            {l}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400">tap point 1, 2 or 3</span>
      </Controls>
      <svg viewBox="0 0 640 170" className="w-full rounded-xl bg-[#0a1020]">
        <line x1={50} y1={85} x2={590} y2={85} stroke="#334155" strokeWidth={3} />
        {/* hosts / devices */}
        {[
          [50, 'A', '#38bdf8'],
          [110, 'switch', '#64748b'],
          [360, 'Router', '#a78bfa'],
          [560, 'B', '#fb7185'],
        ].map(([x, l, c]) => (
          <g key={l}>
            <rect x={x - 30} y={66} width={60} height={38} rx={10} fill="#111a30" stroke={c} strokeWidth={2.5} />
            <text x={x} y={90} textAnchor="middle" fontSize={13} fontWeight={800} fill="#e2e8f0">{l}</text>
          </g>
        ))}
        <text x={235} y={52} textAnchor="middle" fontSize={9} fill="#7dd3fc">128.119.149.226</text>
        <text x={235} y={62} textAnchor="middle" fontSize={9} fill="#7dd3fc">27-1F-BF-6F-90-AA</text>
        <text x={470} y={52} textAnchor="middle" fontSize={9} fill="#c4b5fd">128.119.90.254 / 85-14-BD-7C-D0-E6</text>
        <text x={50} y={120} textAnchor="middle" fontSize={9} fill="#94a3b8">44-E0-4E-95-7E-61</text>
        <text x={560} y={120} textAnchor="middle" fontSize={9} fill="#94a3b8">60-E2-34-53-EF-3D</text>
        {/* LAN labels */}
        <text x={170} y={150} textAnchor="middle" fontSize={10} fill="#64748b">A’s LAN (128.119.149/…)</text>
        <text x={500} y={150} textAnchor="middle" fontSize={10} fill="#64748b">B’s LAN (128.119.90/…)</text>
        {[1, 2, 3].map((p) => (
          <g key={p} onClick={() => setPt(p)} style={{ cursor: 'pointer' }}>
            <circle cx={P[p]} cy={85} r={pt === p ? 16 : 13} fill={pt === p ? t.hex : '#be123c'} stroke="#fff" strokeWidth={pt === p ? 3 : 1.5} />
            <text x={P[p]} y={90} textAnchor="middle" fontSize={13} fontWeight={900} fill={pt === p ? '#04101f' : '#fff'}>{p}</text>
          </g>
        ))}
      </svg>
      <div className="grid gap-2 sm:grid-cols-2">
        {[
          ['macSrc', 'Source MAC'],
          ['macDst', 'Destination MAC'],
          ['ipSrc', 'Source IP'],
          ['ipDst', 'Destination IP'],
        ].map(([k, l]) => (
          <motion.div key={`${dir}${pt}${k}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cx('rounded-xl border p-2.5', chg(k) ? 'border-amber-400/60 bg-amber-400/10' : 'border-white/10 bg-white/[0.04]')}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {l} {chg(k) && <span className="text-amber-300">· changed</span>}
            </div>
            <div className="font-mono text-sm text-white">{reveal ? fr[k] : '?'}</div>
          </motion.div>
        ))}
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-200">
        {pt === order[0] ? 'First hop: the sender frames the datagram for the ROUTER’s interface on its own LAN.' : prevPt && (prev.macSrc !== fr.macSrc ? <>The <b>router</b> re-framed it for the next LAN: <b>MAC addresses changed</b>, <b>IP addresses did not</b>.</> : <>Same LAN, only a <b>switch</b> in between. Switches don’t touch addresses – <b>nothing changes</b>.</>)}
      </div>
      <div className="flex gap-2">
        <Btn size="sm" variant="ghost" onClick={() => setReveal(!reveal)}>
          {reveal ? 'Hide values (quiz yourself)' : 'Show values'}
        </Btn>
      </div>
    </div>
  )
}

/* ============================ learning switches (problem sheet Q4) ============================ */

const LEFT = { 10: 'G', 11: 'H', 12: 'I', 13: 'J', 14: 'K', 15: 'L' }
const RIGHT = { 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E', 6: 'F' }
const TRUNK = { L: 8, R: 7 }
const HOST_SW = { ...Object.fromEntries(Object.values(LEFT).map((h) => [h, 'L'])), ...Object.fromEntries(Object.values(RIGHT).map((h) => [h, 'R'])) }
const HOST_PORT = {}
Object.entries(LEFT).forEach(([p, h]) => (HOST_PORT[h] = +p))
Object.entries(RIGHT).forEach(([p, h]) => (HOST_PORT[h] = +p))
const PORTS = { L: [...Object.keys(LEFT).map(Number), 8], R: [...Object.keys(RIGHT).map(Number), 7] }
const hostAt = (sw, port) => (sw === 'L' ? LEFT[port] : RIGHT[port])

function polar(cx, cy, r, deg) {
  const a = (deg * Math.PI) / 180
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
}
const SW_C = { L: [215, 185], R: [425, 185] }
const ANG = { L: { H: -62, G: -112, L: -162, K: 162, J: 112, I: 62 }, R: { F: -118, A: -68, B: -18, C: 30, D: 80, E: 130 } }
const hostPos = (h) => polar(...SW_C[HOST_SW[h]], 125, ANG[HOST_SW[h]][h])

function runFrame(tables, src, dst) {
  const next = { L: { ...tables.L }, R: { ...tables.R } }
  const events = []
  const received = new Set()
  const links = []
  const handle = (sw, inPort, from) => {
    const tb = next[sw]
    const learned = tb[src] !== inPort
    tb[src] = inPort
    const name = sw === 'L' ? 'Left switch' : 'Right switch'
    const known = tb[dst]
    let outs
    let action
    if (known !== undefined) {
      if (known === inPort) {
        outs = []
        action = 'drop'
      } else {
        outs = [known]
        action = 'forward'
      }
    } else {
      outs = PORTS[sw].filter((p) => p !== inPort)
      action = 'flood'
    }
    events.push({ sw: name, learned, src, inPort, dst, known, action, outs })
    outs.forEach((p) => {
      if (p === TRUNK[sw]) {
        links.push(`trunk`)
        handle(sw === 'L' ? 'R' : 'L', TRUNK[sw === 'L' ? 'R' : 'L'], sw)
      } else {
        const h = hostAt(sw, p)
        received.add(h)
        links.push(h)
      }
    })
  }
  handle(HOST_SW[src], HOST_PORT[src], null)
  links.push(src)
  return { tables: next, events, received, links }
}

export function SwitchLab() {
  const t = useTheme()
  const [tables, setTables] = useState({ L: {}, R: {} })
  const [order, setOrder] = useState({ L: [], R: [] })
  const [log, setLog] = useState([])
  const [hit, setHit] = useState({ received: new Set(), links: [], src: null, dst: null })
  const [src, setSrc] = useState('A')
  const [dst, setDst] = useState('D')
  const [reply, setReply] = useState(true)
  const [busy, setBusy] = useState(false)
  const [fresh, setFresh] = useState({})

  const all = [...Object.values(RIGHT), ...Object.values(LEFT)].sort()

  const apply = async (curTables, curOrder, s, d, label) => {
    const r = runFrame(curTables, s, d)
    const ord = { L: [...curOrder.L], R: [...curOrder.R] }
    const newly = {}
    ;['L', 'R'].forEach((sw) => Object.keys(r.tables[sw]).forEach((m) => {
      if (!(m in curTables[sw])) {
        ord[sw].push(m)
        newly[`${sw}${m}`] = true
      }
    }))
    setTables(r.tables)
    setOrder(ord)
    setFresh(newly)
    setHit({ received: r.received, links: r.links, src: s, dst: d })
    setLog((l) => [{ label, events: r.events }, ...l].slice(0, 10))
    return { tables: r.tables, order: ord }
  }

  const send = async (s = src, d = dst, replyToo = reply, label) => {
    if (busy || s === d) return
    setBusy(true)
    try {
      let st = await apply(tables, order, s, d, label || `${s} → ${d}`)
      if (replyToo) {
        await sleep(900)
        st = await apply(st.tables, st.order, d, s, `${d} → ${s} (reply)`)
      }
    } finally {
      setBusy(false)
    }
  }

  const textbook = async () => {
    if (busy) return
    setBusy(true)
    try {
      let st = { tables: { L: {}, R: {} }, order: { L: [], R: [] } }
      setLog([])
      for (const [k, [s, d]] of [['A', 'D'], ['K', 'J'], ['K', 'F'], ['I', 'C']].entries()) {
        st = await apply(st.tables, st.order, s, d, `t=${k + 1}:  ${s} → ${d}`)
        await sleep(900)
        st = await apply(st.tables, st.order, d, s, `t=${k + 1}:  ${d} → ${s} (reply)`)
        await sleep(900)
      }
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    setTables({ L: {}, R: {} })
    setOrder({ L: [], R: [] })
    setLog([])
    setHit({ received: new Set(), links: [], src: null, dst: null })
    setFresh({})
  }

  const swBox = (sw) => {
    const [cx_, cy_] = SW_C[sw]
    return (
      <g key={sw}>
        <rect x={cx_ - 34} y={cy_ - 20} width={68} height={40} rx={10} fill="#111a30" stroke="#64748b" strokeWidth={2.5} />
        <text x={cx_} y={cy_ + 5} textAnchor="middle" fontSize={12} fontWeight={800} fill="#e2e8f0">
          {sw === 'L' ? 'Left switch' : 'Right switch'}
        </text>
      </g>
    )
  }

  return (
    <div className="space-y-3">
      <svg viewBox="0 0 640 370" className="w-full rounded-xl bg-[#0a1020]">
        {/* trunk */}
        <line x1={SW_C.L[0] + 34} y1={185} x2={SW_C.R[0] - 34} y2={185} stroke={hit.links.includes('trunk') ? '#fbbf24' : '#475569'} strokeWidth={hit.links.includes('trunk') ? 5 : 3} />
        <text x={SW_C.L[0] + 42} y={178} fontSize={11} fontWeight={800} fill="#94a3b8">8</text>
        <text x={SW_C.R[0] - 48} y={178} fontSize={11} fontWeight={800} fill="#94a3b8">7</text>
        {all.map((h) => {
          const [x, y] = hostPos(h)
          const sw = HOST_SW[h]
          const [sx, sy] = SW_C[sw]
          const port = HOST_PORT[h]
          const used = hit.links.includes(h)
          const px = sx + (x - sx) * 0.36
          const py = sy + (y - sy) * 0.36
          return (
            <g key={h}>
              <line x1={sx} y1={sy} x2={x} y2={y} stroke={used ? '#fbbf24' : '#334155'} strokeWidth={used ? 4 : 2} />
              <rect x={px - 9} y={py - 8} width={18} height={15} rx={4} fill="#0a1020" />
              <text x={px} y={py + 4} textAnchor="middle" fontSize={10} fontWeight={800} fill="#94a3b8">{port}</text>
            </g>
          )
        })}
        {swBox('L')}
        {swBox('R')}
        {all.map((h) => {
          const [x, y] = hostPos(h)
          const isDst = hit.dst === h
          const isSrc = hit.src === h
          const got = hit.received.has(h)
          return (
            <g key={h} onClick={() => !busy && setSrc(h)} style={{ cursor: 'pointer' }}>
              <motion.circle cx={x} cy={y} r={19} animate={{ fill: isSrc ? '#92400e' : isDst ? '#14532d' : '#111a30' }} stroke={isSrc ? '#fbbf24' : isDst ? '#4ade80' : got ? '#7dd3fc' : src === h ? t.hex : '#475569'} strokeWidth={isSrc || isDst ? 4 : got ? 3 : 2} strokeDasharray={got && !isDst ? '4 3' : undefined} />
              <text x={x} y={y + 5} textAnchor="middle" fontSize={14} fontWeight={800} fill="#e2e8f0">{h}</text>
            </g>
          )
        })}
      </svg>
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
        <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full border-2 border-amber-400" />sender</span>
        <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full border-2 border-emerald-400" />destination</span>
        <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full border-2 border-dashed border-sky-300" />got a copy (flooded) but ignored it</span>
        <span>numbers = switch interfaces</span>
      </div>
      <Controls>
        <label className="flex items-center gap-1 text-xs text-slate-300">
          from
          <select value={src} onChange={(e) => setSrc(e.target.value)} className="rounded-lg border border-white/15 bg-slate-900 px-2 py-1 font-bold text-white">
            {all.map((h) => <option key={h}>{h}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-1 text-xs text-slate-300">
          to
          <select value={dst} onChange={(e) => setDst(e.target.value)} className="rounded-lg border border-white/15 bg-slate-900 px-2 py-1 font-bold text-white">
            {all.map((h) => <option key={h}>{h}</option>)}
          </select>
        </label>
        <Btn size="sm" icon={Send} disabled={busy || src === dst} onClick={() => send()}>
          Send frame
        </Btn>
        <label className="flex items-center gap-1.5 text-xs text-slate-300">
          <input type="checkbox" checked={reply} onChange={(e) => setReply(e.target.checked)} className="accent-sky-400" /> destination replies immediately
        </label>
      </Controls>
      <Controls>
        <Btn size="sm" variant="soft" icon={Play} disabled={busy} onClick={textbook}>
          Run problem-sheet Q4 (t=1…4)
        </Btn>
        <Btn size="sm" variant="ghost" icon={RotateCcw} disabled={busy} onClick={reset}>
          Clear tables
        </Btn>
      </Controls>

      <div className="grid gap-3 sm:grid-cols-2">
        {['L', 'R'].map((sw) => (
          <div key={sw} className="rounded-xl border border-white/10 p-2">
            <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">{sw === 'L' ? 'Left' : 'Right'} switch table</div>
            <div className="grid grid-cols-2 font-mono text-[11px] text-slate-500">
              <span>MAC addr</span><span>interface</span>
            </div>
            {order[sw].length === 0 && <div className="font-mono text-[11px] text-slate-600">(empty)</div>}
            {order[sw].map((m) => (
              <div key={m + tables[sw][m]} className={cx('grid grid-cols-2 rounded font-mono text-sm text-slate-100', fresh[`${sw}${m}`] && 'flash')}>
                <span>{m}</span>
                <span>{tables[sw][m]}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="max-h-64 space-y-2 overflow-y-auto">
        {log.map((l, k) => (
          <div key={k} className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-xs text-slate-300">
            <div className="mb-1 font-mono font-bold text-white">{l.label}</div>
            {l.events.map((e, j) => (
              <div key={j} className="leading-relaxed">
                <b className="text-slate-100">{e.sw}</b> (in on {e.inPort}):{' '}
                {e.learned ? <span className="text-amber-300">learns {e.src} on {e.inPort}; </span> : <span className="text-slate-500">already knows {e.src}; </span>}
                {e.action === 'flood' && <span className="text-rose-300">{e.dst} unknown → FLOOD to ports {e.outs.join(', ')}</span>}
                {e.action === 'forward' && <span className="text-emerald-300">{e.dst} is on {e.known} → forward on {e.known} only</span>}
                {e.action === 'drop' && <span className="text-slate-400">{e.dst} is on the same segment ({e.known}) → DROP</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============================ VLANs ============================ */

const VCOL = { 1: ['#38bdf8', 'ECSE'], 2: ['#fbbf24', 'CS'] }

export function VlanDemo() {
  const t = useTheme()
  const [v, setV] = useState([1, 1, 2, 2, 1, 2, 1, 2]) // ports 1-4 on switch 1, ports 5-8 on switch 2
  const [trunk, setTrunk] = useState(true)
  const [sel, setSel] = useState(0)
  const [mode, setMode] = useState('send')
  const [shot, setShot] = useState(null)

  const recv = useMemo(() => {
    if (shot === null) return []
    const sw = shot < 4 ? 0 : 1
    return v.map((vl, p) => ({ p, ok: p !== shot && vl === v[shot] && ((p < 4 ? 0 : 1) === sw || trunk) })).filter((x) => x.ok).map((x) => x.p)
  }, [shot, v, trunk])

  const click = (p) => {
    if (mode === 'assign') setV(v.map((x, i) => (i === p ? (x === 1 ? 2 : 1) : x)))
    else {
      setSel(p)
      setShot(null)
    }
  }
  const crossing = shot !== null && trunk && recv.some((p) => (p < 4 ? 0 : 1) !== (shot < 4 ? 0 : 1))

  const sw = (idx) => (
    <div className="rounded-2xl border-2 border-slate-600 bg-[#111a30] p-3">
      <div className="mb-2 text-center text-xs font-bold text-slate-300">Switch {idx + 1}</div>
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((k) => {
          const p = idx * 4 + k
          const [c] = VCOL[v[p]]
          const got = recv.includes(p)
          const me = shot === p
          return (
            <motion.button key={p} whileTap={{ scale: 0.9 }} onClick={() => click(p)} className={cx('relative flex h-14 flex-col items-center justify-center rounded-lg border-2 text-xs font-extrabold', sel === p && mode === 'send' && 'ring-2 ring-white')} style={{ borderColor: c, background: got ? `${c}88` : me ? `${c}55` : `${c}18`, color: '#e2e8f0' }}>
              <span>port {p + 1}</span>
              <span className="text-[9px] font-semibold" style={{ color: c }}>{VCOL[v[p]][1]}</span>
              {got && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1.5 -right-1.5 rounded-full bg-emerald-400 px-1 text-[8px] font-black text-slate-900">got it</motion.span>}
              {me && <span className="absolute -top-1.5 -right-1.5 rounded-full bg-white px-1 text-[8px] font-black text-slate-900">sent</span>}
            </motion.button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="space-y-3">
      <Controls>
        {[
          ['send', 'Send a broadcast'],
          ['assign', 'Re-assign port VLAN'],
        ].map(([k, l]) => (
          <button key={k} onClick={() => { setMode(k); setShot(null) }} className={cx('rounded-lg px-3 py-1.5 text-xs font-bold', mode === k ? cx(t.bgMid, t.textSoft) : 'bg-white/5 text-slate-400 hover:bg-white/10')}>
            {l}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-1.5 text-xs text-slate-300">
          <input type="checkbox" checked={trunk} onChange={(e) => { setTrunk(e.target.checked); setShot(null) }} className="accent-sky-400" /> trunk link between switches
        </label>
      </Controls>
      <div className="grid items-center gap-2 md:grid-cols-[1fr_auto_1fr]">
        {sw(0)}
        <div className="flex flex-col items-center justify-center py-1">
          <div className={cx('h-1.5 w-16 rounded-full md:w-20', trunk ? 'bg-slate-400' : 'bg-slate-800')} />
          <div className="mt-1 text-center text-[10px] text-slate-400">{trunk ? 'trunk port' : 'no link'}</div>
          {crossing && (
            <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} className="mt-1 rounded-md px-1.5 py-0.5 text-[9px] font-black text-slate-900" style={{ background: VCOL[v[shot]][0] }}>
              frame + VLAN ID tag
            </motion.div>
          )}
        </div>
        {sw(1)}
      </div>
      {mode === 'send' ? (
        <Controls>
          <Btn size="sm" icon={Send} onClick={() => setShot(sel)}>
            Broadcast from port {sel + 1}
          </Btn>
          <span className="text-xs text-slate-400">
            {shot === null ? 'Tap a port to choose the sender.' : recv.length ? `Reached ports ${recv.map((p) => p + 1).join(', ')} – the same VLAN only.` : 'Nobody else is in this VLAN (reachable).'}
          </span>
        </Controls>
      ) : (
        <div className="text-xs text-amber-200">Tap a port to move it to the other VLAN (dynamic membership).</div>
      )}
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-200">
        {mode === 'send' ? (
          <>
            <b>Traffic isolation</b>: frames sent from ECSE ports can only reach ECSE ports. Crossing VLANs needs <b>routing</b> (just like separate switches) – vendors sell combined switch + router boxes. Between switches a <b>trunk port</b> carries frames with their <b>VLAN ID</b> attached.
          </>
        ) : (
          <>A <b>port-based VLAN</b> groups switch ports so one physical switch acts as several virtual switches.</>
        )}
      </div>
    </div>
  )
}

/* ============================ data-centre tiers ============================ */

const TIERS = [
  { id: 'border', label: 'Border routers', y: 30, n: 2, info: 'Connections to outside the data centre.' },
  { id: 't1', label: 'Tier-1 (core) switches', y: 95, n: 4, info: 'Core switches. In the slides: each connects to ~16 Tier-2 switches below.' },
  { id: 't2', label: 'Tier-2 (aggregation) switches', y: 160, n: 4, info: 'Aggregation switches. Each connects to ~16 top-of-rack switches below.' },
  { id: 'tor', label: 'Top-of-rack (TOR / access) switches', y: 225, n: 6, info: 'One per rack, 100G–400G Ethernet to the blades.' },
  { id: 'rack', label: 'Server racks', y: 290, n: 6, info: '20–40 server blades (hosts) per rack.' },
]
const xs = (n) => Array.from({ length: n }, (_, i) => 120 + ((i + 0.5) * 420) / n)

export function DataCenter() {
  const t = useTheme()
  const [sel, setSel] = useState('tor')
  const [paths, setPaths] = useState(false)
  const info = TIERS.find((x) => x.id === sel)
  const X = Object.fromEntries(TIERS.map((tr) => [tr.id, xs(tr.n)]))
  const p1 = [['rack', 0], ['tor', 0], ['t2', 0], ['t1', 0], ['t2', 2], ['tor', 5], ['rack', 5]]
  const p2 = [['rack', 0], ['tor', 0], ['t2', 1], ['t1', 3], ['t2', 3], ['tor', 5], ['rack', 5]]
  const Y = Object.fromEntries(TIERS.map((tr) => [tr.id, tr.y]))
  const path = (p) => p.map(([id, k]) => `${X[id][k]},${Y[id] + 12}`).join(' ')
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 560 330" className="w-full rounded-xl bg-[#0a1020]">
        {TIERS.slice(0, -1).map((tr, ti) => {
          const nxt = TIERS[ti + 1]
          return X[tr.id].flatMap((x1, a) => X[nxt.id].map((x2, b) => (nxt.id === 'rack' ? (a === b ? <line key={`${tr.id}${a}${b}`} x1={x1} y1={tr.y + 12} x2={x2} y2={nxt.y + 12} stroke="#334155" strokeWidth={1.5} /> : null) : <line key={`${tr.id}${a}${b}`} x1={x1} y1={tr.y + 12} x2={x2} y2={nxt.y + 12} stroke="#1e293b" strokeWidth={1.2} />)))
        })}
        {paths && (
          <>
            <polyline points={path(p1)} fill="none" stroke="#fbbf24" strokeWidth={4} strokeLinejoin="round" className="flow-dash" strokeDasharray="8 6" />
            <polyline points={path(p2)} fill="none" stroke="#34d399" strokeWidth={4} strokeLinejoin="round" className="flow-dash" strokeDasharray="8 6" />
          </>
        )}
        {TIERS.map((tr) =>
          X[tr.id].map((x, k) => (
            <g key={`${tr.id}${k}`} onClick={() => setSel(tr.id)} style={{ cursor: 'pointer' }}>
              <rect x={x - (tr.id === 'rack' ? 18 : 16)} y={tr.y} width={tr.id === 'rack' ? 36 : 32} height={24} rx={tr.id === 'rack' ? 4 : 8} fill={sel === tr.id ? t.hex : '#111a30'} stroke={sel === tr.id ? '#fff' : '#64748b'} strokeWidth={2} />
            </g>
          )),
        )}
        {TIERS.map((tr) => (
          <text key={tr.id} x={8} y={tr.y + 16} fontSize={10} fontWeight={700} fill={sel === tr.id ? t.hex : '#64748b'}>
            {tr.label.split(' (')[0]}
          </text>
        ))}
      </svg>
      <Controls>
        <Btn size="sm" variant={paths ? 'soft' : 'ghost'} onClick={() => setPaths(!paths)}>
          {paths ? 'Hide' : 'Show'} two disjoint paths between rack 1 and rack 6
        </Btn>
      </Controls>
      <AnimatePresence mode="wait">
        <motion.div key={sel + paths} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cx('rounded-xl border p-3 text-sm text-slate-200', t.border, t.bgSoft)}>
          <b className="text-white">{info.label}.</b> {info.info}
          {paths && <div className="mt-1 text-slate-300">Rich interconnection → <b>increased throughput</b> (many paths) and <b>increased reliability</b> (redundancy).</div>}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
