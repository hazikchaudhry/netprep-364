import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cx } from '../lib/utils'
import { Btn, Callout, Table } from '../components/ui'

const IN_SCOPE = [
  ['Dijkstra’s algorithm is used in which protocol?', 'OSPF (Open Shortest Path First)', '2022 · 2023 · 2024', 'nc-linkstate'],
  ['Bellman-Ford is used in which protocol?', 'RIP (Routing Information Protocol)', '2023 · 2024', 'nc-dv'],
  ['A limitation of the Link-State algorithm?', 'Does not scale well as the number of nodes increases (not: passes vectors to neighbours / needs direct connection to all nodes / only between ASes)', '2022 · 2023 · 2024', 'nc-linkstate'],
  ['How does Link-State choose the next node to check?', 'The node with the lowest current cost', '2023 · 2024', 'nc-linkstate'],
  ['When does distance vector finish calculating costs?', 'When there are no more distance-vector changes to process', '2022 · 2023', 'nc-dv'],
  ['What does eBGP transmit messages between?', 'Gateway routers of neighbouring autonomous systems', '2022 · 2023 · 2024', 'nc-bgp'],
  ['What is the role of policy within BGP?', 'Choosing which routes to advertise to neighbours', '2023', 'nc-bgp'],
  ['What is the goal of hot-potato routing?', 'To move messages out of an AS as quickly as possible', '2023 · 2024', 'nc-bgp'],
  ['Purpose of area border routers in hierarchical OSPF?', 'To summarise distances to nets in their own area', '2022 · 2023 · 2024', 'nc-hier'],
  ['What is the function of a MAC address?', 'To identify a network interface in a local subnet', '2023 · 2024', 'll-addr'],
  ['CRC bits for D = 11111, G = 101010', '10000', '2023', 'll-errors'],
  ['CRC bits for D = 10101010, G = 111111', '10100', '2024', 'll-errors'],
]

const OUT = [
  ['A limitation of symmetric cryptography', 'The sender and receiver need to communicate the password (key)'],
  ['A required property of a hash function', 'Generates a distinct digest for each message (collision resistant, fixed length)'],
  ['Main purpose of a certification authority', 'To provide proof of identity for a certificate'],
  ['Purpose of a digital signature', 'To verify the source of a message'],
  ['Why is authentication used?', 'To confirm the identity of the sender or receiver'],
  ['Why is RSA secure?', 'Factoring big numbers is very hard'],
  ['What prevents a playback attack?', 'A nonce'],
  ['Keys needed for secure e-mail with confidentiality, authentication and integrity', '3 (her private key, his public key, a symmetric key)'],
  ['How does a brute-force attack work?', 'The attacker tries all possible keys / passwords'],
]

export default function PastPapers({ go }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mx-auto max-w-[760px] px-5 pb-24 pt-10 sm:px-6 sm:pt-14">
      <h1 className="text-[32px] font-bold leading-tight tracking-tight text-white">Past-test patterns</h1>
      <p className="mt-2 text-[17px] text-slate-400">The 2022, 2023 and 2024 Test 2 papers keep asking the same things. Learn these first.</p>

      <div className="mt-6">
        <Callout kind="tip" title="Honest caveats">
          These papers were written by a different lecturer, and I worked out the answers myself from your slides (no answer key was provided). The wording below is shortened. Check anything you’re unsure about against the slides.
        </Callout>
      </div>

      <h2 className="mt-10 text-lg font-semibold text-white">Still in scope for your Test 2</h2>
      <div className="mt-3 divide-y divide-white/[0.07] border-y border-white/[0.07]">
        {IN_SCOPE.map(([q, a, yrs, lesson]) => (
          <div key={q} className="py-3.5">
            <div className="text-[15px] font-medium text-white">{q}</div>
            <div className="mt-1 text-[15px] text-emerald-300">→ {a}</div>
            <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
              <span>{yrs}</span>
              <button className="text-blue-300 hover:underline" onClick={() => go(`/lesson/${lesson}`)}>
                open lesson
              </button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => setOpen(!open)} className="mt-10 flex w-full items-center justify-between border-t border-white/[0.07] py-4 text-left">
        <div>
          <div className="text-lg font-semibold text-white">In the old papers but not on your list</div>
          <div className="text-sm text-slate-500">Crypto and signatures: Security lectures 2 and 3, not named in Alex’s announcement</div>
        </div>
        <ChevronDown className={cx('shrink-0 text-slate-500 transition', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="pb-4">
          <Table head={['Question', 'Answer']} rows={OUT} />
          <div className="mt-3 text-sm text-slate-500">The bonus module covers these if you have time left.</div>
        </div>
      )}

      <div className="mt-8 flex gap-2">
        <Btn onClick={() => go('/practice')}>Practise these questions</Btn>
        <Btn variant="ghost" onClick={() => go('/calc')}>
          Calculation lab
        </Btn>
      </div>
    </div>
  )
}
