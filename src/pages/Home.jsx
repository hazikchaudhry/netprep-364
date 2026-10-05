import { useEffect, useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { MODULES, TEST_LESSONS } from '../data/modules'
import { useProgress } from '../lib/store.jsx'
import { Btn, ProgressBar } from '../components/ui'

const TEST_TIME = new Date(2026, 9, 7, 18, 10, 0)

function useCountdown() {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(t)
  }, [])
  const diff = TEST_TIME.getTime() - now
  if (diff <= 0) return null
  return { d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000) }
}

const mins = (l) => parseInt(l.time, 10) || 8

export default function Home({ go }) {
  const { done, answers } = useProgress()
  const cd = useCountdown()
  const next = TEST_LESSONS.find((l) => !done[l.id]) || TEST_LESSONS[0]
  const doneCount = TEST_LESSONS.filter((l) => done[l.id]).length
  const totals = Object.values(answers).reduce((a, v) => ({ r: a.r + v.right, w: a.w + v.wrong }), { r: 0, w: 0 })
  const acc = totals.r + totals.w ? Math.round((totals.r / (totals.r + totals.w)) * 100) : null

  return (
    <div className="mx-auto max-w-[720px] px-5 pb-24 pt-10 sm:px-6 sm:pt-16">
      <div className="text-[13px] text-slate-500">SOFTENG 364 · Test 2</div>
      <h1 className="mt-2 text-[34px] font-bold leading-tight tracking-tight text-white sm:text-[44px]">Your Test 2 study guide</h1>
      <p className="mt-3 text-[17px] leading-relaxed text-slate-400">
        Short lessons with something to click on every step, built from your own slides, problem sheets, Lab 4 and past tests. Work down the list, then try the mock test.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Btn size="lg" icon={ArrowRight} onClick={() => go(`/lesson/${next.id}`)}>
          {doneCount ? 'Continue' : 'Start'}: {next.title}
        </Btn>
        <button onClick={() => go('/plan')} className="text-[15px] text-slate-400 underline-offset-4 hover:text-white hover:underline">
          See the game plan
        </button>
      </div>

      <dl className="mt-10 grid grid-cols-3 gap-6 border-y border-white/[0.07] py-5">
        {[
          ['Test starts in', cd ? `${cd.d}d ${cd.h}h ${cd.m}m` : 'now'],
          ['Lessons done', `${doneCount} / ${TEST_LESSONS.length}`],
          ['Quiz accuracy', acc === null ? '–' : `${acc}%`],
        ].map(([a, b]) => (
          <div key={a}>
            <dt className="text-[13px] text-slate-500">{a}</dt>
            <dd className="mt-0.5 text-xl font-semibold tabular-nums text-white">{b}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-14 text-lg font-semibold text-white">What’s on the test</h2>
      <div className="mt-4 divide-y divide-white/[0.07] border-y border-white/[0.07]">
        {MODULES.filter((m) => !m.bonus).map((m) => {
          const n = m.lessons.filter((l) => done[l.id]).length
          const minutes = m.lessons.reduce((a, l) => a + mins(l), 0)
          const first = m.lessons.find((l) => !done[l.id]) || m.lessons[0]
          return (
            <button key={m.id} onClick={() => go(`/lesson/${first.id}`)} className="group flex w-full items-center gap-4 py-4 text-left">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-white group-hover:text-blue-300">{m.title}</div>
                <div className="mt-0.5 text-sm text-slate-500">{m.blurb}</div>
                <div className="mt-2.5 flex items-center gap-3">
                  <ProgressBar value={(n / m.lessons.length) * 100} className="max-w-[200px]" />
                  <span className="text-xs text-slate-500">
                    {n}/{m.lessons.length} lessons · ~{minutes} min
                  </span>
                </div>
              </div>
              {n === m.lessons.length ? <Check size={18} className="text-emerald-400" /> : <ArrowRight size={18} className="text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-slate-300" />}
            </button>
          )
        })}
      </div>

      <h2 className="mt-14 text-lg font-semibold text-white">The test itself</h2>
      <ul className="mt-3 space-y-1.5 text-[15px] text-slate-400">
        <li>Wednesday 7 Oct, <b className="font-medium text-slate-200">starts 6:10 pm</b> – no extra time if you’re late.</li>
        <li>60 minutes + 5 minutes reading. Multiple choice (past Test 2s had 15–20 questions).</li>
        <li>You can’t leave in the first 30 or last 15 minutes.</li>
        <li>One double-sided <b className="font-medium text-slate-200">handwritten</b> A4 cheat sheet allowed (pen and paper, not a tablet).</li>
      </ul>

      <h2 className="mt-14 text-lg font-semibold text-white">Practise</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {[
          ['/practice', 'Practice questions'],
          ['/mock', 'Mock test'],
          ['/calc', 'Calculation lab'],
          ['/past', 'Past-test patterns'],
          ['/cheat', 'Cheat-sheet builder'],
        ].map(([to, l]) => (
          <Btn key={to} variant="ghost" onClick={() => go(to)}>
            {l}
          </Btn>
        ))}
      </div>

      <p className="mt-14 border-l-2 border-white/15 pl-4 text-sm leading-relaxed text-slate-500">
        <b className="font-medium text-slate-300">Scope note.</b> Alex’s announcement lists Network Control, Link Layer, Security Introduction (the first security lecture) and Lab 4. The crypto and signatures lectures are in your folder but aren’t on that list, so they sit in an optional bonus module.
      </p>
    </div>
  )
}
