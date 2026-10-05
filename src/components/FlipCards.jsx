import { useState } from 'react'
import { motion } from 'framer-motion'
import { cx } from '../lib/utils'
import { useTheme } from '../lib/theme'

function Card({ front, back, h, onFlip }) {
  const t = useTheme()
  const [f, setF] = useState(false)
  return (
    <div
      className="perspective cursor-pointer"
      style={{ height: h }}
      onClick={() => {
        setF(!f)
        onFlip?.()
      }}
    >
      <motion.div
        className="preserve-3d relative h-full w-full"
        animate={{ rotateY: f ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      >
        <div
          className={cx('absolute inset-0 flex items-center justify-center rounded-xl border p-3 text-center text-sm font-semibold text-white', t.border, t.bgSoft)}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {front}
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center rounded-xl border border-white/20 bg-slate-800 p-3 text-center text-[13px] leading-snug text-slate-100"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  )
}

/** Tap-to-flip flash cards. cards: [{ front, back }] */
export default function FlipCards({ cards, h = 112, cols = 'grid-cols-2 sm:grid-cols-3' }) {
  const [seen, setSeen] = useState({})
  const count = Object.keys(seen).length
  return (
    <div>
      <div className={cx('grid gap-2.5', cols)}>
        {cards.map((c, i) => (
          <Card key={i} {...c} h={h} onFlip={() => setSeen((s) => ({ ...s, [i]: true }))} />
        ))}
      </div>
      <div className="mt-2 text-right font-mono text-xs text-slate-500">
        flipped {count}/{cards.length}
      </div>
    </div>
  )
}
