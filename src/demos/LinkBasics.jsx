import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, Dices, RotateCcw, Send, Wrench } from 'lucide-react'
import { useTheme } from '../lib/theme'
import { cx, crcCheck, crcDivide, rand } from '../lib/utils'
import { Btn, Controls } from '../components/ui'

/* ======================= hop-by-hop link protocols ======================= */

const STOPS = [
  { a: 'Princeton', n: 'Laptop' },
  { a: 'JFK airport', n: 'Router' },
  { a: 'Geneva', n: 'Router' },
  { a: 'Lausanne', n: 'Server' },
]
const LEGS = [
  { a: 'limo', n: 'WiFi (802.11)', c: '#38bdf8' },
  { a: 'plane', n: 'Ethernet', c: '#a78bfa' },
  { a: 'train', n: 'another link protocol', c: '#fb7185' },
]

export function HopStack() {
  const t = useTheme()
  const [i, setI] = useState(0)
  const pos = (k) => `${10 + k * 26.6}%`
  return (
    <div className="space-y-3">
      <div className="relative h-44 overflow-hidden rounded-xl bg-[#0a1020]">
        {LEGS.map((l, k) => (
          <div key={k} className="absolute top-[58%]" style={{ left: pos(k), width: '26.6%' }}>
            <div className="h-1 rounded-full" style={{ background: i > k ? l.c : '#334155' }} />
            <div className="mt-1 text-center text-[11px] font-bold" style={{ color: i > k || i === k ? l.c : '#64748b' }}>
              {l.n}
            </div>
            <div className="text-center text-[10px] text-slate-500">({l.a})</div>
          </div>
        ))}
        {STOPS.map((s, k) => (
          <div key={k} className="absolute top-[58%] -translate-x-1/2 -translate-y-[40%]" style={{ left: pos(k) }}>
            <div className={cx('mx-auto h-4 w-4 rounded-full border-2', k <= i ? 'border-white bg-white/30' : 'border-slate-600 bg-slate-800')} />
            <div className="mt-8 text-center text-[10px] leading-tight text-slate-400">
              {s.n}
              <div className="text-slate-600">{s.a}</div>
            </div>
          </div>
        ))}
        {/* the datagram, wrapped in the current link's frame */}
        <motion.div animate={{ left: pos(i) }} transition={{ type: 'spring', stiffness: 80, damping: 16 }} className="absolute top-[14%] -translate-x-1/2">
          <motion.div
            key={i}
            initial={{ scale: 0.8, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-lg border-2 px-2 py-1.5 text-center"
            style={{ borderColor: LEGS[Math.min(i, 2)].c, background: `${LEGS[Math.min(i, 2)].c}22` }}
          >
            <div className="text-[9px] font-bold uppercase tracking-wide" style={{ color: LEGS[Math.min(i, 2)].c }}>
              {i >= 3 ? 'delivered' : `${LEGS[i].n.split(' ')[0]} frame`}
            </div>
            <div className="mt-0.5 rounded bg-amber-400 px-2 py-0.5 text-[10px] font-extrabold text-slate-900">datagram</div>
          </motion.div>
        </motion.div>
      </div>
      <Controls>
        <Btn size="sm" icon={ChevronRight} disabled={i >= 3} onClick={() => setI(i + 1)}>
          Next link
        </Btn>
        <Btn size="sm" variant="ghost" icon={RotateCcw} onClick={() => setI(0)}>
          Reset
        </Btn>
      </Controls>
      <div className="grid gap-1.5 text-xs sm:grid-cols-2">
        {[
          ['tourist', 'datagram'],
          ['transport segment', 'communication link'],
          ['transportation mode', 'link-layer protocol'],
          ['travel agent', 'routing algorithm'],
        ].map(([a, b]) => (
          <div key={a} className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-1.5">
            <span className="text-slate-400">{a}</span> <span className="text-slate-600">=</span> <b className="text-white">{b}</b>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ======================= parity ======================= */

const evenBit = (bits) => bits.reduce((a, b) => a ^ b, 0)

function makeGrid(rows, cols) {
  const g = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rand(2)))
  return withParity(g)
}
function withParity(data) {
  const rows = data.map((r) => [...r, evenBit(r)])
  const colPar = rows[0].map((_, c) => evenBit(rows.map((r) => r[c])))
  return [...rows, colPar]
}

export function ParityDemo() {
  const t = useTheme()
  const R = 4
  const C = 5
  const [sent, setSent] = useState(() => makeGrid(R, C))
  const [flips, setFlips] = useState([]) // list of "r,c"
  const recv = sent.map((row, r) => row.map((b, c) => (flips.includes(`${r},${c}`) ? 1 - b : b)))
  const badRows = recv.map((row, r) => (evenBit(row) ? r : -1)).filter((r) => r >= 0)
  const badCols = recv[0].map((_, c) => (evenBit(recv.map((r) => r[c])) ? c : -1)).filter((c) => c >= 0)

  const toggle = (r, c) => setFlips((f) => (f.includes(`${r},${c}`) ? f.filter((x) => x !== `${r},${c}`) : [...f, `${r},${c}`]))

  let diag
  if (!badRows.length && !badCols.length) {
    diag = flips.length ? { tone: 'bad', text: `All parities check out – but ${flips.length} bits are flipped! This error slipped through undetected.` } : { tone: 'good', text: 'Every row and column has even parity → no error detected.' }
  } else if (badRows.length === 1 && badCols.length === 1) {
    diag = { tone: 'good', text: `Exactly one row (${badRows[0]}) and one column (${badCols[0]}) fail → single-bit error at their intersection (row ${badRows[0]}, col ${badCols[0]}). Detected AND correctable: flip it back.`, fix: [badRows[0], badCols[0]] }
  } else {
    diag = { tone: 'warn', text: `${badRows.length} row(s) and ${badCols.length} column(s) fail → error detected, but the pattern doesn’t point to ONE bit, so it can’t be corrected. Ask for retransmission.` }
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-slate-400">
        Even parity, 2-D. Grid below is the <b className="text-slate-200">received</b> frame. <b className="text-amber-300">Tap any bit</b> (data or parity) to flip it, like noise on the wire.
      </div>
      <div className="overflow-x-auto pb-4 pr-5">
        <div className="mx-auto grid w-fit gap-1.5" style={{ gridTemplateColumns: `repeat(${C + 1}, 2.6rem)` }}>
          {recv.map((row, r) =>
            row.map((b, c) => {
              const isFlip = flips.includes(`${r},${c}`)
              const isParity = r === R || c === C
              const rowBad = badRows.includes(r)
              const colBad = badCols.includes(c)
              const target = diag.fix && diag.fix[0] === r && diag.fix[1] === c
              return (
                <motion.button
                  key={`${r}-${c}`}
                  whileTap={{ scale: 0.88 }}
                  onClick={() => toggle(r, c)}
                  className={cx(
                    'relative h-10 rounded-lg border font-mono text-base font-bold transition',
                    isFlip ? 'border-amber-400 bg-amber-400/25 text-amber-200' : isParity ? 'border-blue-400/40 bg-blue-500/15 text-blue-200' : 'border-white/10 bg-white/[0.05] text-slate-100',
                    target && 'ring-2 ring-emerald-400',
                  )}
                >
                  {b}
                  {(rowBad || colBad) && c === C + 0 && rowBad && <span className="absolute -right-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-rose-400" />}
                  {colBad && r === R && <span className="absolute -bottom-2.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-rose-400" />}
                </motion.button>
              )
            }),
          )}
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3 text-[11px] text-slate-400">
        <span>
          <span className="mr-1 inline-block h-2.5 w-2.5 rounded bg-blue-400/50" />
          parity bits
        </span>
        <span>
          <span className="mr-1 inline-block h-2.5 w-2.5 rounded bg-amber-400/60" />
          flipped
        </span>
        <span>
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-rose-400" /> failing row / column
        </span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={diag.text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cx('rounded-xl border p-3 text-sm', diag.tone === 'good' ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100' : diag.tone === 'bad' ? 'border-rose-400/40 bg-rose-400/10 text-rose-100' : 'border-amber-400/40 bg-amber-400/10 text-amber-100')}>
          {diag.text}
        </motion.div>
      </AnimatePresence>
      <Controls>
        {diag.fix && (
          <Btn size="sm" variant="good" icon={Wrench} onClick={() => toggle(diag.fix[0], diag.fix[1])}>
            Correct it
          </Btn>
        )}
        <Btn size="sm" variant="ghost" icon={Dices} onClick={() => { setSent(makeGrid(R, C)); setFlips([]) }}>
          New data
        </Btn>
        <Btn size="sm" variant="ghost" icon={RotateCcw} onClick={() => setFlips([])}>
          Clear flips
        </Btn>
      </Controls>
    </div>
  )
}

/* ======================= 1-D parity (tiny) ======================= */

export function Parity1D() {
  const t = useTheme()
  const [data, setData] = useState([1, 0, 1, 1, 0, 0, 1])
  const [flips, setFlips] = useState([])
  const par = evenBit(data)
  const word = [...data, par]
  const recv = word.map((b, i) => (flips.includes(i) ? 1 - b : b))
  const ones = recv.reduce((a, b) => a + b, 0)
  const ok = ones % 2 === 0
  return (
    <div className="space-y-3">
      <div className="text-xs text-slate-400">
        Even parity: add one bit so the total number of 1s is even. <b className="text-amber-300">Tap bits</b> to flip them in transit.
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {recv.map((b, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.88 }}
            onClick={() => setFlips((f) => (f.includes(i) ? f.filter((x) => x !== i) : [...f, i]))}
            className={cx('h-11 w-11 rounded-lg border font-mono text-lg font-bold', flips.includes(i) ? 'border-amber-400 bg-amber-400/25 text-amber-200' : i === 7 ? 'border-blue-400/50 bg-blue-500/15 text-blue-200' : 'border-white/10 bg-white/[0.05] text-slate-100')}
          >
            {b}
          </motion.button>
        ))}
      </div>
      <div className="text-center font-mono text-xs text-slate-400">
        number of 1s = <b className="text-white">{ones}</b> → {ones % 2 === 0 ? 'even' : 'odd'}
      </div>
      <div className={cx('rounded-xl border p-3 text-sm', ok ? (flips.length ? 'border-rose-400/40 bg-rose-400/10 text-rose-100' : 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100') : 'border-amber-400/40 bg-amber-400/10 text-amber-100')}>
        {ok ? (flips.length ? `Looks fine to the receiver – but ${flips.length} bits flipped. An EVEN number of flips cancels out and goes undetected!` : 'Even → no error detected.') : 'Odd → error detected! But there’s no way to tell which bit, so it can only be detected, not corrected.'}
      </div>
      <Btn size="sm" variant="ghost" icon={RotateCcw} onClick={() => setFlips([])}>
        Clear flips
      </Btn>
    </div>
  )
}

/* ======================= Internet checksum ======================= */

const toBin = (n, w = 16) => n.toString(2).padStart(w, '0')

export function ChecksumDemo() {
  const t = useTheme()
  const [words, setWords] = useState(['0110011001100110', '0101010101010101', '0000111100001111'])
  const [shown, setShown] = useState(0)
  const valid = words.every((w) => /^[01]{16}$/.test(w))

  const steps = useMemo(() => {
    if (!valid) return []
    let acc = parseInt(words[0], 2)
    const out = []
    for (let i = 1; i < words.length; i++) {
      const b = parseInt(words[i], 2)
      let sum = acc + b
      const carry = sum > 0xffff
      const raw = toBin(sum, 17)
      if (carry) sum = (sum & 0xffff) + 1
      out.push({ a: toBin(acc), b: words[i], raw, carry, res: toBin(sum & 0xffff) })
      acc = sum & 0xffff
    }
    return { out, final: toBin(acc), cs: toBin(~acc & 0xffff) }
  }, [words, valid])

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        {words.map((w, i) => (
          <label key={i} className="flex items-center gap-2 text-xs text-slate-400">
            word {i + 1}
            <input
              value={w}
              maxLength={16}
              onChange={(e) => { setWords(words.map((x, k) => (k === i ? e.target.value.replace(/[^01]/g, '') : x))); setShown(0) }}
              className={cx('flex-1 rounded-lg border bg-black/30 px-3 py-1.5 font-mono text-sm tracking-wider text-white outline-none', /^[01]{16}$/.test(w) ? 'border-white/15' : 'border-rose-400/60')}
            />
          </label>
        ))}
      </div>
      {!valid ? (
        <div className="text-sm text-rose-300">Each word must be exactly 16 bits (0s and 1s).</div>
      ) : (
        <>
          <div className="space-y-2 font-mono text-[13px]">
            {steps.out.map((s, i) => (
              <AnimatePresence key={i}>
                {shown > i && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                    <div className="text-slate-400">{s.a}</div>
                    <div className="text-slate-400">+ {s.b}</div>
                    <div className="border-t border-white/20 text-slate-200">{s.raw} {s.carry && <span className="text-amber-300">← carry out!</span>}</div>
                    {s.carry && <div className="text-amber-300">wrap the carry around (+1) → {s.res}</div>}
                    {!s.carry && <div className="text-slate-500">no carry → {s.res}</div>}
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
            {shown > steps.out.length && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-3 text-emerald-100">
                <div>sum = {steps.final}</div>
                <div>
                  checksum = one’s complement (flip every bit) = <b>{steps.cs}</b>
                </div>
              </motion.div>
            )}
          </div>
          <Controls>
            <Btn size="sm" icon={ChevronRight} disabled={shown > steps.out.length} onClick={() => setShown(shown + 1)}>
              {shown === 0 ? 'Add word 1 + word 2' : shown < steps.out.length ? 'Add the next word' : shown === steps.out.length ? 'Take the complement' : 'Done'}
            </Btn>
            <Btn size="sm" variant="ghost" icon={RotateCcw} onClick={() => setShown(0)}>
              Reset
            </Btn>
          </Controls>
        </>
      )}
    </div>
  )
}

/* ======================= CRC ======================= */

const PRESETS = [
  { label: 'Slide example', d: '101110', g: '1001' },
  { label: 'Problem sheet 2.2', d: '10011111', g: '1001' },
  { label: 'Problem sheet 2.3', d: '10011100', g: '1001' },
  { label: 'Test 2023 Q19', d: '11111', g: '101010' },
  { label: 'Test 2024 Q14', d: '10101010', g: '111111' },
]

export function CrcDemo() {
  const t = useTheme()
  const [d, setD] = useState('101110')
  const [g, setG] = useState('1001')
  const [shown, setShown] = useState(0)
  const [flip, setFlip] = useState(null)
  const ok = /^[01]{1,14}$/.test(d) && /^1[01]{1,8}$/.test(g)

  const calc = useMemo(() => {
    if (!ok) return null
    const { steps, remainder, padded } = crcDivide(d, g)
    const states = [padded.split('')]
    steps.forEach((s) => {
      const cur = [...states[states.length - 1]]
      for (let j = 0; j < g.length; j++) cur[s.at + j] = String(+cur[s.at + j] ^ +g[j])
      states.push(cur)
    })
    return { steps, remainder, padded, states }
  }, [d, g, ok])

  const frame = ok ? d + calc.remainder : ''
  const recvFrame = flip === null ? frame : frame.split('').map((c, i) => (i === flip ? (c === '1' ? '0' : '1') : c)).join('')
  const check = ok ? crcCheck(recvFrame, g) : ''
  const r = ok ? g.length - 1 : 0

  return (
    <div className="space-y-3">
      <Controls>
        {PRESETS.map((p) => (
          <button key={p.label} onClick={() => { setD(p.d); setG(p.g); setShown(0); setFlip(null) }} className={cx('rounded-lg px-2.5 py-1 text-[11px] font-semibold', d === p.d && g === p.g ? cx(t.bgMid, t.textSoft) : 'bg-white/5 text-slate-400 hover:bg-white/10')}>
            {p.label}
          </button>
        ))}
      </Controls>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-xs text-slate-400">
          D (data bits)
          <input value={d} maxLength={14} onChange={(e) => { setD(e.target.value.replace(/[^01]/g, '')); setShown(0); setFlip(null) }} className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 font-mono text-sm tracking-widest text-white outline-none" />
        </label>
        <label className="text-xs text-slate-400">
          G (generator, starts with 1)
          <input value={g} maxLength={9} onChange={(e) => { setG(e.target.value.replace(/[^01]/g, '')); setShown(0); setFlip(null) }} className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 font-mono text-sm tracking-widest text-white outline-none" />
        </label>
      </div>
      {!ok ? (
        <div className="text-sm text-rose-300">Enter D (binary) and a generator G starting with 1 (at least 2 bits).</div>
      ) : (
        <>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-200">
            G has <b>{g.length}</b> bits → <b>r = {r}</b> CRC bits. Append {r} zeros to D (that’s D·2<sup>{r}</sup>), then divide by G using <b>XOR</b> (mod-2). The remainder is R.
          </div>
          <div className="space-y-1 overflow-x-auto rounded-xl bg-black/30 p-3 font-mono text-sm">
            {calc.states.slice(0, shown + 1).map((st, k) => {
              const at = k === 0 ? null : calc.steps[k - 1].at
              return (
                <motion.div key={k} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                  <span className="w-14 shrink-0 text-[10px] text-slate-500">{k === 0 ? 'D·2^r' : `XOR #${k}`}</span>
                  <span className="tracking-[0.2em]">
                    {st.map((b, i) => {
                      const inWin = at !== null && i >= at && i < at + g.length
                      const isRem = k === calc.states.length - 1 && i >= st.length - r
                      return (
                        <span key={i} className={isRem ? 'rounded bg-emerald-400/25 text-emerald-200' : inWin ? 'rounded bg-amber-400/25 text-amber-200' : k === 0 && i >= d.length ? 'text-sky-300' : 'text-slate-300'}>
                          {b}
                        </span>
                      )
                    })}
                  </span>
                  {at !== null && <span className="text-[10px] text-slate-500">leading 1 at bit {at} → XOR G ({g})</span>}
                </motion.div>
              )
            })}
          </div>
          <Controls>
            <Btn size="sm" icon={ChevronRight} disabled={shown >= calc.steps.length} onClick={() => setShown(shown + 1)}>
              {calc.steps.length === 0 ? 'Nothing to divide' : 'Next XOR'}
            </Btn>
            <Btn size="sm" variant="soft" disabled={shown >= calc.steps.length} onClick={() => setShown(calc.steps.length)}>
              Show all
            </Btn>
            <Btn size="sm" variant="ghost" icon={RotateCcw} onClick={() => setShown(0)}>
              Reset
            </Btn>
          </Controls>
          {shown >= calc.steps.length && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-3 text-sm text-emerald-100">
                <b>R = {calc.remainder}</b> (the last {r} bits). Transmit <span className="font-mono">{d}<b className="text-emerald-300">{calc.remainder}</b></span>.
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <div className="mb-2 text-xs text-slate-400">Receiver divides what arrives by G. Tap a bit to corrupt it:</div>
                <div className="flex flex-wrap gap-1">
                  {recvFrame.split('').map((b, i) => (
                    <button key={i} onClick={() => setFlip(flip === i ? null : i)} className={cx('h-8 w-8 rounded-md border font-mono text-sm font-bold', flip === i ? 'border-amber-400 bg-amber-400/25 text-amber-200' : i >= d.length ? 'border-emerald-400/40 text-emerald-200' : 'border-white/15 text-slate-200')}>
                      {b}
                    </button>
                  ))}
                </div>
                <div className={cx('mt-2 text-sm', /^0+$/.test(check) ? 'text-emerald-300' : 'text-rose-300')}>
                  remainder = <span className="font-mono">{check}</span> → {/^0+$/.test(check) ? 'zero → no error detected' : 'NON-zero → error detected, frame dropped'}
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
