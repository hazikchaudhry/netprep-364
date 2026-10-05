import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cx } from '../lib/utils'

/**
 * Click-to-explain packet/frame diagram.
 * rows: [[{ name, size, desc, w? }]]  – each inner array is drawn as one row
 */
export default function FieldDiagram({ rows, title, footer }) {
  const flat = rows.flat()
  const [sel, setSel] = useState(flat[0]?.name)
  const cur = flat.find((f) => f.name === sel)
  return (
    <div>
      {title && <div className="mb-2 text-[13px] font-medium text-slate-400">{title}</div>}
      <div className="space-y-1.5">
        {rows.map((row, ri) => (
          <div key={ri} className="flex gap-1.5">
            {row.map((f) => {
              const active = f.name === sel
              return (
                <button
                  key={f.name}
                  onClick={() => setSel(f.name)}
                  className={cx('min-w-0 rounded-lg border px-1.5 py-2.5 text-center transition', active ? 'border-blue-400 bg-blue-500/20' : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08]')}
                  style={{ flex: `${f.w ?? 1} 1 0` }}
                >
                  <div className="truncate text-[12px] font-semibold text-white">{f.name}</div>
                  {f.size && <div className="mt-0.5 font-mono text-[10px] text-slate-400">{f.size}</div>}
                </button>
              )
            })}
          </div>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {cur && (
          <motion.div key={cur.name} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 text-[15px] leading-relaxed text-slate-300">
            <span className="font-semibold text-white">{cur.name}</span>
            {cur.size && <span className="ml-2 font-mono text-xs text-slate-500">{cur.size}</span>}
            <div className="mt-0.5">{cur.desc}</div>
          </motion.div>
        )}
      </AnimatePresence>
      {footer && <div className="mt-2 text-xs text-slate-500">{footer}</div>}
    </div>
  )
}
