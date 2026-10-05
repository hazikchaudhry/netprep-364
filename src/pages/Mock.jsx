import { useEffect, useMemo, useRef, useState } from 'react'
import { Flag } from 'lucide-react'
import { MODULES } from '../data/modules'
import { QUESTIONS } from '../data/questions'
import { useProgress } from '../lib/store.jsx'
import { cx, fmtTime, shuffle } from '../lib/utils'
import { Btn } from '../components/ui'
import { prepare } from '../components/Quiz'

const SIZES = [
  [15, 'Short · 15 questions', 'Same length as past Test 2 papers'],
  [30, 'Medium · 30 questions', ''],
  [45, 'Long · 45 questions', 'Close to the real 60-minute clock'],
]
const LETTERS = ['A', 'B', 'C', 'D', 'E']

export default function Mock({ go }) {
  const { addMock, record } = useProgress()
  const [phase, setPhase] = useState('config')
  const [size, setSize] = useState(15)
  const [qs, setQs] = useState([])
  const [picked, setPicked] = useState([])
  const [flags, setFlags] = useState({})
  const [i, setI] = useState(0)
  const [left, setLeft] = useState(0)
  const endAt = useRef(0)
  const submitted = useRef(false)

  const minutes = Math.round(size * 1.33)
  const pool = useMemo(() => QUESTIONS.filter((q) => q.mod !== 'E'), [])

  const start = () => {
    const chosen = prepare(shuffle(pool).slice(0, size))
    setQs(chosen)
    setPicked(Array(chosen.length).fill(null))
    setFlags({})
    setI(0)
    submitted.current = false
    endAt.current = Date.now() + minutes * 60000
    setLeft(minutes * 60)
    setPhase('run')
  }

  const submit = () => {
    if (submitted.current) return
    submitted.current = true
    let right = 0
    qs.forEach((q, k) => {
      const ok = picked[k] !== null && q.opts[picked[k]].i === q.answer
      if (ok) right++
      if (picked[k] !== null) record(q.id, ok)
    })
    addMock({ at: Date.now(), right, total: qs.length })
    setPhase('done')
    window.scrollTo({ top: 0 })
  }

  useEffect(() => {
    if (phase !== 'run') return
    const id = setInterval(() => {
      const s = Math.max(0, Math.round((endAt.current - Date.now()) / 1000))
      setLeft(s)
      if (s === 0) submit()
    }, 500)
    return () => clearInterval(id)
  }, [phase, qs, picked]) // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === 'config') {
    return (
      <div className="mx-auto max-w-[720px] px-5 pb-24 pt-10 sm:px-6 sm:pt-14">
        <h1 className="text-[32px] font-bold leading-tight tracking-tight text-white">Mock test</h1>
        <p className="mt-2 text-[17px] text-slate-400">Timed, no feedback until the end, random questions from all four Test 2 topics. Treat it like the real thing.</p>
        <div className="mt-8 space-y-2">
          {SIZES.map(([n, l, sub]) => (
            <button key={n} onClick={() => setSize(n)} className={cx('flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left', size === n ? 'border-blue-400 bg-blue-500/10' : 'border-white/10 hover:bg-white/[0.04]')}>
              <div>
                <div className="font-medium text-white">{l}</div>
                {sub && <div className="text-sm text-slate-500">{sub}</div>}
              </div>
              <div className="text-sm text-slate-400">{Math.round(n * 1.33)} min</div>
            </button>
          ))}
        </div>
        <div className="mt-6">
          <Btn size="lg" onClick={start}>
            Start the timer
          </Btn>
        </div>
        <p className="mt-6 text-sm text-slate-500">You can flag questions and jump around. The test submits itself when time runs out.</p>
      </div>
    )
  }

  if (phase === 'run') {
    const q = qs[i]
    const answered = picked.filter((p) => p !== null).length
    return (
      <div className="mx-auto max-w-[720px] px-5 pb-24 pt-8 sm:px-6 sm:pt-10">
        <div className="sticky top-0 z-10 -mx-5 mb-6 flex items-center justify-between border-b border-white/[0.07] bg-[#0b0f17]/95 px-5 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="text-sm text-slate-400">
            Question {i + 1} of {qs.length} · {answered} answered
          </div>
          <div className={cx('font-mono text-lg font-semibold tabular-nums', left < 120 ? 'text-rose-300' : 'text-white')}>{fmtTime(left)}</div>
        </div>

        <div className="whitespace-pre-line text-[18px] font-semibold leading-snug text-white">{q.q}</div>
        <div className="mt-5 space-y-2">
          {q.opts.map((o, pos) => (
            <button
              key={pos}
              onClick={() => setPicked(picked.map((p, k) => (k === i ? pos : p)))}
              className={cx('flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-[15px]', picked[i] === pos ? 'border-blue-400 bg-blue-500/10 text-white' : 'border-white/10 text-slate-300 hover:bg-white/[0.04]')}
            >
              <span className={cx('flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-semibold', picked[i] === pos ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-300')}>{LETTERS[pos]}</span>
              <span className="whitespace-pre-line">{o.text}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Btn variant="ghost" disabled={i === 0} onClick={() => setI(i - 1)}>
            Previous
          </Btn>
          <Btn variant="ghost" disabled={i === qs.length - 1} onClick={() => setI(i + 1)}>
            Next
          </Btn>
          <Btn variant={flags[i] ? 'primary' : 'soft'} icon={Flag} onClick={() => setFlags({ ...flags, [i]: !flags[i] })}>
            {flags[i] ? 'Flagged' : 'Flag for review'}
          </Btn>
          {picked[i] !== null && (
            <button className="text-sm text-slate-500 hover:text-slate-300" onClick={() => setPicked(picked.map((p, k) => (k === i ? null : p)))}>
              clear answer
            </button>
          )}
        </div>

        <div className="mt-10 border-t border-white/[0.07] pt-5">
          <div className="mb-3 text-sm text-slate-400">All questions</div>
          <div className="flex flex-wrap gap-1.5">
            {qs.map((_, k) => (
              <button key={k} onClick={() => setI(k)} className={cx('relative h-9 w-9 rounded-lg text-sm font-medium', k === i ? 'bg-blue-500 text-white' : picked[k] !== null ? 'bg-white/15 text-white' : 'bg-white/[0.05] text-slate-400 hover:bg-white/10')}>
                {k + 1}
                {flags[k] && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-amber-400" />}
              </button>
            ))}
          </div>
          <div className="mt-6">
            <Btn size="lg" onClick={() => { if (answered === qs.length || window.confirm(`${qs.length - answered} question(s) unanswered. Submit anyway?`)) submit() }}>
              Submit test
            </Btn>
          </div>
        </div>
      </div>
    )
  }

  // results
  const results = qs.map((q, k) => ({ q, ok: picked[k] !== null && q.opts[picked[k]].i === q.answer, skipped: picked[k] === null, pos: picked[k] }))
  const right = results.filter((r) => r.ok).length
  const byMod = MODULES.filter((m) => !m.bonus).map((m) => {
    const rs = results.filter((r) => r.q.mod === m.id)
    return { m, n: rs.length, r: rs.filter((x) => x.ok).length }
  }).filter((x) => x.n)
  const wrong = results.filter((r) => !r.ok)

  return (
    <div className="mx-auto max-w-[720px] px-5 pb-24 pt-10 sm:px-6 sm:pt-14">
      <div className="text-sm text-slate-500">Mock test result</div>
      <h1 className="mt-1 text-[44px] font-bold leading-none tracking-tight text-white">
        {right}/{qs.length} <span className="text-2xl font-medium text-slate-500">({Math.round((right / qs.length) * 100)}%)</span>
      </h1>
      <div className="mt-6 divide-y divide-white/[0.07] border-y border-white/[0.07]">
        {byMod.map(({ m, n, r }) => (
          <div key={m.id} className="flex items-center justify-between py-2.5 text-[15px]">
            <span className="text-slate-300">{m.title}</span>
            <span className={cx('font-medium', r === n ? 'text-emerald-300' : r / n >= 0.6 ? 'text-slate-200' : 'text-rose-300')}>
              {r}/{n}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Btn onClick={() => setPhase('config')}>Another mock</Btn>
        <Btn variant="ghost" onClick={() => go('/practice')}>
          Practise weak spots
        </Btn>
      </div>

      <h2 className="mt-12 text-lg font-semibold text-white">Review: {wrong.length} to learn from</h2>
      <div className="mt-4 space-y-6">
        {wrong.map(({ q, skipped, pos }, k) => {
          const correct = q.opts.find((o) => o.i === q.answer)
          return (
            <div key={k} className="border-l-2 border-rose-400/50 pl-4">
              <div className="whitespace-pre-line text-[15px] font-medium text-white">{q.q}</div>
              <div className="mt-2 text-sm text-rose-300">{skipped ? 'Not answered' : `You chose: ${q.opts[pos].text}`}</div>
              <div className="text-sm text-emerald-300">Correct: {correct.text}</div>
              <div className="mt-1 text-sm leading-relaxed text-slate-400">{q.why}</div>
              <button className="mt-1 text-xs text-blue-300 hover:underline" onClick={() => go(`/lesson/${q.lesson}`)}>
                revisit the lesson
              </button>
            </div>
          )
        })}
        {!wrong.length && <div className="text-slate-400">Nothing wrong. Nice.</div>}
      </div>
    </div>
  )
}
