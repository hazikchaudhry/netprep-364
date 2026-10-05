import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../lib/theme'
import { cx } from '../lib/utils'
import { Btn } from '../components/ui'

// Slide 36: neighbours of u are v, x, w.  d_v(z)=5, d_x(z)=3, d_w(z)=3
const OPTS = [
  { v: 'v', c: 2, d: 5 },
  { v: 'x', c: 1, d: 3 },
  { v: 'w', c: 5, d: 3 },
]

export default function BFExample() {
  const t = useTheme()
  const [shown, setShown] = useState(0)
  const min = Math.min(...OPTS.map((o) => o.c + o.d))
  return (
    <div className="space-y-3">
      <div className="text-sm text-slate-300">
        Node <b>u</b> wants the cost to <b>z</b>. Its neighbours are v, x, w and they have told it their own costs to z.
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {OPTS.map((o, i) => {
          const on = shown > i
          const win = shown === 3 && o.c + o.d === min
          return (
            <motion.div key={o.v} animate={{ scale: win ? 1.04 : 1 }} className={cx('rounded-xl border p-3 text-center', win ? 'border-emerald-400 bg-emerald-400/15' : on ? 'border-white/20 bg-white/[0.06]' : 'border-white/10 bg-white/[0.02]')}>
              <div className="text-xs text-slate-400">via neighbour {o.v}</div>
              <div className="mt-1 font-mono text-sm text-slate-200">
                c(u,{o.v}) + d<sub>{o.v}</sub>(z)
              </div>
              <div className="mt-1 font-mono text-lg font-bold">
                {on ? (
                  <span className={win ? 'text-emerald-300' : 'text-white'}>
                    {o.c} + {o.d} = {o.c + o.d}
                  </span>
                ) : (
                  <span className="text-slate-600">? + ?</span>
                )}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                cost to neighbour {o.c} · neighbour’s cost to z {o.d}
              </div>
            </motion.div>
          )
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Btn size="sm" disabled={shown >= 3} onClick={() => setShown(shown + 1)}>
          {shown === 0 ? 'Try the first neighbour' : shown < 3 ? 'Try the next neighbour' : 'Done'}
        </Btn>
        <Btn size="sm" variant="ghost" onClick={() => setShown(0)}>
          Reset
        </Btn>
        {shown === 3 && (
          <span className="text-sm text-emerald-200">
            d<sub>u</sub>(z) = min&#123;7, 4, 8&#125; = <b>4</b> (go via x). “Product cost + delivery cost”.
          </span>
        )}
      </div>
    </div>
  )
}
