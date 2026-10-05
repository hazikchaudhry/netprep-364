import { createContext, useContext } from 'react'

// One calm accent for the whole app. Modules are told apart by their letter and title, not by colour.
const base = {
  hex: '#6ea8fe',
  hex2: '#6ea8fe',
  text: 'text-blue-400',
  textSoft: 'text-blue-300',
  bg: 'bg-blue-500',
  bgSoft: 'bg-blue-500/[0.07]',
  bgMid: 'bg-blue-500/15',
  border: 'border-white/10',
  borderStrong: 'border-blue-400/60',
  grad: 'from-blue-500 to-blue-500',
  ring: 'ring-blue-400/50',
  stroke: 'stroke-blue-400',
  fill: 'fill-blue-400',
}

export const THEMES = Object.fromEntries(['A', 'B', 'C', 'D', 'E'].map((id) => [id, { ...base, id }]))

export const ThemeContext = createContext(THEMES.A)
export const useTheme = () => useContext(ThemeContext)
