import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cx } from '../lib/utils'
import { useTheme } from '../lib/theme'

/**
 * Sorting game. items: [{ text, cat }]  cats: [string]
 * Tap the right category for each statement – wrong taps shake.
 */
export default function Classify({ items, cats }) {
  const t = useTheme()
  const [done, setDone] = useState({})
  const [bad, setBad] = useState(null)
  const [misses, setMisses] = useState(0)
  const solved = Object.keys(done).length

  const choose = (i, c) => {
    if (done[i]) return
    if (items[i].cat === c) {
      setDone((d) => ({ ...d, [i]: c }))
      setBad(null)
    } else {
      setBad(`${i}:${c}`)
      setMisses((m) => m + 1)
      setTimeout(() => setBad(null), 450)
    }
  }

  return (
    <div className="space-y-2.5">
      {items.map((it, i) => (
        <motion.div
          key={i}
          layout
          className={cx('rounded-xl border p-3', done[i] ? 'border-emerald-400/40 bg-emerald-400/10' : 'border-white/10 bg-white/[0.03]')}
        >
          <div className="mb-2 flex items-start gap-2 text-sm text-slate-200">
            {done[i] && <Check size={16} className="mt-0.5 shrink-0 text-emerald-300" />}
            <span>{it.text}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {cats.map((c) => {
              const isDone = done[i] === c
              const isBad = bad === `${i}:${c}`
              return (
                <button
                  key={c}
                  disabled={!!done[i] && !isDone}
                  onClick={() => choose(i, c)}
                  className={cx(
                    'rounded-lg border px-2.5 py-1 text-xs font-semibold transition',
                    isDone && 'border-emerald-400 bg-emerald-400/20 text-emerald-200',
                    isBad && 'shake border-rose-400 bg-rose-400/20 text-rose-200',
                    !isDone && !isBad && (done[i] ? 'border-white/5 text-slate-600' : cx('border-white/15 text-slate-300 hover:bg-white/10')),
                  )}
                >
                  {c}
                </button>
              )
            })}
          </div>
        </motion.div>
      ))}
      <div className={cx('text-right text-xs', solved === items.length ? 'text-emerald-300' : 'text-slate-500')}>
        {solved === items.length ? `All sorted! ${misses === 0 ? 'No mistakes 🎯' : `${misses} wrong tap${misses > 1 ? 's' : ''}`}` : `${solved}/${items.length} sorted`}
      </div>
    </div>
  )
}
