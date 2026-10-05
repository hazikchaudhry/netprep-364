import { networkControl } from '../lessons/networkControl.jsx'
import { linkLayer } from '../lessons/linkLayer.jsx'
import { security } from '../lessons/security.jsx'
import { icmp } from '../lessons/icmp.jsx'
import { bonus } from '../lessons/bonus.jsx'

export const MODULES = [
  {
    id: 'A',
    title: 'Network Layer: Control',
    short: 'Routing',
    week: 'Week 7 · Lectures 1–3',
    blurb: 'How routers decide where packets go: Dijkstra, Bellman-Ford, OSPF, BGP, SNMP.',
    lessons: networkControl,
  },
  {
    id: 'B',
    title: 'Link Layer',
    short: 'Link layer',
    week: 'Week 8 · Lectures 4–7',
    blurb: 'Frames, error detection, sharing a wire, MAC/ARP, Ethernet, switches, VLANs.',
    lessons: linkLayer,
  },
  {
    id: 'C',
    title: 'Security Introduction',
    short: 'Security',
    week: 'Lecture 7.2 (today)',
    blurb: 'The CIA triad, Alice/Bob/Mallory, threats and counter-measures.',
    lessons: security,
  },
  {
    id: 'D',
    title: 'Lab 4 · ICMP',
    short: 'ICMP lab',
    week: 'Lab 4',
    blurb: 'Ping, traceroute and the ICMP message format you saw in Wireshark.',
    lessons: icmp,
  },
  {
    id: 'E',
    title: 'Bonus: Crypto & Signatures',
    short: 'Bonus',
    week: 'Lectures 8–9 · NOT on Test 2',
    blurb: 'Symmetric/public-key crypto, RSA, hashes, signatures, CAs. For the final exam – skip tonight.',
    lessons: bonus,
    bonus: true,
  },
]

export const ALL_LESSONS = MODULES.flatMap((m) => m.lessons.map((l) => ({ ...l, mod: m.id })))
export const TEST_LESSONS = ALL_LESSONS.filter((l) => l.mod !== 'E')
