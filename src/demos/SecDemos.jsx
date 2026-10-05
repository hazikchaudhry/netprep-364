import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, Pause, Play } from 'lucide-react'
import { cx } from '../lib/utils'
import { Btn, Controls } from '../components/ui'

const MODES = {
  c: {
    label: 'Confidentiality',
    title: 'Mallory reads the message',
    text: 'Mallory silently copies what Alice sends. Bob still receives the message untouched, so nobody notices. Confidentiality is broken: someone unauthorised has seen it.',
    frames: [
      { main: { x: 8, label: 'A' } },
      { main: { x: 50, label: 'A' }, copy: true },
      { main: { x: 90, label: 'A' }, copy: true },
      { main: { x: 90, label: 'A' }, copy: true },
    ],
  },
  i: {
    label: 'Integrity',
    title: 'Mallory changes the message',
    text: 'The message arrives, but it isn’t what Alice sent: A became A′. Data integrity = not altered in an unauthorised manner. This is the classic man-in-the-middle.',
    frames: [
      { main: { x: 8, label: 'A' } },
      { main: { x: 50, label: 'A' } },
      { main: { x: 50, label: 'A′', warn: true } },
      { main: { x: 90, label: 'A′', warn: true } },
    ],
  },
  a: {
    label: 'Availability',
    title: 'Mallory stops it getting through',
    text: 'The message (or the service) can’t be reached or used: overloaded by a DoS attack, locked by ransomware, or deleted by an insider. Availability = timely, reliable access.',
    frames: [
      { main: { x: 8, label: 'A' } },
      { main: { x: 40, label: 'A' } },
      { main: { x: 50, label: '✕', warn: true } },
      { main: { x: 50, label: '✕', warn: true } },
    ],
  },
}

export function MalloryDemo() {
  const [mode, setMode] = useState('c')
  const [f, setF] = useState(0)
  const [run, setRun] = useState(true)
  useEffect(() => {
    setF(0)
  }, [mode])
  useEffect(() => {
    if (!run) return
    const id = setInterval(() => setF((v) => (v + 1) % 4), 1000)
    return () => clearInterval(id)
  }, [run])
  const m = MODES[mode]
  const fr = m.frames[f]

  return (
    <div className="space-y-4">
      <Controls>
        {Object.entries(MODES).map(([k, v]) => (
          <button key={k} onClick={() => setMode(k)} className={cx('rounded-lg px-3 py-1.5 text-[13px] font-medium', mode === k ? 'bg-blue-500 text-white' : 'bg-white/[0.06] text-slate-300 hover:bg-white/10')}>
            {v.label}
          </button>
        ))}
        <Btn size="sm" variant="ghost" icon={run ? Pause : Play} onClick={() => setRun(!run)} className="ml-auto">
          {run ? 'Pause' : 'Play'}
        </Btn>
      </Controls>

      <div className="relative h-44 overflow-hidden rounded-xl bg-[#0b0f17]">
        {/* line */}
        <div className="absolute left-[8%] right-[8%] top-[42%] h-px bg-slate-700" />
        {[
          ['Alice', 8],
          ['Bob', 90],
        ].map(([n, x]) => (
          <div key={n} className="absolute top-[42%] -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${x}%` }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-slate-800 text-sm font-semibold text-white">{n[0]}</div>
            <div className="mt-1 text-xs text-slate-400">{n}</div>
          </div>
        ))}
        {/* Mallory */}
        <div className="absolute left-1/2 top-[78%] -translate-x-1/2 -translate-y-1/2 text-center">
          <div className={cx('mx-auto flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold', fr.copy || f >= 1 ? 'border-rose-400 bg-rose-500/20 text-rose-200' : 'border-white/15 bg-slate-800 text-slate-300')}>M</div>
          <div className="mt-0.5 text-xs text-slate-400">Mallory</div>
        </div>
        {/* message */}
        <motion.div
          animate={{ left: `${fr.main.x}%` }}
          transition={{ type: 'spring', stiffness: 90, damping: 16 }}
          className={cx('absolute top-[42%] flex h-8 min-w-8 -translate-x-1/2 -translate-y-[170%] items-center justify-center rounded-md px-2 text-sm font-bold', fr.main.warn ? 'bg-rose-400 text-slate-900' : 'bg-blue-400 text-slate-900')}
        >
          {fr.main.label}
        </motion.div>
        <AnimatePresence>
          {fr.copy && (
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute left-1/2 top-[56%] flex h-7 min-w-7 -translate-x-[150%] items-center justify-center rounded-md bg-rose-400/90 px-2 text-xs font-bold text-slate-900">
              <Eye size={12} className="mr-1" /> A
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={mode} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-[15px] leading-relaxed text-slate-300">
          <span className="font-semibold text-white">{m.title}.</span> {m.text}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
