import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, RotateCcw, X } from 'lucide-react'
import { cx, crcDivide, pick, rand } from '../lib/utils'
import { Btn, Callout } from '../components/ui'

const TABS = [
  ['crc', 'CRC'],
  ['parity', '2-D parity'],
  ['bf', 'Bellman-Ford'],
  ['aloha', 'Slotted ALOHA'],
]

function Result({ ok, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cx('rounded-xl border p-4 text-[15px] leading-relaxed', ok ? 'border-emerald-400/40 bg-emerald-400/[0.07] text-emerald-100' : 'border-rose-400/40 bg-rose-400/[0.07] text-rose-100')}>
      <div className="mb-1 flex items-center gap-1.5 font-semibold">
        {ok ? <Check size={16} /> : <X size={16} />} {ok ? 'Correct' : 'Not quite'}
      </div>
      {children}
    </motion.div>
  )
}

/* ---------------- CRC ---------------- */
function CrcPractice() {
  const make = () => {
    const g = pick(['1001', '101', '1011', '10011', '101010', '111111', '1101'])
    const len = 6 + rand(5)
    const d = '1' + Array.from({ length: len - 1 }, () => rand(2)).join('')
    return { d, g }
  }
  const [p, setP] = useState(make)
  const [ans, setAns] = useState('')
  const [shown, setShown] = useState(false)
  const calc = useMemo(() => crcDivide(p.d, p.g), [p])
  const r = p.g.length - 1
  const ok = ans.trim() === calc.remainder
  const next = () => {
    setP(make())
    setAns('')
    setShown(false)
  }
  return (
    <div className="space-y-5">
      <div className="text-[16px] text-slate-300">
        Data <b className="font-mono text-white tracking-widest">D = {p.d}</b>, generator <b className="font-mono text-white tracking-widest">G = {p.g}</b>. What are the CRC bits R?
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={ans}
          onChange={(e) => setAns(e.target.value.replace(/[^01]/g, ''))}
          onKeyDown={(e) => e.key === 'Enter' && ans && setShown(true)}
          maxLength={r}
          placeholder={`${r} bits`}
          className="w-40 rounded-lg border border-white/15 bg-black/30 px-3 py-2 font-mono text-lg tracking-widest text-white outline-none focus:border-blue-400"
        />
        <Btn disabled={ans.length !== r} onClick={() => setShown(true)}>
          Check
        </Btn>
        <Btn variant="ghost" icon={RotateCcw} onClick={next}>
          New problem
        </Btn>
      </div>
      <div className="text-sm text-slate-500">Hint: G has {p.g.length} bits, so r = {r}. Append {r} zeros to D, then XOR G under each leading 1.</div>
      {shown && (
        <>
          <Result ok={ok}>
            R = <b className="font-mono tracking-widest">{calc.remainder}</b>. Transmitted frame: <span className="font-mono">{p.d}{calc.remainder}</span>
          </Result>
          <div className="overflow-x-auto rounded-xl bg-black/30 p-3 font-mono text-[13px] text-slate-300">
            <div className="mb-1 text-slate-500">working (D followed by {r} zeros):</div>
            <div className="tracking-widest">{calc.padded}</div>
            {calc.steps.map((s, k) => (
              <div key={k} className="tracking-widest">
                <span style={{ paddingLeft: `${s.at * 0.6}em` }} className="text-amber-300">
                  {s.gen}
                </span>
                <span className="ml-3 text-slate-600">XOR at bit {s.at}</span>
              </div>
            ))}
            <div className="mt-1 text-emerald-300">remainder: {calc.remainder}</div>
          </div>
        </>
      )}
    </div>
  )
}

/* ---------------- 2-D parity ---------------- */
function ParityPractice() {
  const R = 4
  const C = 8
  const make = () => {
    const data = Array.from({ length: R }, () => Array.from({ length: C }, () => rand(2)))
    const rows = data.map((r) => [...r, r.reduce((a, b) => a ^ b, 0)])
    const col = rows[0].map((_, c) => rows.reduce((a, r) => a ^ r[c], 0))
    const grid = [...rows, col]
    const fr = rand(R + 1)
    const fc = rand(C + 1)
    const recv = grid.map((r, i) => r.map((b, j) => (i === fr && j === fc ? 1 - b : b)))
    return { recv, fr, fc }
  }
  const [p, setP] = useState(make)
  const [sel, setSel] = useState(null)
  const [done, setDone] = useState(false)
  const badRows = p.recv.map((r, i) => (r.reduce((a, b) => a ^ b, 0) ? i : -1)).filter((i) => i >= 0)
  const badCols = p.recv[0].map((_, j) => (p.recv.reduce((a, r) => a ^ r[j], 0) ? j : -1)).filter((j) => j >= 0)
  const ok = sel && sel[0] === p.fr && sel[1] === p.fc
  return (
    <div className="space-y-5">
      <div className="text-[16px] text-slate-300">
        Even parity, 2-D. The last column and last row are parity bits. <b className="text-white">Exactly one bit has been flipped.</b> Tap it, then check.
      </div>
      <div className="overflow-x-auto pb-1">
        <div className="grid w-fit gap-1" style={{ gridTemplateColumns: `repeat(${C + 1}, 2.1rem)` }}>
          {p.recv.map((row, i) =>
            row.map((b, j) => {
              const parityCell = i === R || j === C
              const picked = sel && sel[0] === i && sel[1] === j
              const answer = done && i === p.fr && j === p.fc
              return (
                <button
                  key={`${i}-${j}`}
                  onClick={() => !done && setSel([i, j])}
                  className={cx('h-8 rounded-md border font-mono text-sm font-semibold', answer ? 'border-emerald-400 bg-emerald-400/25 text-emerald-200' : picked ? 'border-amber-400 bg-amber-400/25 text-amber-200' : parityCell ? 'border-blue-400/30 bg-blue-500/10 text-blue-200' : 'border-white/10 bg-white/[0.04] text-slate-100')}
                >
                  {b}
                </button>
              )
            }),
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Btn disabled={!sel || done} onClick={() => setDone(true)}>
          Check
        </Btn>
        <Btn variant="ghost" icon={RotateCcw} onClick={() => { setP(make()); setSel(null); setDone(false) }}>
          New problem
        </Btn>
        {sel && !done && <span className="text-sm text-slate-500">your pick: x,y = {sel[1]},{sel[0]}</span>}
      </div>
      <div className="text-sm text-slate-500">Answer format from the problem sheet: <b>x,y = column,row</b>, counting from 0 at the top-left.</div>
      {done && (
        <Result ok={ok}>
          The flipped bit is at <b className="font-mono">{p.fc},{p.fr}</b> (column {p.fc}, row {p.fr}). Failing rows: {badRows.join(', ') || 'none'}; failing columns: {badCols.join(', ') || 'none'}. Their intersection is the flipped bit.
        </Result>
      )}
    </div>
  )
}

/* ---------------- Bellman-Ford ---------------- */
function BfPractice() {
  const make = () => {
    const names = ['v', 'w', 'x', 'y'].slice(0, 3 + rand(2))
    return { dest: 'z', nb: names.map((n) => ({ n, c: 1 + rand(8), d: 1 + rand(12) })) }
  }
  const [p, setP] = useState(make)
  const [ans, setAns] = useState('')
  const [shown, setShown] = useState(false)
  const sums = p.nb.map((x) => x.c + x.d)
  const best = Math.min(...sums)
  const ok = Number(ans) === best
  return (
    <div className="space-y-5">
      <div className="text-[16px] text-slate-300">
        Node <b className="text-white">u</b> has these neighbours. Use Bellman-Ford: <span className="font-mono text-white">d_u(z) = min_v &#123; c(u,v) + d_v(z) &#125;</span>. What is d<sub>u</sub>(z)?
      </div>
      <div className="grid gap-2 sm:grid-cols-4">
        {p.nb.map((x) => (
          <div key={x.n} className="rounded-xl border border-white/10 p-3 text-center">
            <div className="text-xs text-slate-500">neighbour {x.n}</div>
            <div className="mt-1 font-mono text-sm text-slate-200">c(u,{x.n}) = {x.c}</div>
            <div className="font-mono text-sm text-slate-200">d_{x.n}(z) = {x.d}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input value={ans} onChange={(e) => setAns(e.target.value.replace(/\D/g, ''))} onKeyDown={(e) => e.key === 'Enter' && ans && setShown(true)} placeholder="answer" className="w-32 rounded-lg border border-white/15 bg-black/30 px-3 py-2 font-mono text-lg text-white outline-none focus:border-blue-400" />
        <Btn disabled={!ans} onClick={() => setShown(true)}>
          Check
        </Btn>
        <Btn variant="ghost" icon={RotateCcw} onClick={() => { setP(make()); setAns(''); setShown(false) }}>
          New problem
        </Btn>
      </div>
      {shown && (
        <Result ok={ok}>
          <div className="font-mono text-sm">
            min&#123; {p.nb.map((x) => `${x.c}+${x.d}`).join(', ')} &#125; = min&#123; {sums.join(', ')} &#125; = <b>{best}</b> (via {p.nb[sums.indexOf(best)].n})
          </div>
        </Result>
      )}
    </div>
  )
}

/* ---------------- slotted ALOHA ---------------- */
function AlohaPractice() {
  const make = () => ({ N: 2 + rand(7), p: pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5]) })
  const [q, setQ] = useState(make)
  const [ans, setAns] = useState('')
  const [shown, setShown] = useState(false)
  const val = q.N * q.p * Math.pow(1 - q.p, q.N - 1)
  const ok = Math.abs(Number(ans) - val * 100) <= 1
  return (
    <div className="space-y-5">
      <div className="text-[16px] text-slate-300">
        Slotted ALOHA with <b className="text-white">N = {q.N}</b> nodes, each transmitting in a slot with probability <b className="text-white">p = {q.p}</b>. What fraction of slots carry a successful transmission? (answer as a %, within 1)
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input value={ans} onChange={(e) => setAns(e.target.value.replace(/[^\d.]/g, ''))} onKeyDown={(e) => e.key === 'Enter' && ans && setShown(true)} placeholder="%" className="w-32 rounded-lg border border-white/15 bg-black/30 px-3 py-2 font-mono text-lg text-white outline-none focus:border-blue-400" />
        <Btn disabled={!ans} onClick={() => setShown(true)}>
          Check
        </Btn>
        <Btn variant="ghost" icon={RotateCcw} onClick={() => { setQ(make()); setAns(''); setShown(false) }}>
          New problem
        </Btn>
      </div>
      <div className="text-sm text-slate-500">Formula: N · p · (1 − p)^(N−1)</div>
      {shown && (
        <Result ok={ok}>
          <div className="font-mono text-sm">
            {q.N} × {q.p} × (1 − {q.p})^{q.N - 1} = {q.N * q.p} × {Math.pow(1 - q.p, q.N - 1).toFixed(4)} = <b>{(val * 100).toFixed(1)}%</b>
          </div>
          <div className="mt-1 text-sm">The best possible value (p = 1/N) for N = {q.N} is {(Math.pow(1 - 1 / q.N, q.N - 1) * 100).toFixed(1)}%, tending to 37% as N grows.</div>
        </Result>
      )}
    </div>
  )
}

export default function CalcLab({ go }) {
  const [tab, setTab] = useState('crc')
  return (
    <div className="mx-auto max-w-[720px] px-5 pb-24 pt-10 sm:px-6 sm:pt-14">
      <h1 className="text-[32px] font-bold leading-tight tracking-tight text-white">Calculation lab</h1>
      <p className="mt-2 text-[17px] text-slate-400">Endless fresh problems like the ones on your problem sheets and past papers. Work it out on paper first.</p>

      <div className="mt-8 flex flex-wrap gap-2">
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={cx('rounded-lg px-3.5 py-1.5 text-[14px] font-medium', tab === k ? 'bg-blue-500 text-white' : 'bg-white/[0.06] text-slate-300 hover:bg-white/10')}>
            {l}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-[#101621] p-5">
        {tab === 'crc' && <CrcPractice />}
        {tab === 'parity' && <ParityPractice />}
        {tab === 'bf' && <BfPractice />}
        {tab === 'aloha' && <AlohaPractice />}
      </div>

      <h2 className="mt-12 text-lg font-semibold text-white">Other worked problems</h2>
      <div className="mt-3 divide-y divide-white/[0.07] border-y border-white/[0.07] text-[15px]">
        {[
          ['Dijkstra table, problem-sheet graph', 'nc-linkstate', 'Use “You try”, choose the problem-sheet graph'],
          ['Distance-vector tables, problem-sheet Q3', 'nc-dv', 'Tap any cell to see its Bellman-Ford working'],
          ['Frame addresses at each hop, problem-sheet Q3', 'll-addr', 'Hide the values and quiz yourself'],
          ['Self-learning switch tables, problem-sheet Q4', 'll-switch', 'Run t=1…4 and compare with the answers'],
        ].map(([t, id, s]) => (
          <button key={id} onClick={() => go(`/lesson/${id}`)} className="flex w-full items-center justify-between gap-4 py-3 text-left hover:text-blue-300">
            <span>
              <span className="font-medium text-white">{t}</span>
              <span className="block text-sm text-slate-500">{s}</span>
            </span>
            <span className="text-slate-600">→</span>
          </button>
        ))}
      </div>
      <div className="mt-8">
        <Callout kind="tip">These are the calculation types that have actually appeared: CRC (2023, 2024 past tests) and everything on the two problem sheets.</Callout>
      </div>
    </div>
  )
}
