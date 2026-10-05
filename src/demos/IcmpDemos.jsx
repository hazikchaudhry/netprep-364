import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Play, RotateCcw, StepForward } from 'lucide-react'
import { cx, sleep } from '../lib/utils'
import { Btn, Controls } from '../components/ui'
import FieldDiagram from '../components/FieldDiagram'
import Seq from '../components/Seq'

/* ============================ message layouts ============================ */

export function IcmpFormats() {
  const [tab, setTab] = useState('echo')
  return (
    <div className="space-y-4">
      <Controls>
        {[
          ['echo', 'Echo request / reply (ping)'],
          ['err', 'Error message (e.g. TTL exceeded)'],
        ].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={cx('rounded-lg px-3 py-1.5 text-[13px] font-medium', tab === k ? 'bg-blue-500 text-white' : 'bg-white/[0.06] text-slate-300 hover:bg-white/10')}>
            {l}
          </button>
        ))}
      </Controls>
      {tab === 'echo' ? (
        <FieldDiagram
          key="echo"
          rows={[
            [
              { name: 'Type', size: '1 B', desc: 'Echo request = 8, echo reply = 0. Type + Code tell the receiver what kind of ICMP message this is, and so how to read the rest.' },
              { name: 'Code', size: '1 B', desc: '0 for both echo request and echo reply.' },
              { name: 'Checksum', size: '2 B', w: 2, desc: '16-bit checksum over the complete ICMP message, to check it was received correctly.' },
            ],
            [
              { name: 'Identifier', size: '2 B', w: 2, desc: 'Links echo requests and replies together. The reply carries the same identifier as the request; successive requests from one ping run keep the same identifier.' },
              { name: 'Sequence number', size: '2 B', w: 2, desc: 'Also links request and reply (reply copies it). Increases by 1 for each successive request.' },
            ],
            [{ name: 'Data (payload)', size: 'variable', w: 4, desc: 'Variable length. The echo reply contains the same data as the request: the target just sends it back.' }],
          ]}
        />
      ) : (
        <FieldDiagram
          key="err"
          rows={[
            [
              { name: 'Type', size: '1 B', desc: 'TTL exceeded = 11, destination unreachable = 3.' },
              { name: 'Code', size: '1 B', desc: 'TTL exceeded: 0. Port unreachable: Type 3, Code 3.' },
              { name: 'Checksum', size: '2 B', w: 2, desc: '16-bit checksum over the whole ICMP message.' },
            ],
            [{ name: 'Unused (or length)', size: '4 B', w: 4, desc: 'No Identifier / Sequence fields here (that’s the difference from echo). A modern implementation may use part of this as a length field. Header total = 8 bytes.' }],
            [{ name: 'Payload: start of the packet that caused the error', size: 'IP header + first 8 bytes', w: 4, desc: 'Error messages include the IP header of the offending datagram plus (at least) the first 8 bytes of its data, so the sender can tell which of its packets triggered the error.' }],
          ]}
        />
      )}
    </div>
  )
}

export function NestedPacket() {
  return (
    <div className="space-y-3">
      <FieldDiagram
        title="One ICMP “TTL exceeded” packet, as captured by traceroute (Lab 4 task)"
        rows={[
          [
            { name: 'IP header', size: '20 B', w: 2.4, desc: 'The router’s own IP header. Source address = the ROUTER; destination = YOU. Protocol field = 1 (ICMP). This is how the source learns the router’s IP address.' },
            { name: 'ICMP header', size: '8 B', w: 1.4, desc: 'Type 11, Code 0, 2-byte checksum, plus 4 more bytes (unused / length). 8 bytes in total.' },
            { name: 'Original IP header', size: '20 B', w: 2.4, desc: 'The header of YOUR probe packet that expired. Its source = you, destination = the target host. Its TTL is typically 1 (it arrived with TTL=1, the router decremented it to 0 and dropped it).' },
            { name: 'Original ICMP header', size: '8 B', w: 1.4, desc: 'The first 8 bytes of your probe’s payload. For a ping-style traceroute probe that is the echo-request ICMP header (type 8) with its identifier and sequence number; for a UDP probe it would be the UDP header.' },
          ],
        ]}
        footer="Left → right is the order on the wire. The last two blocks together are the ICMP payload."
      />
    </div>
  )
}

/* ============================ ping ============================ */

const PINGS = [1, 2, 3].flatMap((n) => [
  { from: 'h', to: 't', label: `Echo request  id=1  seq=${n}`, rtt: null, n, kind: 'req' },
  { from: 't', to: 'h', label: `Echo reply  id=1  seq=${n}`, tone: 'good', n, kind: 'rep' },
])

export function PingDemo() {
  return (
    <Seq
      actors={[
        { id: 'h', label: 'Your PC', sub: '192.168.1.20' },
        { id: 't', label: 'google.com', sub: '142.250.66.238' },
      ]}
      steps={PINGS.map((p) => ({
        ...p,
        note:
          p.kind === 'req'
            ? `Type 8, Code 0. Identifier stays the same for the whole ping run; sequence number = ${p.n}${p.n > 1 ? ' (previous + 1)' : ''}. Data = filler bytes.`
            : `Type 0, Code 0. Copies the request’s identifier (1) and sequence number (${p.n}), and echoes back the same data. Time between request and reply = RTT.`,
      }))}
      extra={(n) => (
        <div className="overflow-x-auto rounded-lg border border-white/10 font-mono text-[11px]">
          <div className="grid grid-cols-[2rem_1fr_1fr_2fr] bg-white/[0.04] px-2 py-1 text-slate-500">
            <span>No.</span>
            <span>Source</span>
            <span>Destination</span>
            <span>Info (Wireshark, filter “icmp”)</span>
          </div>
          {PINGS.slice(0, n).map((p, i) => (
            <div key={i} className={cx('grid grid-cols-[2rem_1fr_1fr_2fr] border-t border-white/[0.06] px-2 py-1', p.kind === 'rep' ? 'text-emerald-300' : 'text-slate-200')}>
              <span>{i + 1}</span>
              <span>{p.kind === 'req' ? '192.168.1.20' : '142.250.66.238'}</span>
              <span>{p.kind === 'req' ? '142.250.66.238' : '192.168.1.20'}</span>
              <span>{p.kind === 'req' ? 'Echo (ping) request' : 'Echo (ping) reply'} id=0x0001 seq={p.n}</span>
            </div>
          ))}
          {n === 0 && <div className="px-2 py-2 text-slate-600">(nothing captured yet)</div>}
        </div>
      )}
    />
  )
}

/* ============================ traceroute ============================ */

const HOPS = [
  { name: 'You', ip: '192.168.1.20' },
  { name: 'R1', ip: '192.168.1.1' },
  { name: 'R2', ip: '10.20.0.1' },
  { name: 'R3', ip: '172.16.8.1' },
  { name: 'R4', ip: '203.0.113.9' },
  { name: 'Dest', ip: '142.250.66.238' },
]
const N = HOPS.length - 1
const xPct = (k) => 7 + (k / N) * 86

export function TracerouteDemo() {
  const [os, setOs] = useState('linux')
  const [rows, setRows] = useState([])
  const [pkt, setPkt] = useState(null) // { pos, label, kind }
  const [boom, setBoom] = useState(null)
  const [busy, setBusy] = useState(false)
  const [finished, setFinished] = useState(false)
  const token = useRef(0)
  const rowsRef = useRef([])

  const probeName = os === 'linux' ? 'UDP segment' : 'ICMP echo request'
  const destReply = os === 'linux' ? { label: 'ICMP 3/3 port unreachable', short: 'Type 3, Code 3' } : { label: 'ICMP 0/0 echo reply', short: 'Type 0, Code 0' }

  const reset = () => {
    token.current++
    rowsRef.current = []
    setRows([])
    setPkt(null)
    setBoom(null)
    setBusy(false)
    setFinished(false)
  }

  const runProbe = async (ttl, my) => {
    let k = 0
    let pos = 0
    setPkt({ pos: 0, label: `TTL=${ttl}`, kind: 'out' })
    await sleep(200)
    for (k = 1; k <= N; k++) {
      if (token.current !== my) return false
      setPkt({ pos: k, label: `TTL=${ttl}`, kind: 'out' })
      await sleep(330)
      if (token.current !== my) return false
      pos = k
      if (k === N) break
      setPkt({ pos: k, label: `TTL=${ttl - k}`, kind: 'out' })
      await sleep(200)
      if (ttl - k === 0) break
    }
    const atDest = pos === N && ttl >= N
    setBoom(atDest ? null : pos)
    await sleep(atDest ? 150 : 350)
    setBoom(null)
    const label = atDest ? destReply.label : 'ICMP 11/0 time exceeded'
    setPkt({ pos, label, kind: 'back' })
    await sleep(60)
    if (token.current !== my) return false
    setPkt({ pos: 0, label, kind: 'back' })
    await sleep(500)
    if (token.current !== my) return false
    const base = 3 + pos * 6
    const row = { ttl, name: HOPS[pos].name, ip: HOPS[pos].ip, rtts: [0, 1, 2].map(() => base + Math.floor(Math.random() * 4)), dest: atDest }
    rowsRef.current = [...rowsRef.current, row]
    setRows(rowsRef.current)
    setPkt(null)
    if (atDest) setFinished(true)
    return atDest
  }

  const step = async () => {
    if (busy || finished) return
    setBusy(true)
    const my = token.current
    await runProbe(rowsRef.current.length + 1, my)
    if (token.current === my) setBusy(false)
  }
  const runAll = async () => {
    if (busy || finished) return
    setBusy(true)
    const my = token.current
    let done = false
    while (!done && token.current === my) {
      done = await runProbe(rowsRef.current.length + 1, my)
    }
    if (token.current === my) setBusy(false)
  }

  return (
    <div className="space-y-4">
      <Controls>
        {[
          ['linux', 'Lecture version: UDP probes'],
          ['win', 'Lab version (tracert): ICMP echo probes'],
        ].map(([k, l]) => (
          <button key={k} disabled={busy} onClick={() => { setOs(k); reset() }} className={cx('rounded-lg px-3 py-1.5 text-[13px] font-medium disabled:opacity-50', os === k ? 'bg-blue-500 text-white' : 'bg-white/[0.06] text-slate-300 hover:bg-white/10')}>
            {l}
          </button>
        ))}
      </Controls>

      <div className="relative h-36 overflow-hidden rounded-xl bg-[#0b0f17]">
        <div className="absolute left-[7%] right-[7%] top-[52%] h-px bg-slate-700" />
        {HOPS.map((h, k) => (
          <div key={h.name} className="absolute top-[52%] -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${xPct(k)}%` }}>
            <motion.div animate={{ scale: boom === k ? 1.25 : 1 }} className={cx('mx-auto flex h-10 w-10 items-center justify-center rounded-xl border text-[11px] font-semibold', boom === k ? 'border-rose-400 bg-rose-500/25 text-rose-100' : k === N ? 'border-blue-400/60 bg-blue-500/15 text-blue-200' : 'border-white/20 bg-slate-800 text-slate-200')}>
              {boom === k ? '💥' : h.name}
            </motion.div>
            <div className="mt-1 font-mono text-[9px] text-slate-500">{h.ip}</div>
          </div>
        ))}
        <AnimatePresence>
          {pkt && (
            <motion.div
              key={`${pkt.kind}`}
              initial={{ left: `${xPct(pkt.pos)}%`, opacity: 0 }}
              animate={{ left: `${xPct(pkt.pos)}%`, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ left: { duration: pkt.kind === 'back' ? 0.5 : 0.32, ease: 'easeInOut' }, opacity: { duration: 0.12 } }}
              className={cx('absolute top-[14%] -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-bold text-slate-900', pkt.kind === 'out' ? 'bg-amber-300' : 'bg-blue-300')}
            >
              {pkt.label}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Controls>
        <Btn size="sm" icon={StepForward} disabled={busy || finished} onClick={step}>
          Send probe (TTL = {rows.length + 1})
        </Btn>
        <Btn size="sm" variant="soft" icon={Play} disabled={busy || finished} onClick={runAll}>
          Run the whole traceroute
        </Btn>
        <Btn size="sm" variant="ghost" icon={RotateCcw} onClick={reset}>
          Reset
        </Btn>
      </Controls>

      <div className="rounded-xl bg-black/40 p-3 font-mono text-[12px] leading-relaxed text-slate-300">
        <div className="text-slate-500">traceroute to 142.250.66.238  ({probeName}s, 3 probes per hop)</div>
        {rows.map((r) => (
          <div key={r.ttl}>
            <span className="inline-block w-5 text-right text-slate-500">{r.ttl}</span>{'  '}
            {r.rtts.map((v, i) => (
              <span key={i} className="inline-block w-14">{v} ms</span>
            ))}
            {r.name} [{r.ip}]
            {r.dest && <span className="text-emerald-300">  ← destination replied</span>}
          </div>
        ))}
        {!rows.length && <div className="text-slate-600">(no output yet)</div>}
      </div>

      <div className="text-[15px] leading-relaxed text-slate-300">
        {finished ? (
          <>
            The probe with TTL = {N} reached the destination. It answers with <b className="text-white">{destReply.label}</b> ({destReply.short}) – {os === 'linux' ? 'the UDP port is one nobody is listening on' : 'it simply replies to the ping'} – so the source <b className="text-white">stops</b>.
          </>
        ) : (
          <>
            Each probe leaves with a bigger TTL than the last. Every router subtracts 1; the router where it hits <b className="text-white">0</b> drops it and sends <b className="text-white">ICMP type 11, code 0 (time exceeded)</b> back. The reply’s <i>source IP</i> is that router’s address.
          </>
        )}
      </div>
    </div>
  )
}
