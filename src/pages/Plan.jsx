import { Check } from 'lucide-react'
import { ALL_LESSONS } from '../data/modules'
import { useProgress } from '../lib/store.jsx'
import { cx } from '../lib/utils'
import { Btn, Callout, P, Table } from '../components/ui'

// Order = how often it shows up in past tests × how many marks it carries × how quickly it clicks
const ORDER = [
  ['nc-linkstate', 'Asked every year; Dijkstra tables are on the problem sheet'],
  ['nc-dv', 'Asked every year; Bellman-Ford tables are on the problem sheet'],
  ['nc-bgp', 'eBGP, BGP policy and hot potato appear in every past paper'],
  ['nc-hier', 'Area border routers appear in every past paper'],
  ['ll-errors', 'CRC calculations appeared in 2023 and 2024; 2-D parity is on the problem sheet'],
  ['ll-addr', '“Function of a MAC address” appeared twice; addressing is on the problem sheet'],
  ['ll-switch', 'Switch tables are on the problem sheet'],
  ['ll-mac', 'The biggest link-layer topic in the lectures'],
  ['sec-cia', 'The one security lecture on the list'],
  ['sec-intro', 'Definitions; short'],
  ['icmp-basics', 'Lab 4'],
  ['icmp-traceroute', 'Lab 4'],
  ['icmp-ping', 'Lab 4'],
  ['icmp-lab', 'Lab 4 recall'],
  ['nc-planes', 'Short; sets up everything else'],
  ['ll-intro', 'Short'],
  ['ll-ethernet', 'Short'],
  ['ll-vlan', 'Short'],
  ['nc-snmp', 'Short; “a quick bit on…”'],
  ['ll-dc', 'Lowest priority'],
]

const mins = (id) => parseInt(ALL_LESSONS.find((l) => l.id === id)?.time, 10) || 8

export default function Plan({ go }) {
  const { plan, togglePlan, done } = useProgress()
  const total = ORDER.reduce((a, [id]) => a + mins(id), 0)
  const must = ORDER.filter(([id]) => ALL_LESSONS.find((l) => l.id === id)?.priority === 'high')
  const mustMin = must.reduce((a, [id]) => a + mins(id), 0)

  return (
    <div className="mx-auto max-w-[720px] px-5 pb-24 pt-10 sm:px-6 sm:pt-14">
      <h1 className="text-[32px] font-bold leading-tight tracking-tight text-white">Game plan</h1>
      <p className="mt-2 text-[17px] text-slate-400">What to learn, in what order, and how to learn it.</p>

      <h2 className="mt-10 text-lg font-semibold text-white">What’s actually on the test</h2>
      <Table
        className="mt-3"
        head={['From Alex’s announcement', 'Your material', 'Lessons here']}
        rows={[
          ['Network Layer: Control (Week 7)', 'Network Control lectures 1–3, problem sheet', 'Module A'],
          ['Link Layer (Week 8)', 'Link Layer lectures 1–4, problem sheet', 'Module B'],
          ['Security Introduction (today’s lecture)', 'Security 1 slides (CIA triad)', 'Module C'],
          ['Lab 4 – ICMP', 'Lab 4 worksheet', 'Module D'],
        ]}
      />
      <div className="mt-4">
        <Callout kind="past" title="What past papers tell you">
          The 2022, 2023 and 2024 Test 2s were 15–20 multiple-choice questions with five options (A–E), and <b>the same questions came back almost word for word</b> – Dijkstra→OSPF, eBGP, area border routers, hot potato, “function of a MAC address”, CRC. Open{' '}
          <button className="font-medium text-emerald-300 underline underline-offset-2" onClick={() => go('/past')}>
            Past-test patterns
          </button>{' '}
          and learn those answers first. Those papers were written by a different lecturer, so scope may differ, but this is the best evidence you have.
        </Callout>
      </div>

      <h2 className="mt-12 text-lg font-semibold text-white">The order to learn it in</h2>
      <p className="mt-1 text-sm text-slate-500">
        About {Math.round(total / 6) / 10} hours of lessons in total. If you’re short on time, the “must know” lessons are about {Math.round(mustMin / 6) / 10} hours.
      </p>
      <ol className="mt-4 divide-y divide-white/[0.07] border-y border-white/[0.07]">
        {ORDER.map(([id, why], i) => {
          const l = ALL_LESSONS.find((x) => x.id === id)
          const isDone = done[id] || plan[id]
          return (
            <li key={id} className="flex items-center gap-3 py-3">
              <button onClick={() => togglePlan(id)} aria-label="mark done" className={cx('flex h-5 w-5 shrink-0 items-center justify-center rounded border', isDone ? 'border-emerald-400 bg-emerald-400 text-slate-900' : 'border-white/25 hover:border-white/50')}>
                {isDone && <Check size={13} strokeWidth={3} />}
              </button>
              <div className="min-w-0 flex-1">
                <button onClick={() => go(`/lesson/${id}`)} className={cx('text-left text-[15px] font-medium hover:text-blue-300', isDone ? 'text-slate-500 line-through' : 'text-white')}>
                  {i + 1}. {l.title}
                </button>
                <div className="text-[13px] text-slate-500">{why}</div>
              </div>
              <div className="shrink-0 text-xs text-slate-500">{l.time}</div>
            </li>
          )
        })}
      </ol>

      <h2 className="mt-12 text-lg font-semibold text-white">How to learn it</h2>
      <ol className="mt-3 list-decimal space-y-3 pl-5 text-[16px] leading-relaxed text-slate-300">
        <li>
          <b className="text-white">Predict, then click.</b> Before you press Next in a demo, say what you think will happen. Being wrong in the demo is cheap; being wrong in the test isn’t.
        </li>
        <li>
          <b className="text-white">Do each calculation by hand once.</b> CRC, Dijkstra tables, Bellman-Ford, 2-D parity and switch tables are on your problem sheets and in past papers. The Calculation lab makes endless new ones.
        </li>
        <li>
          <b className="text-white">Take the quiz at the end of every lesson.</b> Retry the ones you miss; the app remembers them for “weak spots”.
        </li>
        <li>
          <b className="text-white">Write the cheat sheet by hand as you go.</b> It must be handwritten, and writing it is itself revision. The builder tells you what to put on it.
        </li>
        <li>
          <b className="text-white">Finish with one timed mock test</b>, then sleep. Don’t cram new topics in the last hour.
        </li>
      </ol>

      <div className="mt-10 flex flex-wrap gap-2">
        <Btn onClick={() => go(`/lesson/${ORDER.find(([id]) => !done[id] && !plan[id])?.[0] || ORDER[0][0]}`)}>Start the next lesson</Btn>
        <Btn variant="ghost" onClick={() => go('/mock')}>
          Try a mock test
        </Btn>
      </div>

      <div className="mt-12">
        <Callout kind="tip" title="Test day">
          Starts <b>6:10 pm</b> (late = no extra time). Room is confirmed on Tuesday. You can’t leave in the first 30 or last 15 minutes, so use the spare time to re-check the calculation questions. Bring the handwritten A4 sheet and a pen.
        </Callout>
      </div>
    </div>
  )
}
