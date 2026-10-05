import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, RotateCcw } from 'lucide-react'
import { useTheme } from '../lib/theme'
import { cx } from '../lib/utils'
import { Btn, Controls } from './ui'

const ROW = 60
const TONES = { good: '#34d399', bad: '#fb7185', warn: '#fbbf24', broadcast: '#fbbf24' }

/**
 * Sequence diagram that reveals one message at a time.
 * actors: [{ id, label, sub? }]
 * steps:  [{ from, to, label, note?, tone?, layers? }]   (from===to => "thinks" bubble)
 * extra:  (revealedCount) => ReactNode  – drawn under the diagram (tables, etc.)
 */
export default function Seq({ actors, steps, extra, className }) {
  const t = useTheme()
  const [n, setN] = useState(0)
  const [playing, setPlaying] = useState(false)
  const timer = useRef(null)
  const cols = actors.length
  const idx = (id) => actors.findIndex((a) => a.id === id)
  const x = (i) => ((i + 0.5) / cols) * 100

  useEffect(() => {
    if (!playing) return
    timer.current = setInterval(() => {
      setN((v) => {
        if (v >= steps.length) {
          setPlaying(false)
          return v
        }
        return v + 1
      })
    }, 1100)
    return () => clearInterval(timer.current)
  }, [playing, steps.length])

  const cur = n > 0 ? steps[n - 1] : null

  return (
    <div className={className}>
      {/* actor header */}
      <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {actors.map((a) => (
          <div key={a.id} className="flex flex-col items-center">
            <div className={cx('rounded-xl border px-3 py-1.5 text-center text-xs font-bold sm:text-sm', t.border, t.bgSoft, t.textSoft)}>
              {a.label}
            </div>
            {a.sub && <div className="mt-0.5 text-center font-mono text-[10px] text-slate-500">{a.sub}</div>}
          </div>
        ))}
      </div>

      {/* diagram body */}
      <div className="relative mt-2" style={{ height: steps.length * ROW }}>
        {actors.map((a, i) => (
          <div key={a.id} className="absolute top-0 bottom-0 border-l border-dashed border-white/15" style={{ left: `${x(i)}%` }} />
        ))}
        {steps.slice(0, n).map((s, k) => {
          const a = idx(s.from)
          const b = idx(s.to)
          const color = TONES[s.tone] || t.hex
          const top = k * ROW
          const isCur = k === n - 1
          if (a === b) {
            return (
              <motion.div
                key={k}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute flex -translate-x-1/2 items-center justify-center"
                style={{ top: top + 14, left: `${x(a)}%` }}
              >
                <span
                  className={cx('rounded-lg border px-2 py-1 text-[11px] font-medium sm:text-xs', isCur ? 'bg-slate-800 text-white' : 'bg-slate-900 text-slate-300')}
                  style={{ borderColor: color }}
                >
                  {s.label}
                </span>
              </motion.div>
            )
          }
          const right = b > a
          const lo = Math.min(a, b)
          const w = (Math.abs(b - a) / cols) * 100
          return (
            <div key={k} className="absolute" style={{ top, left: `${x(lo)}%`, width: `${w}%`, height: ROW }}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cx('absolute left-0 right-0 text-center text-[11px] font-semibold leading-tight sm:text-xs', isCur ? 'text-white' : 'text-slate-400')}
                style={{ top: 6 }}
              >
                {s.label}
              </motion.div>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                style={{ transformOrigin: right ? 'left' : 'right', top: 34, height: 2, background: color, opacity: isCur ? 1 : 0.55 }}
                className="absolute left-0 right-0"
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isCur ? 1 : 0.55 }}
                transition={{ delay: 0.35 }}
                className="absolute h-0 w-0"
                style={{
                  top: 30,
                  [right ? 'right' : 'left']: -1,
                  borderTop: '5px solid transparent',
                  borderBottom: '5px solid transparent',
                  [right ? 'borderLeft' : 'borderRight']: `9px solid ${color}`,
                }}
              />
            </div>
          )
        })}
      </div>

      {/* controls */}
      <Controls className="mt-3">
        <Btn variant="ghost" size="sm" icon={ChevronLeft} disabled={n === 0} onClick={() => { setPlaying(false); setN(n - 1) }}>
          Back
        </Btn>
        <Btn size="sm" icon={ChevronRight} disabled={n >= steps.length} onClick={() => { setPlaying(false); setN(n + 1) }}>
          {n === 0 ? 'Start' : 'Next message'}
        </Btn>
        <Btn variant="soft" size="sm" icon={Play} disabled={n >= steps.length || playing} onClick={() => { if (n >= steps.length) return; setPlaying(true) }}>
          Auto-play
        </Btn>
        <Btn variant="ghost" size="sm" icon={RotateCcw} onClick={() => { setPlaying(false); setN(0) }}>
          Reset
        </Btn>
        <span className="ml-auto font-mono text-xs text-slate-500">
          {n}/{steps.length}
        </span>
      </Controls>

      {/* detail panel */}
      <AnimatePresence mode="wait">
        {cur && (cur.note || cur.layers) && (
          <motion.div
            key={n}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-3"
          >
            {cur.note && <div className="text-sm leading-relaxed text-slate-200">{cur.note}</div>}
            {cur.layers && <Layers layers={cur.layers} />}
          </motion.div>
        )}
      </AnimatePresence>
      {extra && <div className="mt-3">{extra(n)}</div>}
    </div>
  )
}

const LAYER_COLORS = ['#475569', '#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981']

/** nested encapsulation boxes – outermost first */
export function Layers({ layers }) {
  const render = (i) => {
    if (i >= layers.length) return null
    const last = i === layers.length - 1
    return (
      <div
        className="rounded-lg border px-2 py-1.5 text-[11px] font-bold sm:text-xs"
        style={{ borderColor: LAYER_COLORS[i % LAYER_COLORS.length], background: `${LAYER_COLORS[i % LAYER_COLORS.length]}22` }}
      >
        <div className="mb-1 text-slate-200">{layers[i]}</div>
        {!last && render(i + 1)}
      </div>
    )
  }
  return <div className="mt-2">{render(0)}</div>
}
