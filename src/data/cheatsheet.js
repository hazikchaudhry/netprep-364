// Facts to copy onto the handwritten A4 sheet. Each item is short enough to write in 2-5 lines.
export const CHEAT = [
  /* ---------- Module A ---------- */
  { id: 'a1', mod: 'A', t: 'Forwarding vs routing', l: ['Data plane = forwarding (per packet, input→output port, uses forwarding table)', 'Control plane = routing (computes the table); per-router vs centralised (controller + control agents)'] },
  { id: 'a2', mod: 'A', t: 'Dijkstra (link state)', l: ['N′={u}; D(v)=c(u,v) else ∞', 'loop: pick w∉N′ with min D(w); add to N′; for each neighbour v∉N′: D(v)=min(D(v), D(w)+c(w,v))', 'p(v)=predecessor · O(n²) (O(n log n) better) · used by OSPF', 'Result = forwarding table (first link on each path)'], hot: true },
  { id: 'a3', mod: 'A', t: 'Bellman-Ford (distance vector)', l: ['dx(y) = min_v { c(x,v) + dv(y) } over neighbours v', 'send DV to neighbours when it changes · stops when no DV changes · used by RIP'], hot: true },
  { id: 'a4', mod: 'A', t: 'DV problems', l: ['Good news fast, bad news slow → COUNT TO INFINITY (e.g. 44 iterations)', 'Poisoned reverse: if Z routes via Y to X, Z tells Y its distance to X = ∞', 'Fails for loops with more than 3 nodes'], hot: true },
  { id: 'a5', mod: 'A', t: 'LS vs DV', l: ['LS: global info, O(n²), O(nE) msgs, oscillations (load-sensitive cost), each node computes own table', 'DV: neighbours only, loops/count-to-∞, wrong cost spreads through network'] },
  { id: 'a6', mod: 'A', t: 'AS, intra vs inter', l: ['AS = region (scale + admin autonomy) · gateway router = edge router linking to other AS', 'Intra-AS: one admin, performance; same protocol inside · Inter-AS: policy dominates'] },
  { id: 'a7', mod: 'A', t: 'RIP vs OSPF', l: ['RIP: DV, hop count, max 15, DV every 30 s', 'OSPF: LS + Dijkstra, floods LSAs to whole AS, directly over IP, authenticated, equal-cost multipath', 'OSPF areas: backbone + local areas; area border routers SUMMARISE their area; boundary routers → other ASes', 'IS-IS ≈ OSPF · IGRP = Cisco'], hot: true },
  { id: 'a8', mod: 'A', t: 'BGP', l: ['Inter-AS, path vector, over TCP · eBGP = between GATEWAYS of neighbouring ASes · iBGP = spread inside AS', 'Messages: OPEN, UPDATE (advertise/withdraw), KEEPALIVE (also ACKs OPEN), NOTIFICATION (errors/close)', 'Route = prefix + attributes (AS-PATH, NEXT-HOP) · import/export policy', 'Selection: 1 local pref → 2 shortest AS-PATH → 3 closest NEXT-HOP (hot potato) → 4 other'], hot: true },
  { id: 'a9', mod: 'A', t: 'Hot potato', l: ['Pick gateway with least INTRA-AS cost; get packet OUT of my AS ASAP; ignore inter-domain cost (2d → 2a: 201 < 263)'], hot: true },
  { id: 'a10', mod: 'A', t: 'SNMP', l: ['Managing server · managed device + agent · MIB (data) · SMI (definition language)', 'Get/GetNext/GetBulk/Set (manager→agent), Response (agent→manager), Trap (agent→manager, exceptional event)'] },

  /* ---------- Module B ---------- */
  { id: 'b1', mod: 'B', t: 'Link layer', l: ['Frame = layer-2 packet · hop-by-hop between ADJACENT nodes · lives in the NIC', 'Services: framing/link access, reliable delivery (rare on low-error links), flow control, error detection/correction, half/full duplex'] },
  { id: 'b2', mod: 'B', t: 'Parity', l: ['Even parity = total # of 1s even (XOR of data bits) · single parity detects ODD # of flips only', '2-D parity: detect + CORRECT 1-bit error (failing row ∩ failing column), detects any 2-bit error', 'Problem-sheet format x,y = column,row from 0'], hot: true },
  { id: 'b3', mod: 'B', t: 'Internet checksum', l: ['16-bit words, one’s-complement sum (wrap carry), then flip bits · transport layer only'] },
  { id: 'b4', mod: 'B', t: 'CRC', l: ['r = len(G) − 1 · append r zeros to D · divide by G with XOR (mod 2) · R = remainder', 'Send <D,R> · receiver remainder ≠ 0 → error · detects bursts < r+1 bits · Ethernet, 802.11', 'Check: D=11111, G=101010 → 10000 · D=10101010, G=111111 → 10100'], hot: true },
  { id: 'b5', mod: 'B', t: 'MAC protocol families', l: ['Channel partitioning: TDMA (slots), FDMA (bands) – idle slots wasted, 1/N share', 'Random access: ALOHA, slotted ALOHA, CSMA, CSMA/CD, CSMA/CA', 'Taking turns: polling (Bluetooth), token passing (FDDI) – overhead, latency, single point of failure'] },
  { id: 'b6', mod: 'B', t: 'ALOHA', l: ['Slotted: success = N·p·(1−p)^(N−1), best p = 1/N → 1/e ≈ 37%', 'Pure: collides with frames in [t0−1, t0+1] → 1/2e ≈ 18%'], hot: true },
  { id: 'b7', mod: 'B', t: 'CSMA/CD', l: ['Listen before talk; collisions still happen (propagation delay)', 'CD: abort + jam signal; wired easy, wireless hard (→ CSMA/CA in 802.11)', 'Binary backoff: after m-th collision K ∈ {0…2^m −1}, wait K×512 bit times', 'Efficiency → 1 as t_prop → 0 or t_trans → ∞'] },
  { id: 'b8', mod: 'B', t: 'MAC vs IP address', l: ['MAC: 48-bit hex, in NIC, assigned by IEEE, flat → portable, identifies an interface on the LOCAL subnet · broadcast FF-FF-FF-FF-FF-FF', 'Why both: IP = where in the world, MAC = next hop on this wire; HW filtering; layer independence; DHCP works before IP exists'], hot: true },
  { id: 'b9', mod: 'B', t: 'ARP', l: ['IP → MAC · broadcast query (dest FF-FF-…), UNICAST reply · table <IP, MAC, TTL≈20 min> · plug-and-play'] },
  { id: 'b10', mod: 'B', t: 'Routing to another subnet', l: ['A frames to ROUTER’s MAC, dest IP = B · router re-frames with B’s MAC', 'IP stays the same end-to-end · MAC changes at every router hop · switch changes neither'], hot: true },
  { id: 'b11', mod: 'B', t: 'Ethernet', l: ['Frame: preamble 8 (7×10101010 + 10101011) | dest 6 | src 6 | type 2 | data | CRC 4', 'Connectionless, unreliable (no ACK/NAK) · bus (collision domain) vs switched · same frame format at all speeds'] },
  { id: 'b12', mod: 'B', t: 'Switch', l: ['Link layer, store-and-forward, transparent, plug-and-play, self-learning · table (MAC, interface, TTL)', '1 learn SOURCE → 2 look up DEST → known: forward (drop if same segment) / unknown: FLOOD (all but arrival port)', 'Each link = own collision domain, full duplex · vs router: MAC vs IP, learn vs routing algo'], hot: true },
  { id: 'b13', mod: 'B', t: 'VLAN', l: ['Port-based: 1 switch = several virtual switches · isolation · dynamic membership', 'Between VLANs → routing · trunk port carries VLAN ID between switches'] },
  { id: 'b14', mod: 'B', t: 'Data centre', l: ['Border routers → Tier-1 (core) → Tier-2 (aggregation) → TOR → racks (20–40 blades)', 'Rich interconnect = throughput + reliability · leaf–spine · load balancer = app-layer routing, hides internals'] },

  /* ---------- Module C ---------- */
  { id: 'c1', mod: 'C', t: 'Security basics', l: ['Info security protects confidentiality, integrity, availability (NIST SP 800-12)', 'Technologies + policies + practices; no silver bullet · Alice, Bob, Mallory'] },
  { id: 'c2', mod: 'C', t: 'Confidentiality', l: ['Threats: eavesdropping/sniffing, unauthorised access (weak pw, social engineering, phishing), shoulder surfing', 'Counter: encryption (TLS), access control (pw, 2FA), physical security (swipe card)'], hot: true },
  { id: 'c3', mod: 'C', t: 'Integrity', l: ['Data integrity (storage/processing/transit) + system integrity (does intended job); non-repudiation, authenticity', 'Threats: malicious modification (tampering, MITM), accidental, corruption', 'Counter: hashing (digital signatures), data validation, version control'], hot: true },
  { id: 'c4', mod: 'C', t: 'Availability', l: ['Timely, reliable access', 'Threats: DoS, malware (ransomware), insider (deleting DB)', 'Counter: redundancy (load balancers), access control (rate limiting, logging/auditing), backups (test the restore!)'], hot: true },
  { id: 'c5', mod: 'C', t: 'CIA trade-offs', l: ['C vs A: strong encryption/MFA slow things down', 'I vs A: aggressive validation rejects legitimate input', 'A vs C/I: CDNs/multiple instances – updates take time to propagate'] },

  /* ---------- Module D ---------- */
  { id: 'd1', mod: 'D', t: 'ICMP', l: ['Network-layer msgs carried IN IP datagrams · NO port numbers', 'Message = type + code (+ IP header + first 8 bytes of offending datagram for errors)', 'Types/codes: echo request 8/0 · echo reply 0/0 · TTL exceeded 11/0 · port unreachable 3/3'], hot: true },
  { id: 'd2', mod: 'D', t: 'Echo (ping) format', l: ['Type 1 | Code 1 | Checksum 2 | Identifier 2 | Sequence 2 | Data (variable)', 'Reply copies identifier, sequence and data · successive requests: same id, sequence +1'] },
  { id: 'd3', mod: 'D', t: 'Traceroute', l: ['TTL = 1, 2, 3, … · router at TTL 0 drops it, sends ICMP 11/0 (source IP = the router) · 3 probes per hop', 'Stop when destination replies: UDP probes → 3/3 port unreachable; ICMP probes → echo reply 0/0 · * * * = ICMP blocked', 'TTL-exceeded packet: outer IP hdr | ICMP hdr 8 B | original IP hdr | first 8 B of original (embedded TTL ≈ 1)'], hot: true },
]

export const LINES_TARGET = 90
export const lineCount = (item) => item.l.reduce((a, s) => a + Math.max(1, Math.ceil(s.length / 95)), 1)
