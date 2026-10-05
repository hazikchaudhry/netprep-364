import { useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { MODULES } from '../data/modules'
import { QUESTIONS } from '../data/questions'
import { useProgress } from '../lib/store.jsx'
import { cx, shuffle } from '../lib/utils'
import { Btn, ProgressBar } from '../components/ui'
import Quiz from '../components/Quiz'

const SCOPES = [
  ['test', 'All Test 2 topics'],
  ...MODULES.filter((m) => !m.bonus).map((m) => [m.id, m.title]),
  ['E', 'Bonus: crypto'],
]
const KINDS = [
  ['all', 'Everything'],
  ['past', 'Past-test style'],
  ['calc', 'Calculations'],
  ['weak', 'My weak spots'],
  ['new', 'Not tried yet'],
]

export default function Practice({ go }) {
  const { answers } = useProgress()
  const [scope, setScope] = useState('test')
  const [kind, setKind] = useState('all')
  const [count, setCount] = useState(10)
  const [run, setRun] = useState(null)

  const pool = useMemo(
    () =>
      QUESTIONS.filter((q) => {
        if (scope === 'test' ? q.mod === 'E' : q.mod !== scope) return false
        const a = answers[q.id]
        if (kind === 'past') return q.tag === 'past'
        if (kind === 'calc') return q.tag === 'calc'
        if (kind === 'weak') return a && a.last === false
        if (kind === 'new') return !a
        return true
      }),
    [scope, kind, answers],
  )

  const stats = MODULES.map((m) => {
    const qs = QUESTIONS.filter((q) => q.mod === m.id)
    const seen = qs.filter((q) => answers[q.id])
    const right = seen.filter((q) => answers[q.id].last).length
    return { m, total: qs.length, seen: seen.length, right }
  })

  if (run) {
    return (
      <div className="mx-auto max-w-[720px] px-5 pb-24 pt-8 sm:px-6 sm:pt-12">
        <button onClick={() => setRun(null)} className="mb-6 flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
          <ArrowLeft size={15} /> Back to practice
        </button>
        <Quiz questions={run} onFinish={() => setRun(null)} finishLabel="Done" title="Practice" />
      </div>
    )
  }

  const Pill = ({ active, onClick, children }) => (
    <button onClick={onClick} className={cx('rounded-lg px-3 py-1.5 text-[13px] font-medium', active ? 'bg-blue-500 text-white' : 'bg-white/[0.06] text-slate-300 hover:bg-white/10')}>
      {children}
    </button>
  )

  return (
    <div className="mx-auto max-w-[720px] px-5 pb-24 pt-10 sm:px-6 sm:pt-14">
      <h1 className="text-[32px] font-bold leading-tight tracking-tight text-white">Practice questions</h1>
      <p className="mt-2 text-[17px] text-slate-400">{QUESTIONS.filter((q) => q.mod !== 'E').length} exam-style multiple-choice questions with explanations.</p>

      <div className="mt-8 space-y-6">
        <div>
          <div className="mb-2 text-sm font-medium text-slate-400">Topic</div>
          <div className="flex flex-wrap gap-2">
            {SCOPES.map(([k, l]) => (
              <Pill key={k} active={scope === k} onClick={() => setScope(k)}>
                {l}
              </Pill>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-sm font-medium text-slate-400">Which questions</div>
          <div className="flex flex-wrap gap-2">
            {KINDS.map(([k, l]) => (
              <Pill key={k} active={kind === k} onClick={() => setKind(k)}>
                {l}
              </Pill>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-sm font-medium text-slate-400">How many</div>
          <div className="flex flex-wrap gap-2">
            {[5, 10, 20, 999].map((n) => (
              <Pill key={n} active={count === n} onClick={() => setCount(n)}>
                {n === 999 ? 'All' : n}
              </Pill>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <Btn size="lg" disabled={!pool.length} onClick={() => setRun(shuffle(pool).slice(0, count))}>
          Start ({Math.min(count, pool.length)} questions)
        </Btn>
        {!pool.length && <span className="text-sm text-slate-500">{kind === 'weak' ? 'No missed questions yet – good.' : 'Nothing matches.'}</span>}
      </div>

      <h2 className="mt-14 text-lg font-semibold text-white">Your progress by topic</h2>
      <div className="mt-4 divide-y divide-white/[0.07] border-y border-white/[0.07]">
        {stats.map(({ m, total, seen, right }) => (
          <div key={m.id} className="flex items-center gap-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="text-[15px] text-white">{m.title}</div>
              <ProgressBar value={total ? (right / total) * 100 : 0} className="mt-2 max-w-[260px]" />
            </div>
            <div className="text-right text-xs text-slate-500">
              <div>
                {right} correct · {seen}/{total} tried
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
