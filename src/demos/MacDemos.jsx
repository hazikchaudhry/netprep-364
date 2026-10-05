import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Pause, Play, RotateCcw, Zap } from 'lucide-react'
import { useTheme } from '../lib/theme'
import { cx, rand } from '../lib/utils'
import { Btn, Controls } from '../components/ui'

/* ============================ TDMA / FDMA ============================ */

const STATION_COLORS = ['#38bdf8', '#a78bfa', '#fb7185', '#fbbf24', '#34d399', '#f97316']

export function TdmaFdma() {
  const t = useTheme()
  const [mode, setMode] = useState('tdma')
  const [active, setActive] = useState([true, false, true, true, false, false])
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((v) => v + 1), 500)
    return () => clearInterval(id)
  }, [])
  const used = active.filter(Boolean).length
  const cur = tick % 18 // 3 frames × 6 slots

  return (
    <div className="space-y-3">
      <Controls>
        {[
          ['tdma', 'TDMA (time slots)'],
          ['fdma', 'FDMA (frequency bands)'],
        ].map(([k, l]) => (
          <button key={k} onClick={() => setMode(k)} className={cx('rounded-lg px-3 py-1.5 text-xs font-bold', mode === k ? cx(t.bgMid, t.textSoft) : 'bg-white/5 text-slate-400 hover:bg-white/10')}>
            {l}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400">tap a station to give it (or take away) data →</span>
      </Controls>
      <div className="flex flex-wrap gap-1.5">
        {active.map((a, i) => (
          <button key={i} onClick={() => setActive(active.map((v, k) => (k === i ? !v : v)))} className={cx('rounded-lg border px-3 py-1 text-xs font-bold', a ? 'text-slate-950' : 'border-white/15 text-slate-500')} style={a ? { background: STATION_COLORS[i], borderColor: STATION_COLORS[i] } : undefined}>
            Station {i + 1}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-[#0a1020] p-3">
        {mode === 'tdma' ? (
          <div>
            <div className="mb-1 text-[11px] text-slate-500">time →  (3 rounds of a 6-slot frame; the whole channel rate is used by ONE station at a time)</div>
            <div className="grid grid-cols-6 gap-1 sm:grid-cols-[repeat(18,minmax(0,1fr))]">
              {Array.from({ length: 18 }).map((_, s) => {
                const st = s % 6
                const on = active[st]
                const now = s === cur
                return (
                  <div key={s} className={cx('flex h-12 items-center justify-center rounded-md text-[10px] font-bold', !on && 'hatch text-slate-600', now && 'ring-2 ring-white')} style={on ? { background: STATION_COLORS[st], color: '#0b1020' } : undefined}>
                    {on ? st + 1 : 'idle'}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-1 text-[11px] text-slate-500">frequency ↑  (each station owns a fixed band, all the time)</div>
            <div className="space-y-1">
              {[...active.keys()].reverse().map((st) => (
                <div key={st} className={cx('flex h-8 items-center rounded-md px-3 text-xs font-bold', !active[st] && 'hatch text-slate-600')} style={active[st] ? { background: STATION_COLORS[st], color: '#0b1020' } : undefined}>
                  band {st + 1} – {active[st] ? `station ${st + 1} transmitting` : 'idle (wasted)'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-200">
        {used} of 6 stations have data → only <b>{Math.round((used / 6) * 100)}%</b> of the channel is used; the rest sits <b>idle</b>. A lone sender only ever gets <b>1/N</b> of the bandwidth.
      </div>
    </div>
  )
}

/* ============================ slotted ALOHA ============================ */

export function AlohaSim() {
  const t = useTheme()
  const [N, setN] = useState(5)
  const [p, setP] = useState(0.2)
  const [run, setRun] = useState(true)
  const [slots, setSlots] = useState([])
  const [stats, setStats] = useState({ s: 0, c: 0, e: 0 })
  const ref = useRef({ N, p })
  ref.current = { N, p }

  useEffect(() => {
    if (!run) return
    const id = setInterval(() => {
      const { N: n, p: pp } = ref.current
      let tx = 0
      for (let i = 0; i < n; i++) if (Math.random() < pp) tx++
      const kind = tx === 0 ? 'E' : tx === 1 ? 'S' : 'C'
      setSlots((s) => [...s.slice(-59), kind])
      setStats((st) => ({ s: st.s + (kind === 'S'), c: st.c + (kind === 'C'), e: st.e + (kind === 'E') }))
    }, 120)
    return () => clearInterval(id)
  }, [run])

  const total = stats.s + stats.c + stats.e
  const eff = total ? stats.s / total : 0
  const theory = N * p * Math.pow(1 - p, N - 1)
  const best = Math.pow(1 - 1 / N, N - 1)
  const reset = () => {
    setSlots([])
    setStats({ s: 0, c: 0, e: 0 })
  }
  const col = { S: 'bg-emerald-400', C: 'bg-rose-400', E: 'bg-slate-700' }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-slate-300">
          nodes N: <b className="font-mono text-white">{N}</b>
          <input type="range" min={2} max={20} value={N} onChange={(e) => { setN(+e.target.value); reset() }} className="mt-1 block w-full accent-sky-400" />
        </label>
        <label className="text-xs text-slate-300">
          each node transmits with probability p: <b className="font-mono text-white">{p.toFixed(2)}</b>
          <input type="range" min={0.02} max={1} step={0.01} value={p} onChange={(e) => { setP(+e.target.value); reset() }} className="mt-1 block w-full accent-violet-400" />
        </label>
      </div>
      <div className="rounded-xl bg-[#0a1020] p-3">
        <div className="flex flex-wrap gap-1">
          {slots.map((k, i) => (
            <motion.div key={i + k} initial={{ scale: 0.4 }} animate={{ scale: 1 }} className={cx('flex h-6 w-6 items-center justify-center rounded text-[10px] font-extrabold', col[k], k === 'E' ? 'text-slate-400' : 'text-slate-900')}>
              {k}
            </motion.div>
          ))}
          {!slots.length && <div className="text-xs text-slate-500">…waiting for slots</div>}
        </div>
        <div className="mt-2 flex gap-3 text-[11px] text-slate-400">
          <span><b className="text-emerald-300">S</b> success (exactly 1 sender)</span>
          <span><b className="text-rose-300">C</b> collision (2+)</span>
          <span><b className="text-slate-400">E</b> empty (0)</span>
        </div>
      </div>
      <Controls>
        <Btn size="sm" icon={run ? Pause : Play} variant="soft" onClick={() => setRun(!run)}>
          {run ? 'Pause' : 'Run'}
        </Btn>
        <Btn size="sm" variant="ghost" icon={RotateCcw} onClick={reset}>
          Reset
        </Btn>
      </Controls>
      <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        {[
          ['measured efficiency', `${(eff * 100).toFixed(0)}%`],
          ['theory: Np(1−p)^(N−1)', `${(theory * 100).toFixed(0)}%`],
          ['best possible (p = 1/N)', `${(best * 100).toFixed(0)}%`],
          ['N → ∞ limit (1/e)', '37%'],
        ].map(([a, b]) => (
          <div key={a} className="rounded-xl border border-white/10 bg-white/[0.04] p-2">
            <div className="font-mono text-lg font-bold text-white">{b}</div>
            <div className="text-[10px] text-slate-400">{a}</div>
          </div>
        ))}
      </div>
      <div className="text-xs text-slate-400">Set p ≈ 1/N ({(1 / N).toFixed(2)}) → on average ONE node tries per slot → best efficiency. Too low = lots of empty slots. Too high = lots of collisions.</div>
    </div>
  )
}

export function AlohaChart() {
  const t = useTheme()
  const pts = (f) => Array.from({ length: 121 }, (_, i) => {
    const G = (i / 120) * 4
    return `${40 + (G / 4) * 330},${190 - f(G) * 420}`
  }).join(' ')
  const slotted = (G) => G * Math.exp(-G)
  const pure = (G) => G * Math.exp(-2 * G)
  return (
    <svg viewBox="0 0 400 220" className="w-full rounded-xl bg-[#0a1020]">
      {[0, 0.1, 0.2, 0.3, 0.4].map((v) => (
        <g key={v}>
          <line x1={40} y1={190 - v * 420} x2={370} y2={190 - v * 420} stroke="#1e293b" />
          <text x={34} y={194 - v * 420} textAnchor="end" fontSize={9} fill="#64748b">
            {v}
          </text>
        </g>
      ))}
      <polyline points={pts(slotted)} fill="none" stroke={t.hex} strokeWidth={3} />
      <polyline points={pts(pure)} fill="none" stroke="#fb7185" strokeWidth={3} />
      <circle cx={40 + (1 / 4) * 330} cy={190 - slotted(1) * 420} r={5} fill={t.hex} />
      <text x={40 + (1 / 4) * 330 + 8} y={190 - slotted(1) * 420 - 8} fontSize={11} fontWeight={700} fill={t.hex}>
        slotted: max 1/e ≈ 0.37
      </text>
      <circle cx={40 + (0.5 / 4) * 330} cy={190 - pure(0.5) * 420} r={5} fill="#fb7185" />
      <text x={40 + (0.5 / 4) * 330 + 8} y={190 - pure(0.5) * 420 - 8} fontSize={11} fontWeight={700} fill="#fb7185">
        pure: max 1/2e ≈ 0.18
      </text>
      <text x={205} y={212} textAnchor="middle" fontSize={10} fill="#94a3b8">
        offered load G (average frames per slot)
      </text>
      <text x={8} y={20} fontSize={10} fill="#94a3b8">
        efficiency
      </text>
    </svg>
  )
}

/* ============================ CSMA collisions ============================ */

export function CsmaTimeline() {
  const t = useTheme()
  const [d, setD] = useState(120) // propagation delay (time for signal to cross the cable)
  const [tb, setTb] = useState(60) // when B decides to transmit (after A started at 0)
  const X1 = 70
  const X2 = 470
  const Y0 = 40
  const collide = tb < d
  const tc = (d + tb) / 2 // time of collision (space-time intersection)
  const xc = X1 + ((X2 - X1) * tc) / d
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 540 340" className="w-full rounded-xl bg-[#0a1020]">
        <text x={X1} y={22} textAnchor="middle" fontSize={13} fontWeight={800} fill="#e2e8f0">A</text>
        <text x={X2} y={22} textAnchor="middle" fontSize={13} fontWeight={800} fill="#e2e8f0">B</text>
        <line x1={X1} y1={Y0} x2={X1} y2={330} stroke="#334155" strokeWidth={2} />
        <line x1={X2} y1={Y0} x2={X2} y2={330} stroke="#334155" strokeWidth={2} />
        <text x={500} y={Y0 + 4} fontSize={10} fill="#64748b">t=0</text>
        <text x={4} y={200} fontSize={10} fill="#64748b" transform="rotate(-90 12 200)">time ↓</text>
        {/* A's front */}
        <line x1={X1} y1={Y0} x2={X2} y2={Y0 + d} stroke={t.hex} strokeWidth={3} />
        <text x={X1 + 8} y={Y0 + 16} fontSize={10} fill={t.hex}>A starts (senses idle)</text>
        {/* B */}
        <line x1={X2 - 8} y1={Y0 + tb} x2={X2} y2={Y0 + tb} stroke="#fbbf24" strokeWidth={3} />
        {collide ? (
          <>
            <line x1={X2} y1={Y0 + tb} x2={xc} y2={Y0 + tc} stroke="#fbbf24" strokeWidth={3} />
            <motion.circle key={`${d}-${tb}`} cx={xc} cy={Y0 + tc} r={10} fill="#fb7185" initial={{ scale: 0 }} animate={{ scale: [0, 1.6, 1] }} />
            <text x={xc} y={Y0 + tc - 16} textAnchor="middle" fontSize={11} fontWeight={800} fill="#fda4af">💥 collision</text>
            <text x={X2 - 10} y={Y0 + tb - 6} textAnchor="end" fontSize={10} fill="#fbbf24">B senses idle → sends</text>
            <line x1={X2 - 4} y1={Y0 + d} x2={X2} y2={Y0 + d} stroke="#94a3b8" strokeDasharray="2 2" />
            <text x={X2 - 8} y={Y0 + d + 12} textAnchor="end" fontSize={10} fill="#94a3b8">A’s signal reaches B</text>
          </>
        ) : (
          <>
            <circle cx={X2} cy={Y0 + tb} r={6} fill="#34d399" />
            <text x={X2 - 12} y={Y0 + tb + 4} textAnchor="end" fontSize={10} fill="#6ee7b7">B senses BUSY → defers</text>
            <line x1={X2 - 4} y1={Y0 + d} x2={X2} y2={Y0 + d} stroke="#94a3b8" strokeDasharray="2 2" />
            <text x={X2 - 12} y={Y0 + d - 6} textAnchor="end" fontSize={10} fill="#94a3b8">A’s signal arrives here</text>
          </>
        )}
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-slate-300">
          propagation delay (cable length): <b className="font-mono text-white">{d}</b>
          <input type="range" min={30} max={240} value={d} onChange={(e) => setD(+e.target.value)} className="mt-1 block w-full accent-sky-400" />
        </label>
        <label className="text-xs text-slate-300">
          B decides to send at time: <b className="font-mono text-white">{tb}</b>
          <input type="range" min={0} max={260} value={tb} onChange={(e) => setTb(+e.target.value)} className="mt-1 block w-full accent-amber-400" />
        </label>
      </div>
      <div className={cx('rounded-xl border p-3 text-sm', collide ? 'border-rose-400/40 bg-rose-400/10 text-rose-100' : 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100')}>
        {collide ? (
          <>
            B decides to send <b>before A’s signal has reached it</b> (propagation delay), so the cable still “sounds” idle → <b>collision</b>. The whole packet time is wasted (plain CSMA). With <b>CSMA/CD</b> both abort as soon as they detect it.
          </>
        ) : (
          <>A’s signal reaches B before B tries, so B senses a busy channel and <b>defers</b>. Longer cable / more delay → bigger window where collisions can happen.</>
        )}
      </div>
    </div>
  )
}

/* ============================ binary exponential backoff ============================ */

export function BackoffDemo() {
  const t = useTheme()
  const [hist, setHist] = useState([])
  const m = hist.length
  const last = hist[hist.length - 1]
  const collide = () => {
    const mm = Math.min(hist.length + 1, 10)
    const k = rand(2 ** mm)
    setHist([...hist, { m: hist.length + 1, k, range: 2 ** mm - 1 }])
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Btn variant="danger" icon={Zap} onClick={collide} disabled={m >= 16}>
          {m === 0 ? 'Send a frame → collision!' : 'Collide again'}
        </Btn>
        <Btn variant="ghost" size="sm" icon={RotateCcw} onClick={() => setHist([])}>
          Success – reset
        </Btn>
        {m >= 16 && <span className="text-xs text-rose-300">16 collisions: the NIC gives up.</span>}
      </div>
      <div className="min-h-[88px] rounded-xl bg-[#0a1020] p-3">
        {last ? (
          <>
            <div className="mb-2 text-xs text-slate-400">
              After collision #{last.m}: pick K at random from <b className="font-mono text-white">&#123;0, 1, …, {last.range}&#125;</b> (2<sup>{Math.min(last.m, 10)}</sup> − 1)
            </div>
            <div className="flex flex-wrap gap-1">
              {last.range < 64 ? (
                Array.from({ length: last.range + 1 }).map((_, i) => (
                  <motion.div key={`${last.m}-${i}`} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.012 }} className={cx('flex h-6 min-w-6 items-center justify-center rounded text-[10px] font-bold', i === last.k ? 'bg-amber-400 text-slate-900 ring-2 ring-white' : 'bg-white/10 text-slate-400')}>
                    {i}
                  </motion.div>
                ))
              ) : (
                <div className="text-xs text-slate-400">…{last.range + 1} possible values (too many to draw)</div>
              )}
            </div>
            <div className="mt-2 text-sm text-slate-200">
              K = <b className="text-amber-300">{last.k}</b> → wait <b>{last.k} × 512 bit times</b> ({(last.k * 51.2).toFixed(1)} µs on 10 Mbps Ethernet), then sense the channel again.
            </div>
          </>
        ) : (
          <div className="text-sm text-slate-500">Press the red button to make a collision happen.</div>
        )}
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-300">
        More collisions → <b>bigger</b> random range → longer typical wait. The range doubles each time, so colliding nodes quickly stop picking the same K.
      </div>
    </div>
  )
}

/* ============================ polling / token passing ============================ */

export function TokenRing() {
  const t = useTheme()
  const [mode, setMode] = useState('token')
  const [has, setHas] = useState([true, false, true, false, true, false])
  const [i, setI] = useState(0)
  const [log, setLog] = useState('')
  const hasRef = useRef(has)
  hasRef.current = has
  const modeRef = useRef(mode)
  modeRef.current = mode
  useEffect(() => {
    const id = setInterval(() => {
      setI((v) => {
        const n = (v + 1) % 6
        setLog(hasRef.current[n] ? `node ${n + 1} has data → ${modeRef.current === 'token' ? 'transmits while holding the token' : 'is polled and transmits'}` : `node ${n + 1} has nothing → ${modeRef.current === 'token' ? 'passes the token on' : 'told “nothing to send”, master moves on'}`)
        return n
      })
    }, 1100)
    return () => clearInterval(id)
  }, [])
  const R = 78
  const pos = (k) => [150 + R * Math.sin((k / 6) * Math.PI * 2), 110 - R * Math.cos((k / 6) * Math.PI * 2)]
  return (
    <div className="space-y-3">
      <Controls>
        {[
          ['token', 'Token passing'],
          ['poll', 'Polling'],
        ].map(([k, l]) => (
          <button key={k} onClick={() => setMode(k)} className={cx('rounded-lg px-3 py-1.5 text-xs font-bold', mode === k ? cx(t.bgMid, t.textSoft) : 'bg-white/5 text-slate-400 hover:bg-white/10')}>
            {l}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400">tap a node to toggle “has data”</span>
      </Controls>
      <svg viewBox="0 0 300 220" className="mx-auto w-full max-w-md rounded-xl bg-[#0a1020]">
        {mode === 'token' && <circle cx={150} cy={110} r={R} fill="none" stroke="#334155" strokeWidth={2} strokeDasharray="5 5" />}
        {mode === 'poll' && (
          <>
            {has.map((_, k) => {
              const [x, y] = pos(k)
              return <line key={k} x1={150} y1={110} x2={x} y2={y} stroke={k === i ? '#fbbf24' : '#334155'} strokeWidth={k === i ? 3 : 1.5} className={k === i ? 'flow-dash' : ''} strokeDasharray={k === i ? '6 4' : undefined} />
            })}
            <circle cx={150} cy={110} r={22} fill="#4c1d95" stroke="#c4b5fd" strokeWidth={2} />
            <text x={150} y={114} textAnchor="middle" fontSize={10} fontWeight={800} fill="#ede9fe">master</text>
          </>
        )}
        {has.map((h, k) => {
          const [x, y] = pos(k)
          const now = k === i
          return (
            <g key={k} onClick={() => setHas(has.map((v, j) => (j === k ? !v : v)))} style={{ cursor: 'pointer' }}>
              <circle cx={x} cy={y} r={17} fill={h ? '#14532d' : '#111a30'} stroke={now ? '#fbbf24' : h ? '#4ade80' : '#475569'} strokeWidth={now ? 4 : 2} />
              <text x={x} y={y + 4} textAnchor="middle" fontSize={12} fontWeight={800} fill="#e2e8f0">{k + 1}</text>
            </g>
          )
        })}
        {mode === 'token' && (
          <motion.g animate={{ x: pos(i)[0] - 150, y: pos(i)[1] - 110 }} transition={{ type: 'spring', stiffness: 90, damping: 14 }}>
            <rect x={140} y={92} width={20} height={14} rx={4} fill="#fbbf24" />
            <text x={150} y={102} textAnchor="middle" fontSize={9} fontWeight={900} fill="#451a03">T</text>
          </motion.g>
        )}
      </svg>
      <AnimatePresence mode="wait">
        <motion.div key={log} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[2.5rem] rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-center text-sm text-slate-200">
          {log || 'watching…'}
        </motion.div>
      </AnimatePresence>
      <div className="text-xs text-slate-400">
        Concerns for both: <b>overhead</b>, <b>latency</b>, <b>single point of failure</b> ({mode === 'token' ? 'if the token is lost' : 'the master'}). Bluetooth uses polling; FDDI / token ring use tokens.
      </div>
    </div>
  )
}
