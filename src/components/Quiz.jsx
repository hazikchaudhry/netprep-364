import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, RotateCcw, Trophy, X } from 'lucide-react'
import confetti from 'canvas-confetti'
import { cx, shuffle } from '../lib/utils'
import { useTheme } from '../lib/theme'
import { useProgress } from '../lib/store.jsx'
import { Btn, Chip, ProgressBar } from './ui'

const LETTERS = ['A', 'B', 'C', 'D', 'E']

export function prepare(questions) {
  return questions.map((q) => ({ ...q, opts: shuffle(q.options.map((text, i) => ({ text, i }))) }))
}

export default function Quiz({ questions, onFinish, finishLabel = 'Done', title }) {
  const t = useTheme()
  const { record } = useProgress()
  const [round, setRound] = useState(0)
  const [pool, setPool] = useState(questions)
  const prepared = useMemo(() => prepare(pool), [pool, round]) // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState(null)
  const [results, setResults] = useState([])
  const [finished, setFinished] = useState(false)

  if (!pool.length) return <div className="text-slate-400">No questions for this selection yet.</div>

  const q = prepared[i]
  const correctPos = q ? q.opts.findIndex((o) => o.i === q.answer) : -1

  const pickOpt = (pos) => {
    if (picked !== null) return
    setPicked(pos)
    const ok = pos === correctPos
    record(q.id, ok)
    setResults((r) => [...r, { q, ok }])
  }

  const next = () => {
    if (i + 1 >= prepared.length) {
      setFinished(true)
      const right = results.filter((r) => r.ok).length
      if (right === prepared.length) confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 } })
      return
    }
    setI(i + 1)
    setPicked(null)
  }

  const restart = (qs) => {
    setPool(qs)
    setRound((r) => r + 1)
    setI(0)
    setPicked(null)
    setResults([])
    setFinished(false)
  }

  if (finished) {
    const right = results.filter((r) => r.ok).length
    const missed = results.filter((r) => !r.ok).map((r) => pool.find((p) => p.id === r.q.id))
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 text-center">
        <Trophy size={40} className={cx('mx-auto', t.text)} />
        <div className="text-3xl font-extrabold text-white">
          {right}/{prepared.length}
        </div>
        <div className="text-slate-400">
          {right === prepared.length ? 'Perfect. Lock it in.' : right >= prepared.length * 0.7 ? 'Solid – check the ones you missed.' : 'Go back over the steps, then retry.'}
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          {results.map((r, k) => (
            <span key={k} className={cx('flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold', r.ok ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300')}>
              {k + 1}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {missed.length > 0 && (
            <Btn variant="soft" icon={RotateCcw} onClick={() => restart(missed)}>
              Retry {missed.length} missed
            </Btn>
          )}
          <Btn variant="ghost" icon={RotateCcw} onClick={() => restart(questions)}>
            Redo all
          </Btn>
          {onFinish && <Btn onClick={() => onFinish({ right, total: prepared.length })}>{finishLabel}</Btn>}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-slate-400">
          {title ? `${title} · ` : ''}Q{i + 1}/{prepared.length}
        </span>
        <ProgressBar value={((i + (picked !== null ? 1 : 0)) / prepared.length) * 100} className="flex-1" />
        {q.tag === 'past' && <Chip tone="green">past-test style</Chip>}
        {q.tag === 'calc' && <Chip tone="amber">calculation</Chip>}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={`${round}-${i}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }} className="space-y-3">
          <div className="whitespace-pre-line text-[17px] font-semibold leading-snug text-white">{q.q}</div>
          <div className="space-y-2">
            {q.opts.map((o, pos) => {
              const isPicked = picked === pos
              const isRight = pos === correctPos
              const show = picked !== null
              return (
                <button
                  key={pos}
                  onClick={() => pickOpt(pos)}
                  disabled={show}
                  className={cx(
                    'flex w-full items-start gap-3 rounded-xl border px-3.5 py-2.5 text-left text-[15px] transition',
                    !show && 'border-white/10 bg-white/[0.04] text-slate-200 hover:border-white/30 hover:bg-white/[0.08]',
                    show && isRight && 'border-emerald-400/70 bg-emerald-400/15 text-emerald-100',
                    show && isPicked && !isRight && 'shake border-rose-400/70 bg-rose-400/15 text-rose-100',
                    show && !isPicked && !isRight && 'border-white/5 text-slate-500',
                  )}
                >
                  <span className={cx('mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold', show && isRight ? 'bg-emerald-400 text-slate-900' : show && isPicked ? 'bg-rose-400 text-slate-900' : 'bg-white/10')}>
                    {show && isRight ? <Check size={14} /> : show && isPicked ? <X size={14} /> : LETTERS[pos]}
                  </span>
                  <span className="whitespace-pre-line">{o.text}</span>
                </button>
              )
            })}
          </div>
          <AnimatePresence>
            {picked !== null && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                <div className={cx('rounded-xl border p-3 text-sm leading-relaxed text-slate-200', t.border, t.bgSoft)}>
                  <span className={cx('mr-1 font-bold', picked === correctPos ? 'text-emerald-300' : 'text-rose-300')}>
                    {picked === correctPos ? 'Correct.' : 'Not quite.'}
                  </span>
                  {q.why}
                </div>
                <div className="mt-3 flex justify-end">
                  <Btn onClick={next}>{i + 1 >= prepared.length ? 'See score' : 'Next question'}</Btn>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
