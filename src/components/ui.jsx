import { useState } from 'react'
import { motion } from 'framer-motion'
import { MousePointerClick } from 'lucide-react'
import { cx } from '../lib/utils'
import { useTheme } from '../lib/theme'

export function Card({ className, children, ...rest }) {
  return (
    <div className={cx('rounded-xl border border-white/10 bg-white/[0.03] p-4', className)} {...rest}>
      {children}
    </div>
  )
}

/** The only boxed element inside a lesson: every interactive widget lives in one of these. */
export function Demo({ title, hint, children, className }) {
  return (
    <section className={cx('rounded-2xl border border-white/10 bg-[#101621]', className)}>
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b border-white/[0.06] px-4 py-2.5">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-100">
          <MousePointerClick size={14} className="text-blue-400" /> {title || 'Try it'}
        </h4>
        {hint && <span className="text-xs text-slate-500">{hint}</span>}
      </header>
      <div className="p-4">{children}</div>
    </section>
  )
}

const CALL = {
  tip: { label: 'Tip', c: 'text-slate-400', b: 'border-white/15' },
  trap: { label: 'Exam trap', c: 'text-rose-300', b: 'border-rose-400/50' },
  remember: { label: 'Remember', c: 'text-blue-300', b: 'border-blue-400/50' },
  past: { label: 'Seen in past tests', c: 'text-emerald-300', b: 'border-emerald-400/50' },
  slide: { label: 'From your slides', c: 'text-slate-400', b: 'border-white/15' },
}

/** Quiet side-note: a coloured rule + small label, no box. */
export function Callout({ kind = 'tip', title, children }) {
  const c = CALL[kind]
  return (
    <aside className={cx('border-l-2 py-0.5 pl-4 text-[15px] leading-relaxed text-slate-300', c.b)}>
      <div className={cx('mb-0.5 text-[11px] font-semibold uppercase tracking-wider', c.c)}>{title || c.label}</div>
      {children}
    </aside>
  )
}

/** Key term */
export function K({ children }) {
  return <span className="font-semibold text-white">{children}</span>
}

export function Mono({ children, className }) {
  return <code className={cx('rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-slate-100', className)}>{children}</code>
}

export function P({ children, className }) {
  return <p className={cx('text-[16px] leading-[1.7] text-slate-300', className)}>{children}</p>
}

export function Ul({ children, className }) {
  return <ul className={cx('space-y-2.5', className)}>{children}</ul>
}

export function Li({ children }) {
  return (
    <li className="flex gap-3 text-[16px] leading-[1.7] text-slate-300">
      <span className="mt-[11px] h-1 w-1 shrink-0 rounded-full bg-slate-500" />
      <span>{children}</span>
    </li>
  )
}

export function H({ children }) {
  return <h3 className="text-lg font-semibold text-white">{children}</h3>
}

export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, className, icon: Icon, type = 'button', title }) {
  const base = 'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition disabled:opacity-40 disabled:pointer-events-none select-none active:scale-[0.98]'
  const sizes = { sm: 'px-3 py-1.5 text-[13px]', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-[15px]' }
  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-400',
    ghost: 'border border-white/15 text-slate-200 hover:bg-white/[0.06]',
    soft: 'bg-white/10 text-slate-100 hover:bg-white/15',
    danger: 'bg-rose-500/15 text-rose-200 hover:bg-rose-500/25',
    good: 'bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25',
  }
  return (
    <button type={type} title={title} onClick={onClick} disabled={disabled} className={cx(base, sizes[size], variants[variant], className)}>
      {Icon && <Icon size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  )
}

export function Chip({ children, className, tone = 'slate' }) {
  const tones = {
    slate: 'bg-white/[0.07] text-slate-300',
    green: 'bg-emerald-500/15 text-emerald-300',
    red: 'bg-rose-500/15 text-rose-300',
    amber: 'bg-amber-500/15 text-amber-300',
    sky: 'bg-blue-500/15 text-blue-300',
    violet: 'bg-white/[0.07] text-slate-300',
  }
  return <span className={cx('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', tones[tone], className)}>{children}</span>
}

export function Priority({ level }) {
  const m = {
    high: ['Must know', 'text-slate-100'],
    med: ['Should know', 'text-slate-400'],
    low: ['Nice to have', 'text-slate-500'],
    bonus: ['Not on Test 2', 'text-slate-500'],
  }
  const [label, cls] = m[level] || m.med
  return <span className={cx('text-xs font-medium', cls)}>{label}</span>
}

export function Table({ head, rows, className, mono }) {
  return (
    <div className={cx('overflow-x-auto rounded-xl border border-white/10', className)}>
      <table className="w-full border-collapse text-left text-sm">
        {head && (
          <thead>
            <tr className="bg-white/[0.04] text-xs text-slate-400">
              {head.map((h, i) => (
                <th key={i} className="px-3 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-white/[0.06]">
              {r.map((c, j) => (
                <td key={j} className={cx('px-3 py-2.5 align-top leading-snug text-slate-300', mono && j === 0 && 'font-mono text-slate-100')}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** "Show answer" toggle for self-test questions */
export function Reveal({ q, children, label = 'Show answer' }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-[15px] font-medium text-white">{q}</div>
      {!open ? (
        <button onClick={() => setOpen(true)} className="mt-3 rounded-lg bg-white/10 px-3 py-1.5 text-[13px] font-medium text-slate-100 hover:bg-white/15">
          {label}
        </button>
      ) : (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 overflow-hidden text-[15px] leading-relaxed text-slate-300">
          {children}
        </motion.div>
      )}
    </div>
  )
}

export function Fade({ children, delay = 0, className }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.3 }} className={className}>
      {children}
    </motion.div>
  )
}

export function Stack({ children, className }) {
  return <div className={cx('space-y-6', className)}>{children}</div>
}

export function ProgressBar({ value, className }) {
  return (
    <div className={cx('h-1 w-full overflow-hidden rounded-full bg-white/10', className)}>
      <motion.div className="h-full rounded-full bg-blue-400" initial={false} animate={{ width: `${Math.max(0, Math.min(100, value))}%` }} transition={{ type: 'spring', stiffness: 120, damping: 22 }} />
    </div>
  )
}

/** little step-control bar used by many demos */
export function Controls({ children, className }) {
  return <div className={cx('flex flex-wrap items-center gap-2', className)}>{children}</div>
}

export function Bits({ s, className, highlight }) {
  return (
    <span className={cx('font-mono tracking-wider', className)}>
      {s.split('').map((c, i) => (
        <span key={i} className={highlight?.includes(i) ? 'text-amber-300' : undefined}>
          {c}
        </span>
      ))}
    </span>
  )
}
