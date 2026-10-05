export const cx = (...a) => a.filter(Boolean).join(' ')

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const rand = (n) => Math.floor(Math.random() * n)
export const pick = (arr) => arr[rand(arr.length)]

export const fmtTime = (s) => {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

/* ---------- link-layer maths (used by demos + practice) ---------- */

/** mod-2 long division. Returns { steps, remainder } */
export function crcDivide(data, gen) {
  const r = gen.length - 1
  const bits = (data + '0'.repeat(r)).split('').map(Number)
  const g = gen.split('').map(Number)
  const steps = []
  for (let i = 0; i < data.length; i++) {
    if (bits[i] === 1) {
      const before = bits.slice(i, i + g.length).join('')
      for (let j = 0; j < g.length; j++) bits[i + j] ^= g[j]
      const after = bits.slice(i, i + g.length).join('')
      steps.push({ at: i, before, gen, after })
    }
  }
  return { steps, remainder: bits.slice(bits.length - r).join(''), padded: data + '0'.repeat(r) }
}

/** check a received frame (data+crc) – returns remainder string */
export function crcCheck(frame, gen) {
  const bits = frame.split('').map(Number)
  const g = gen.split('').map(Number)
  for (let i = 0; i <= bits.length - g.length; i++) {
    if (bits[i] === 1) for (let j = 0; j < g.length; j++) bits[i + j] ^= g[j]
  }
  return bits.slice(bits.length - (g.length - 1)).join('')
}

export const parity = (bits) => bits.reduce((a, b) => a ^ b, 0) // even parity bit
