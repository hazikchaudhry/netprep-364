import { useState } from 'react'
import { Pin, PinOff, Printer } from 'lucide-react'
import { CHEAT, LINES_TARGET, lineCount } from '../data/cheatsheet'
import { MODULES } from '../data/modules'
import { useProgress } from '../lib/store.jsx'
import { cx } from '../lib/utils'
import { Btn, ProgressBar } from '../components/ui'

export default function Cheat() {
  const { pins, togglePin } = useProgress()
  const [view, setView] = useState('all')
  const [mod, setMod] = useState('all')

  const pinned = CHEAT.filter((c) => pins[c.id])
  const used = pinned.reduce((a, c) => a + lineCount(c), 0)
  const list = (view === 'mine' ? pinned : CHEAT).filter((c) => mod === 'all' || c.mod === mod)

  const pinHot = () => CHEAT.filter((c) => c.hot && !pins[c.id]).forEach((c) => togglePin(c.id))

  const Tab = ({ k, children }) => (
    <button onClick={() => setView(k)} className={cx('rounded-lg px-3.5 py-1.5 text-[14px] font-medium', view === k ? 'bg-blue-500 text-white' : 'bg-white/[0.06] text-slate-300 hover:bg-white/10')}>
      {children}
    </button>
  )

  return (
    <div className="mx-auto max-w-[760px] px-5 pb-24 pt-10 sm:px-6 sm:pt-14">
      <div className="no-print">
        <h1 className="text-[32px] font-bold leading-tight tracking-tight text-white">Cheat-sheet builder</h1>
        <p className="mt-2 text-[17px] text-slate-400">
          You may bring one double-sided A4 sheet, <b className="font-medium text-slate-200">handwritten with pen and paper</b>. Pin the facts you want, then copy them out by hand. Writing them is half the revision.
        </p>

        <div className="mt-6 rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">
              {pinned.length} facts pinned · about <b className="text-white">{used}</b> lines
            </span>
            <span className={cx(used > LINES_TARGET ? 'text-amber-300' : 'text-slate-500')}>target ≈ {LINES_TARGET} lines for a legible two-sided sheet</span>
          </div>
          <ProgressBar value={(used / LINES_TARGET) * 100} className="mt-2" />
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn size="sm" variant="soft" onClick={pinHot}>
              Pin all the “likely” ones
            </Btn>
            <Btn size="sm" variant="ghost" icon={Printer} disabled={!pinned.length} onClick={() => window.print()}>
              Print my list (to read from)
            </Btn>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Tab k="all">All facts</Tab>
          <Tab k="mine">My sheet ({pinned.length})</Tab>
          <span className="mx-1 h-4 w-px bg-white/15" />
          {[['all', 'All topics'], ...MODULES.filter((m) => !m.bonus).map((m) => [m.id, m.short])].map(([k, l]) => (
            <button key={k} onClick={() => setMod(k)} className={cx('rounded-lg px-2.5 py-1 text-[13px]', mod === k ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-slate-200')}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="print-sheet mt-5 space-y-3">
        {list.map((c) => (
          <div key={c.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[15px] font-semibold text-white">{c.t}</span>
                {c.hot && <span className="no-print ml-2 rounded bg-amber-400/15 px-1.5 py-0.5 text-[11px] font-medium text-amber-300">likely</span>}
              </div>
              <button onClick={() => togglePin(c.id)} className={cx('no-print shrink-0 rounded-lg p-1.5', pins[c.id] ? 'bg-blue-500/20 text-blue-300' : 'text-slate-500 hover:bg-white/10 hover:text-slate-200')} title={pins[c.id] ? 'Unpin' : 'Pin to my sheet'}>
                {pins[c.id] ? <PinOff size={16} /> : <Pin size={16} />}
              </button>
            </div>
            <ul className="mt-2 space-y-1">
              {c.l.map((s, i) => (
                <li key={i} className="text-[14.5px] leading-snug text-slate-300">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {!list.length && <div className="text-slate-500">{view === 'mine' ? 'Nothing pinned yet. Switch to “All facts” and pin what you want.' : 'Nothing here.'}</div>}
      </div>
    </div>
  )
}
