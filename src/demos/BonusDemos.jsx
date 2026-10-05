import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronRight, RotateCcw, X } from 'lucide-react'
import { cx } from '../lib/utils'
import { Btn, Controls } from '../components/ui'

/* ============================ Caesar / substitution ============================ */

const shift = (s, k) => s.replace(/[a-z]/gi, (ch) => {
  const base = ch <= 'Z' ? 65 : 97
  return String.fromCharCode(((ch.charCodeAt(0) - base + k + 26) % 26) + base)
})

export function CaesarDemo() {
  const [text, setText] = useState('bob, i love you. alice')
  const [k, setK] = useState(3)
  const [brute, setBrute] = useState(false)
  const enc = shift(text, k)
  return (
    <div className="space-y-4">
      <label className="block text-xs text-slate-400">
        plaintext
        <input value={text} onChange={(e) => setText(e.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 font-mono text-sm text-white outline-none focus:border-blue-400" />
      </label>
      <label className="block text-xs text-slate-300">
        key (shift): <b className="font-mono text-white">{k}</b> {k === 3 && <span className="text-slate-500">· Caesar cipher</span>} {k === 13 && <span className="text-slate-500">· ROT13</span>}
        <input type="range" min={1} max={25} value={k} onChange={(e) => setK(+e.target.value)} className="mt-1 block w-full accent-blue-400" />
      </label>
      <div className="rounded-xl bg-black/30 p-3">
        <div className="text-xs text-slate-500">ciphertext</div>
        <div className="font-mono text-lg text-blue-200">{enc}</div>
      </div>
      <Btn size="sm" variant="soft" onClick={() => setBrute(!brute)}>
        {brute ? 'Hide' : 'Brute-force every key'}
      </Btn>
      {brute && (
        <div className="max-h-52 overflow-y-auto rounded-xl bg-black/30 p-3 font-mono text-[12px] text-slate-300">
          {Array.from({ length: 25 }, (_, i) => i + 1).map((s) => (
            <div key={s} className={cx(s === 26 - k ? 'text-emerald-300' : '')}>
              <span className="inline-block w-8 text-slate-600">{s}</span>
              {shift(enc, s)}
            </div>
          ))}
        </div>
      )}
      <div className="text-sm text-slate-400">Only 25 keys, so brute force is instant. A monoalphabetic cipher has 26! mappings but still falls to statistical (letter-frequency) analysis.</div>
    </div>
  )
}

/* ============================ RSA ============================ */

const gcd = (a, b) => (b ? gcd(b, a % b) : a)
function modPow(b, e, m) {
  let r = 1n
  let base = BigInt(b) % BigInt(m)
  let ex = BigInt(e)
  const mm = BigInt(m)
  while (ex > 0n) {
    if (ex & 1n) r = (r * base) % mm
    base = (base * base) % mm
    ex >>= 1n
  }
  return Number(r)
}

export function RsaDemo() {
  const [p, setP] = useState(5)
  const [q, setQ] = useState(7)
  const [eSel, setESel] = useState(5)
  const [m, setM] = useState(12)
  const [mode, setMode] = useState('enc')

  const primes = [3, 5, 7, 11, 13]
  const n = p * q
  const z = (p - 1) * (q - 1)
  const es = useMemo(() => Array.from({ length: z - 2 }, (_, i) => i + 2).filter((x) => x < n && gcd(x, z) === 1), [n, z])
  const e = es.includes(eSel) ? eSel : es[0]
  let d = 1
  while ((e * d) % z !== 1) d++
  if (d === e) d += z
  const mm = Math.min(m, n - 1)
  const c = modPow(mm, e, n)
  const back = modPow(c, d, n)
  const s = modPow(mm, d, n)
  const ver = modPow(s, e, n)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['p', p, setP, primes.filter((x) => x !== q)],
          ['q', q, setQ, primes.filter((x) => x !== p)],
        ].map(([n_, v, set, opts]) => (
          <label key={n_} className="text-xs text-slate-400">
            prime {n_}
            <select value={v} onChange={(ev) => setP === set ? setP(+ev.target.value) : setQ(+ev.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-slate-900 px-2 py-1.5 font-mono text-white">
              {opts.map((x) => <option key={x}>{x}</option>)}
            </select>
          </label>
        ))}
        <label className="text-xs text-slate-400">
          e (coprime with z)
          <select value={e} onChange={(ev) => setESel(+ev.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-slate-900 px-2 py-1.5 font-mono text-white">
            {es.slice(0, 12).map((x) => <option key={x}>{x}</option>)}
          </select>
        </label>
        <label className="text-xs text-slate-400">
          message m &lt; n
          <input type="number" min={0} max={n - 1} value={mm} onChange={(ev) => setM(Math.max(0, Math.min(n - 1, +ev.target.value || 0)))} className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-2 py-1.5 font-mono text-white outline-none" />
        </label>
      </div>
      <div className="grid gap-2 font-mono text-sm sm:grid-cols-2">
        <div className="rounded-xl bg-black/30 p-3">
          <div>n = p·q = {p}×{q} = <b className="text-white">{n}</b></div>
          <div>z = (p−1)(q−1) = <b className="text-white">{z}</b></div>
          <div>e = <b className="text-white">{e}</b> &nbsp;(no common factor with z)</div>
          <div>d: e·d mod z = 1 → <b className="text-white">{d}</b></div>
        </div>
        <div className="rounded-xl bg-black/30 p-3">
          <div>public key (n, e) = <b className="text-blue-300">({n}, {e})</b></div>
          <div>private key (n, d) = <b className="text-rose-300">({n}, {d})</b></div>
        </div>
      </div>
      <Controls>
        {[
          ['enc', 'Encrypt: public first, then private'],
          ['sign', 'Sign: private first, then public'],
        ].map(([k, l]) => (
          <button key={k} onClick={() => setMode(k)} className={cx('rounded-lg px-3 py-1.5 text-[13px] font-medium', mode === k ? 'bg-blue-500 text-white' : 'bg-white/[0.06] text-slate-300 hover:bg-white/10')}>
            {l}
          </button>
        ))}
      </Controls>
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 font-mono text-sm leading-relaxed text-slate-200">
        {mode === 'enc' ? (
          <>
            <div>c = m<sup>e</sup> mod n = {mm}<sup>{e}</sup> mod {n} = <b className="text-blue-300">{c}</b></div>
            <div>m = c<sup>d</sup> mod n = {c}<sup>{d}</sup> mod {n} = <b className={back === mm ? 'text-emerald-300' : 'text-rose-300'}>{back}</b> {back === mm ? '✓ original message recovered' : ''}</div>
          </>
        ) : (
          <>
            <div>signature s = m<sup>d</sup> mod n = {mm}<sup>{d}</sup> mod {n} = <b className="text-rose-300">{s}</b></div>
            <div>verify: s<sup>e</sup> mod n = {s}<sup>{e}</sup> mod {n} = <b className={ver === mm ? 'text-emerald-300' : 'text-rose-300'}>{ver}</b> {ver === mm ? '✓ equals m: only the private-key holder could have made s' : ''}</div>
          </>
        )}
      </div>
      <div className="text-sm text-slate-400">The slides’ example: p=5, q=7 → n=35, z=24, e=5, d=29; m=12 encrypts to c=17. RSA is secure because factoring a big n back into p and q is hard.</div>
    </div>
  )
}

/* ============================ checksum vs hash ============================ */

const colSum = (s) => {
  const rows = s.padEnd(12, ' ').slice(0, 12).match(/.{4}/g)
  return [0, 1, 2, 3].map((i) => rows.reduce((a, r) => a + r.charCodeAt(i), 0) & 255)
}
const hex2 = (n) => n.toString(16).toUpperCase().padStart(2, '0')

async function sha256(s) {
  try {
    if (globalThis.crypto?.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
      return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
    }
  } catch { /* fall through */ }
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return (h >>> 0).toString(16).padStart(8, '0').repeat(8)
}

export function HashDemo() {
  const [a, setA] = useState('IOU100.99BOB')
  const [b, setB] = useState('IOU900.19BOB')
  const [ha, setHa] = useState('')
  const [hb, setHb] = useState('')
  useEffect(() => {
    sha256(a).then(setHa)
    sha256(b).then(setHb)
  }, [a, b])
  const ca = colSum(a).map(hex2).join(' ')
  const cb = colSum(b).map(hex2).join(' ')
  const same = ca === cb
  return (
    <div className="space-y-4">
      <div className="text-xs text-slate-400">The slides’ example: “IOU1 / 00.9 / 9BOB” vs “IOU9 / 00.1 / 9BOB” (3 lines of 4 characters, typed here with no spaces). Edit either message.</div>
      {[
        ['Message 1', a, setA, ca, ha],
        ['Message 2', b, setB, cb, hb],
      ].map(([l, v, set, c, h]) => (
        <div key={l} className="rounded-xl border border-white/10 p-3">
          <label className="text-xs text-slate-400">
            {l}
            <input value={v} onChange={(e) => set(e.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 font-mono text-sm text-white outline-none focus:border-blue-400" />
          </label>
          <div className="mt-2 font-mono text-[12px] text-slate-300">
            <div>
              checksum (byte-column sum): <b className="text-amber-300">{c}</b>
            </div>
            <div className="break-all">
              SHA-256: <span className="text-emerald-300">{h.slice(0, 32)}…</span>
            </div>
          </div>
        </div>
      ))}
      <div className={cx('rounded-xl border p-3 text-sm', same ? 'border-amber-400/40 bg-amber-400/[0.07] text-amber-100' : 'border-white/10 text-slate-300')}>
        {same ? (
          <>
            <b>Identical checksums, different messages.</b> An attacker can change “IOU 1” to “IOU 9” and the checksum still passes. SHA-256 gives them completely different digests, which is why a <i>cryptographic</i> hash is needed.
          </>
        ) : (
          'The checksums differ here – edit a message so the column sums match to see a collision.'
        )}
      </div>
    </div>
  )
}

/* ============================ digital signature ============================ */

export function SignDemo() {
  const [n, setN] = useState(0)
  const [tamper, setTamper] = useState(false)
  const steps = [
    ['Bob', 'Has a long message m (“Pay Alice $100”).'],
    ['Bob', 'Applies a hash function: H(m), a short fixed-size digest.'],
    ['Bob', 'Encrypts the digest with his PRIVATE key: K⁻(H(m)). This is the digital signature.'],
    ['Bob → Alice', 'Sends the message in the clear plus the signature: (m, K⁻(H(m))).'],
    ['Alice', tamper ? 'Receives a TAMPERED message m′ (“Pay Alice $900”) and hashes it: H(m′).' : 'Receives m and hashes it: H(m).'],
    ['Alice', 'Decrypts the signature with Bob’s PUBLIC key to recover Bob’s digest H(m).'],
    ['Alice', tamper ? 'Compares H(m′) with H(m): they’re different → reject! The message was altered.' : 'Compares the two digests: equal → Bob signed it, nobody else did, and it wasn’t modified.'],
  ]
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input type="checkbox" checked={tamper} onChange={(e) => { setTamper(e.target.checked); setN(0) }} className="accent-blue-400" /> Mallory tampers with the message in transit
      </label>
      <div className="space-y-1.5">
        {steps.slice(0, n).map(([who, text], i) => {
          const last = i === steps.length - 1
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cx('flex gap-3 rounded-xl border p-3 text-[15px]', last ? (tamper ? 'border-rose-400/50 bg-rose-400/[0.07]' : 'border-emerald-400/50 bg-emerald-400/[0.07]') : 'border-white/10 bg-white/[0.03]')}>
              <span className="w-24 shrink-0 text-xs font-semibold text-slate-500">{who}</span>
              <span className="text-slate-200">
                {text} {last && (tamper ? <X size={16} className="ml-1 inline text-rose-300" /> : <Check size={16} className="ml-1 inline text-emerald-300" />)}
              </span>
            </motion.div>
          )
        })}
      </div>
      <Controls>
        <Btn size="sm" icon={ChevronRight} disabled={n >= steps.length} onClick={() => setN(n + 1)}>
          {n === 0 ? 'Start' : 'Next step'}
        </Btn>
        <Btn size="sm" variant="ghost" icon={RotateCcw} onClick={() => setN(0)}>
          Reset
        </Btn>
      </Controls>
    </div>
  )
}

/* ============================ authentication protocols ============================ */

const AP = [
  { id: 'ap1.0', says: 'Alice says “I am Alice”.', flaw: 'Mallory can simply say “I am Alice”. Nothing proves it.' },
  { id: 'ap2.0', says: 'Alice says “I am Alice” in an IP packet containing her source IP address.', flaw: 'Mallory crafts a packet that spoofs Alice’s source address.' },
  { id: 'ap3.0', says: 'Alice says “I am Alice” and sends her secret password to prove it.', flaw: 'Replay (playback) attack: Mallory records Alice’s packet and replays it later.' },
  { id: 'ap3.1', says: 'Same, but Alice sends her ENCRYPTED password.', flaw: 'Still a replay attack: Mallory replays the encrypted password and it works just as well.' },
  { id: 'ap4.0', says: 'Bob sends a nonce R (a number used once in a lifetime). Alice returns R encrypted with the shared secret key.', flaw: 'Beats replay: R is new each time, and only Alice has the key. Drawback: Alice and Bob must already share a secret key.' },
  { id: 'ap5.0', says: 'Bob sends a nonce R. Alice returns K⁻_A(R) (signed with her private key). Bob checks with K⁺_A(K⁻_A(R)) = R.', flaw: 'Man-in-the-middle: Mallory poses as Alice to Bob and as Bob to Alice, so Bob accepts Mallory’s public key as Alice’s. Alice and Bob could meet a week later and never realise Mallory read everything. Fix: certificates (a CA vouches for the public key).' },
]

export function AuthDemo() {
  const [open, setOpen] = useState(0)
  const [shown, setShown] = useState({})
  return (
    <div className="space-y-2">
      {AP.map((a, i) => (
        <div key={a.id} className="rounded-xl border border-white/10">
          <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between px-4 py-3 text-left">
            <span className="font-mono text-sm font-semibold text-white">{a.id}</span>
            <span className="ml-3 flex-1 truncate text-sm text-slate-400">{a.says}</span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="space-y-3 border-t border-white/[0.07] px-4 py-3 text-[15px] text-slate-300">
                  <div>{a.says}</div>
                  {shown[a.id] ? (
                    <div className="border-l-2 border-rose-400/50 pl-3 text-rose-100">{a.flaw}</div>
                  ) : (
                    <Btn size="sm" variant="soft" onClick={() => setShown({ ...shown, [a.id]: true })}>
                      How does Mallory break it?
                    </Btn>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
