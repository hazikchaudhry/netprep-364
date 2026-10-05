import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import confetti from 'canvas-confetti'
import { ALL_LESSONS, MODULES } from '../data/modules'
import { QUESTIONS } from '../data/questions'
import { THEMES, ThemeContext } from '../lib/theme'
import { useProgress } from '../lib/store.jsx'
import { cx, shuffle } from '../lib/utils'
import { Btn, Priority, Stack } from './ui'
import Quiz from './Quiz'

const variants = {
  enter: (d) => ({ opacity: 0, x: d * 24 }),
  center: { opacity: 1, x: 0 },
  exit: (d) => ({ opacity: 0, x: d * -24 }),
}

export default function LessonView({ lessonId, go }) {
  const idx = ALL_LESSONS.findIndex((l) => l.id === lessonId)
  const lesson = ALL_LESSONS[idx]
  const { done, markDone } = useProgress()
  const [i, setI] = useState(0)
  const [dir, setDir] = useState(1)
  // short in-lesson quiz: 6 random questions (the whole bank lives in Practice)
  const qs = useMemo(() => shuffle(QUESTIONS.filter((q) => q.lesson === lessonId)).slice(0, 6), [lessonId])

  useEffect(() => {
    setI(0)
    setDir(1)
    window.scrollTo({ top: 0 })
  }, [lessonId])

  const total = lesson ? lesson.steps.length + 1 : 0
  const move = useCallback(
    (d) => {
      setDir(d)
      setI((v) => Math.max(0, Math.min(total - 1, v + d)))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [total],
  )

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea, select')) return
      if (e.key === 'ArrowRight') move(1)
      if (e.key === 'ArrowLeft') move(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [move])

  if (!lesson) return <div className="p-8 text-slate-400">Lesson not found.</div>

  const theme = THEMES[lesson.mod]
  const mod = MODULES.find((m) => m.id === lesson.mod)
  const isQuiz = i === lesson.steps.length
  const step = lesson.steps[i]
  const prev = ALL_LESSONS[idx - 1]
  const nextL = ALL_LESSONS[idx + 1]
  const isDone = done[lessonId]
  const inMod = mod.lessons.findIndex((l) => l.id === lessonId) + 1

  const finish = () => {
    markDone(lessonId)
    confetti({ particleCount: 50, spread: 55, origin: { y: 0.75 }, colors: ['#6ea8fe', '#e2e8f0', '#34d399'] })
  }

  return (
    <ThemeContext.Provider value={theme}>
      <div className="mx-auto max-w-[720px] px-5 pb-28 pt-8 sm:px-6 sm:pt-12">
        {/* header */}
        <header className="mb-8">
          <button onClick={() => go('/')} className="text-[13px] text-slate-500 hover:text-slate-300">
            {mod.title} <span className="mx-1">·</span> lesson {inMod} of {mod.lessons.length}
          </button>
          <h1 className="mt-1 text-[28px] font-bold leading-tight tracking-tight text-white sm:text-[34px]">{lesson.title}</h1>
          <div className="mt-2 flex items-center gap-3 text-[13px] text-slate-500">
            <Priority level={lesson.priority} />
            <span>·</span>
            <span>{lesson.time}</span>
            {isDone && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <Check size={13} /> done
                </span>
              </>
            )}
          </div>

          {/* progress */}
          <div className="mt-6 flex gap-1" role="tablist">
            {Array.from({ length: total }).map((_, k) => (
              <button
                key={k}
                role="tab"
                aria-label={k === lesson.steps.length ? 'Quiz' : lesson.steps[k].title}
                title={k === lesson.steps.length ? 'Quiz' : lesson.steps[k].title}
                onClick={() => {
                  setDir(k > i ? 1 : -1)
                  setI(k)
                }}
                className={cx('h-1 flex-1 rounded-full transition', k === i ? 'bg-blue-400' : k < i ? 'bg-blue-400/40' : 'bg-white/10 hover:bg-white/20')}
              />
            ))}
          </div>
          <div className="mt-2 text-[13px] text-slate-500">{isQuiz ? 'Quiz' : `Step ${i + 1} of ${lesson.steps.length}`}</div>
        </header>

        {/* step */}
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={`${lessonId}-${i}`} custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.18 }}>
            <h2 className="mb-5 text-2xl font-semibold tracking-tight text-white">{isQuiz ? 'Check yourself' : step.title}</h2>
            {isQuiz ? (
              <Stack>
                {qs.length ? <Quiz questions={qs} onFinish={finish} finishLabel={isDone ? 'Mark complete again' : 'Complete lesson'} /> : <Btn onClick={finish}>Mark complete</Btn>}
                {isDone && nextL && (
                  <div className="text-[15px] text-slate-300">
                    Lesson complete.{' '}
                    <button className="font-medium text-blue-300 underline underline-offset-2" onClick={() => go(`/lesson/${nextL.id}`)}>
                      Next: {nextL.title}
                    </button>
                  </div>
                )}
              </Stack>
            ) : (
              <Stack>{step.body}</Stack>
            )}
          </motion.div>
        </AnimatePresence>

        {/* footer nav */}
        <div className="mt-12 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-5">
          <Btn variant="ghost" icon={ArrowLeft} onClick={() => (i === 0 ? (prev ? go(`/lesson/${prev.id}`) : go('/')) : move(-1))}>
            {i === 0 ? (prev ? 'Previous lesson' : 'Home') : 'Back'}
          </Btn>
          {i < total - 1 ? (
            <Btn icon={ArrowRight} onClick={() => move(1)}>
              Next
            </Btn>
          ) : nextL ? (
            <Btn variant={isDone ? 'primary' : 'ghost'} icon={ArrowRight} onClick={() => go(`/lesson/${nextL.id}`)}>
              Next lesson
            </Btn>
          ) : (
            <Btn onClick={() => go('/practice')}>Go to practice</Btn>
          )}
        </div>
      </div>
    </ThemeContext.Provider>
  )
}
