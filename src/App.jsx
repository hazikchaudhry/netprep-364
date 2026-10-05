import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, Menu, Network, X } from 'lucide-react'
import { ALL_LESSONS, MODULES, TEST_LESSONS } from './data/modules'
import { useRoute } from './lib/nav'
import { useProgress } from './lib/store.jsx'
import { cx } from './lib/utils'
import { ProgressBar } from './components/ui'
import LessonView from './components/LessonView'
import Home from './pages/Home'
import Plan from './pages/Plan'
import Practice from './pages/Practice'
import Mock from './pages/Mock'
import CalcLab from './pages/CalcLab'
import Cheat from './pages/Cheat'
import PastPapers from './pages/PastPapers'

const START = [
  { to: '/', label: 'Home' },
  { to: '/plan', label: 'Game plan' },
]
const PRACTICE = [
  { to: '/past', label: 'Past-test patterns' },
  { to: '/calc', label: 'Calculation lab' },
  { to: '/practice', label: 'Practice questions' },
  { to: '/mock', label: 'Mock test' },
  { to: '/cheat', label: 'Cheat-sheet builder' },
]

function Item({ active, onClick, children, className }) {
  return (
    <button
      onClick={onClick}
      className={cx('flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-[14px] transition', active ? 'bg-white/10 font-medium text-white' : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-200', className)}
    >
      {children}
    </button>
  )
}

function Sidebar({ path, go, onNav }) {
  const { done } = useProgress()
  const activeLesson = path.startsWith('/lesson/') ? ALL_LESSONS.find((l) => l.id === path.replace('/lesson/', '')) : null
  const [open, setOpen] = useState(activeLesson?.mod || 'A')
  useEffect(() => {
    if (activeLesson) setOpen(activeLesson.mod)
  }, [activeLesson?.mod]) // eslint-disable-line react-hooks/exhaustive-deps

  const doneCount = TEST_LESSONS.filter((l) => done[l.id]).length
  const nav = (p) => {
    go(p)
    onNav?.()
  }
  const label = (t) => <div className="mb-1 mt-6 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{t}</div>

  return (
    <div className="flex h-full flex-col">
      <button onClick={() => nav('/')} className="flex items-center gap-2.5 px-5 pb-4 pt-5 text-left">
        <Network size={20} className="text-blue-400" />
        <span className="text-[15px] font-semibold text-white">NetPrep 364</span>
      </button>
      <div className="px-5 pb-2">
        <div className="mb-1.5 flex justify-between text-xs text-slate-500">
          <span>Progress</span>
          <span>
            {doneCount} / {TEST_LESSONS.length} lessons
          </span>
        </div>
        <ProgressBar value={(doneCount / TEST_LESSONS.length) * 100} />
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-8">
        {label('Start')}
        {START.map((n) => (
          <Item key={n.to} active={path === n.to} onClick={() => nav(n.to)}>
            {n.label}
          </Item>
        ))}

        {label('Learn')}
        {MODULES.map((m) => {
          const isOpen = open === m.id
          const n = m.lessons.filter((l) => done[l.id]).length
          return (
            <div key={m.id}>
              <button onClick={() => setOpen(isOpen ? null : m.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-[14px] font-medium text-slate-200 hover:bg-white/[0.05]">
                <ChevronDown size={14} className={cx('shrink-0 text-slate-500 transition', !isOpen && '-rotate-90')} />
                <span className="flex-1 truncate">{m.title}</span>
                <span className="text-xs font-normal text-slate-500">
                  {n}/{m.lessons.length}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="ml-[18px] border-l border-white/10 py-1 pl-1">
                      {m.bonus && <div className="px-3 py-1 text-xs text-slate-500">Not on Test 2 – optional</div>}
                      {m.lessons.map((l) => (
                        <Item key={l.id} active={path === `/lesson/${l.id}`} onClick={() => nav(`/lesson/${l.id}`)} className="py-1 text-[13.5px]">
                          {done[l.id] ? <Check size={13} className="shrink-0 text-emerald-400" /> : <span className="h-[13px] w-[13px] shrink-0 rounded-full border border-white/20" />}
                          <span className="truncate">{l.title}</span>
                        </Item>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}

        {label('Practice')}
        {PRACTICE.map((n) => (
          <Item key={n.to} active={path === n.to} onClick={() => nav(n.to)}>
            {n.label}
          </Item>
        ))}
      </nav>
    </div>
  )
}

export default function App() {
  const [path, go] = useRoute()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [path])

  let page
  if (path.startsWith('/lesson/')) {
    const id = path.replace('/lesson/', '')
    page = <LessonView key={id} lessonId={id} go={go} />
  } else if (path === '/plan') page = <Plan go={go} />
  else if (path === '/practice') page = <Practice go={go} />
  else if (path === '/mock') page = <Mock go={go} />
  else if (path === '/calc') page = <CalcLab go={go} />
  else if (path === '/cheat') page = <Cheat go={go} />
  else if (path === '/past') page = <PastPapers go={go} />
  else page = <Home go={go} />

  return (
    <div className="min-h-screen">
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/[0.07] bg-[#0d121b] lg:block">
        <Sidebar path={path} go={go} />
      </aside>

      <div className="no-print sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.07] bg-[#0d121b]/95 px-4 py-3 backdrop-blur lg:hidden">
        <button onClick={() => go('/')} className="flex items-center gap-2 text-[15px] font-semibold text-white">
          <Network size={18} className="text-blue-400" /> NetPrep 364
        </button>
        <button onClick={() => setOpen(true)} className="rounded-lg bg-white/10 p-2 text-slate-200" aria-label="Menu">
          <Menu size={18} />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />
            <motion.aside initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} transition={{ type: 'spring', stiffness: 320, damping: 34 }} className="fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-[#0d121b] lg:hidden">
              <button onClick={() => setOpen(false)} className="absolute right-3 top-4 rounded-lg bg-white/10 p-1.5 text-slate-300" aria-label="Close menu">
                <X size={16} />
              </button>
              <Sidebar path={path} go={go} onNav={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="lg:pl-72">{page}</main>
    </div>
  )
}
