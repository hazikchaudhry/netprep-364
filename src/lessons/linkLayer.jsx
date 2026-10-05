import FieldDiagram from '../components/FieldDiagram'
import FlipCards from '../components/FlipCards'
import Classify from '../components/Classify'
import { Callout, Demo, K, Li, Mono, P, Reveal, Table, Ul } from '../components/ui'
import { HopStack, Parity1D, ParityDemo, ChecksumDemo, CrcDemo } from '../demos/LinkBasics'
import { TdmaFdma, AlohaSim, AlohaChart, CsmaTimeline, BackoffDemo, TokenRing } from '../demos/MacDemos'
import { ArpDemo, HopFrames, SwitchLab, VlanDemo, DataCenter } from '../demos/LanDemos'

export const linkLayer = [
  /* ------------------------------------------------------------------ */
  {
    id: 'll-intro',
    title: 'What the link layer does',
    time: '7 min',
    priority: 'med',
    steps: [
      {
        title: 'One datagram, many link protocols',
        body: (
          <>
            <Ul>
              <Li>
                <K>Nodes</K> = hosts and routers. <K>Links</K> = channels connecting <b>adjacent</b> nodes (wired, wireless, LANs).
              </Li>
              <Li>
                A layer-2 packet is a <K>frame</K>; it encapsulates a datagram.
              </Li>
              <Li>
                The link layer moves a datagram <b>from one node to a physically adjacent node over a link</b>. Each hop may use a different link protocol (WiFi on the first link, Ethernet on the next) with different services.
              </Li>
            </Ul>
            <Demo title="Follow the datagram" hint="Next link – the frame wrapper changes, the datagram doesn’t">
              <HopStack />
            </Demo>
          </>
        ),
      },
      {
        title: 'Link-layer services',
        body: (
          <>
            <P>Tap each card.</P>
            <FlipCards
              h={128}
              cards={[
                { front: 'Framing & link access', back: 'Encapsulate the datagram in a frame (header + trailer). Channel access if the medium is shared. MAC addresses in the header identify source and destination – different from IP addresses!' },
                { front: 'Reliable delivery (adjacent nodes)', back: 'We already know how to do this. Seldom used on low bit-error links (fibre, some twisted pair). Used on wireless – high error rates.' },
                { front: 'Flow control', back: 'Pacing between adjacent sending and receiving nodes.' },
                { front: 'Error detection', back: 'Errors from signal attenuation and noise. Receiver detects them, then signals retransmission or drops the frame.' },
                { front: 'Error correction', back: 'Receiver identifies AND corrects bit error(s) without retransmission.' },
                { front: 'Half / full duplex', back: 'Half duplex: both ends can transmit but not at the same time. Full duplex: both at once.' },
              ]}
            />
            <Callout kind="tip">
              Slide question: “why both link-level and end-to-end reliability?” Link-level reliability fixes errors on lossy hops (wireless) cheaply; end-to-end (TCP) is still needed because errors can happen elsewhere (e.g. in a router).
            </Callout>
          </>
        ),
      },
      {
        title: 'Where does it live?',
        body: (
          <>
            <Ul>
              <Li>
                In <b>every host</b>, implemented in the <K>network interface card (NIC)</K> / on a chip (e.g. Ethernet or 802.11 card).
              </Li>
              <Li>It implements the <b>link and physical layers</b> and plugs into the host’s system bus. A mix of hardware, software and firmware.</Li>
              <Li>
                <b>Sending side</b>: encapsulates the datagram in a frame, adds error-checking bits, rdt, flow control…
              </Li>
              <Li>
                <b>Receiving side</b>: looks for errors, rdt, flow control…, extracts the datagram and passes it up.
              </Li>
            </Ul>
          </>
        ),
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'll-errors',
    title: 'Error detection: parity, checksum, CRC',
    time: '16 min',
    priority: 'high',
    steps: [
      {
        title: 'The idea: add redundancy',
        body: (
          <>
            <Ul>
              <Li>
                <K>D</K> = data protected by error checking (may include header fields). <K>EDC</K> = error-detection-and-correction bits (redundancy).
              </Li>
              <Li>
                Error detection is <b>not 100% reliable</b> – the protocol may miss some errors, but rarely.
              </Li>
              <Li>A <b>larger EDC field</b> gives better detection and correction.</Li>
              <Li>
                Error types: <b>single-bit</b>, multiple bits, <b>burst</b> errors.
              </Li>
            </Ul>
            <Table
              head={['Technique', 'Detect', 'Correct?', 'Where']}
              rows={[
                ['Single parity bit', 'odd # of flipped bits', 'no', '–'],
                ['2-D parity', 'any 1- or 2-bit error', 'single-bit only', '–'],
                ['Internet checksum', 'most errors', 'no', 'transport layer only'],
                ['CRC', 'all bursts shorter than r+1 bits', 'no', 'Ethernet, 802.11 WiFi'],
              ]}
            />
          </>
        ),
      },
      {
        title: 'Single parity bit',
        body: (
          <>
            <Ul>
              <Li>
                <K>Even parity</K>: set the parity bit so the number of 1s (data + parity) is <b>even</b>. Odd parity: make it odd.
              </Li>
              <Li>The parity bit is the <b>XOR of all data bits</b> (inverted for odd parity).</Li>
              <Li>Receiver recomputes parity; if it doesn’t match → <b>error detected</b>.</Li>
            </Ul>
            <Demo title="Flip some bits" hint="what if you flip two?">
              <Parity1D />
            </Demo>
            <Callout kind="trap">Single parity only detects an <b>odd</b> number of bit flips. Two flips cancel out → undetected. And it can’t say <i>which</i> bit is wrong.</Callout>
          </>
        ),
      },
      {
        title: 'Two-dimensional parity',
        body: (
          <>
            <P>
              Add a parity bit for every <b>row</b> and every <b>column</b>. A single flipped bit breaks <b>one row and one column</b> – their intersection is the culprit.
            </P>
            <Demo title="2-D parity playground" hint="flip 1 bit, then 2, then 3">
              <ParityDemo />
            </Demo>
            <Callout kind="remember">
              2-D parity can <K>detect and correct single-bit errors</K>, and detect any 2-bit error (but not correct it). <i>Detecting and correcting without retransmission</i> = forward error correction.
            </Callout>
            <Callout kind="slide" title="Problem sheet format">
              “Indicate the row and column with the flipped bit (format x,y), top-left bit is 0,0” → <b>x = column, y = row</b>. Figure 2’s answer was <Mono>15,1</Mono>: column 15, row 1. Practise this in the Calculation lab.
            </Callout>
          </>
        ),
      },
      {
        title: 'Internet checksum (review)',
        body: (
          <>
            <Ul>
              <Li>
                Treat the contents as a sequence of <b>16-bit integers</b>; checksum = <K>one’s-complement sum</K> (add, wrap any carry around, then flip the bits).
              </Li>
              <Li>
                Receiver recomputes. <b>Not equal → error detected</b>. Equal → no error detected… “but maybe errors nonetheless?”
              </Li>
              <Li>
                Note: the slides stress it is used <b>only at the transport layer</b> (UDP/TCP) – the link layer uses CRC.
              </Li>
            </Ul>
            <Demo title="Compute a checksum" hint="Edit the words if you like">
              <ChecksumDemo />
            </Demo>
          </>
        ),
      },
      {
        title: 'CRC: the powerful one',
        body: (
          <>
            <Ul>
              <Li>
                <K>D</K> = data bits (think of it as a binary number). <K>G</K> = generator pattern of <b>r+1 bits</b> (given by the CRC standard).
              </Li>
              <Li>
                Sender computes <b>r</b> CRC bits <K>R</K> so that <b>&lt;D,R&gt; is exactly divisible by G (mod 2)</b>.
              </Li>
              <Li>
                Receiver divides &lt;D,R&gt; by G. <b>Non-zero remainder → error</b>.
              </Li>
              <Li>
                Detects all <b>burst errors shorter than r+1 bits</b>. Used in Ethernet and 802.11.
              </Li>
            </Ul>
            <div className="rounded-xl border border-sky-400/30 bg-sky-400/10 p-3 text-center font-mono text-sm text-sky-100">
              R = remainder [ D·2<sup>r</sup> ÷ G ] &nbsp;(mod-2 division = XOR)
            </div>
            <Callout kind="trap">
              Number of CRC bits <b>r = (length of G) − 1</b>. If G = 101010 (6 bits) → <b>5</b> CRC bits. Also: mod-2 means <b>XOR, no borrowing, no carries</b>.
            </Callout>
          </>
        ),
      },
      {
        title: 'Do a CRC by hand (then check)',
        body: (
          <>
            <P>
              Step through the long division. The presets are real questions from your slides, problem sheet and the 2023/2024 tests.
            </P>
            <Demo title="CRC calculator" hint="Next XOR → watch the remainder appear">
              <CrcDemo />
            </Demo>
            <Callout kind="past">
              2023 Q19: D = 11111, G = 101010 → <b>10000</b>. 2024 Q14: D = 10101010, G = 111111 → <b>10100</b>. Problem sheet: D = 10011111, G = 1001 → <b>110</b>; D = 10011100 → <b>101</b>.
            </Callout>
            <Callout kind="tip">
              Hand method: write D followed by r zeros. Find the leftmost 1, XOR G under it, repeat from the next leftmost 1, until fewer than r+1 bits remain. Those r bits are R.
            </Callout>
          </>
        ),
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'll-mac',
    title: 'Sharing a wire: multiple access',
    time: '18 min',
    priority: 'high',
    steps: [
      {
        title: 'The problem: one channel, many talkers',
        body: (
          <>
            <Ul>
              <Li>
                Two kinds of links: <b>point-to-point</b> (switch↔host, PPP) and <K>broadcast</K> (shared wire/medium: old-school Ethernet, upstream HFC, 802.11 WiFi, 4G/5G, satellite).
              </Li>
              <Li>
                Two or more simultaneous transmissions → <K>collision</K> (a node receives 2+ signals at the same time).
              </Li>
              <Li>
                A <K>multiple access protocol</K> = a <b>distributed algorithm</b> deciding who may transmit when. Coordination must use <b>the channel itself</b> (no out-of-band channel).
              </Li>
            </Ul>
            <Callout kind="remember" title="The ideal protocol (rate R bps)">
              1 node wants to send → it gets rate <b>R</b>. M nodes want to send → each gets <b>R/M</b> on average. <b>Fully decentralised</b> (no special coordinator, no clock/slot sync). <b>Simple.</b>
            </Callout>
            <Demo title="Which family?" hint="tap">
              <Classify
                cats={['Channel partitioning', 'Random access', 'Taking turns']}
                items={[
                  { text: 'Divide the channel into pieces (time slots, frequency, code) and give each node its own', cat: 'Channel partitioning' },
                  { text: 'Channel not divided: allow collisions and recover from them', cat: 'Random access' },
                  { text: 'Nodes take turns, but nodes with more to send can take longer turns', cat: 'Taking turns' },
                  { text: 'TDMA, FDMA', cat: 'Channel partitioning' },
                  { text: 'ALOHA, CSMA, CSMA/CD', cat: 'Random access' },
                  { text: 'Polling, token passing', cat: 'Taking turns' },
                ]}
              />
            </Demo>
          </>
        ),
      },
      {
        title: 'Channel partitioning: TDMA & FDMA',
        body: (
          <>
            <Ul>
              <Li>
                <K>TDMA</K>: access in “rounds”; each station gets a <b>fixed-length slot</b> (= packet transmission time) every round. Unused slots go idle.
              </Li>
              <Li>
                <K>FDMA</K>: spectrum divided into <b>frequency bands</b>; each station gets a fixed band. Unused band time goes idle.
              </Li>
              <Li>Slides’ example: 6-station LAN, stations 1, 3, 4 have packets → slots/bands 2, 5, 6 sit idle.</Li>
            </Ul>
            <Demo title="Idle slots = wasted capacity" hint="toggle stations">
              <TdmaFdma />
            </Demo>
            <Callout kind="remember">Good at <b>high load</b> (fair, efficient) but <b>inefficient at low load</b>: you only ever get 1/N, even if you’re the only active node.</Callout>
          </>
        ),
      },
      {
        title: 'Random access: ALOHA',
        body: (
          <>
            <P>
              <K>Slotted ALOHA</K> – assumptions: all frames the same size; time divided into equal slots (time to send 1 frame); nodes start only at slot beginnings; nodes are synchronised; if 2+ transmit in a slot, <b>all nodes detect the collision</b>.
            </P>
            <Ul>
              <Li>Fresh frame → transmit in the <b>next slot</b>.</Li>
              <Li>No collision → send the next frame in the next slot.</Li>
              <Li>
                Collision → retransmit in <b>each subsequent slot with probability p</b> until success.
              </Li>
            </Ul>
            <Demo title="Slotted ALOHA simulator" hint="find the p that maximises success">
              <AlohaSim />
            </Demo>
            <Table
              head={['Pros', 'Cons']}
              rows={[['A single active node can use the full channel rate; highly decentralised (only slots must be in sync); simple', 'Collisions waste slots; idle slots; collisions could be detected faster than a whole packet time; clock synchronisation needed']]}
            />
          </>
        ),
      },
      {
        title: 'ALOHA efficiency: 1/e and 1/2e',
        body: (
          <>
            <Ul>
              <Li>
                N nodes, each transmits with probability p. P(a <i>given</i> node succeeds) = <Mono>p(1−p)^(N−1)</Mono>.
              </Li>
              <Li>
                P(<i>any</i> node succeeds) = <Mono>N·p·(1−p)^(N−1)</Mono>.
              </Li>
              <Li>
                Max when <K>p* = 1/N</K> (on average one node tries per slot). Then efficiency = (1 − 1/N)^(N−1) → as N grows: <K>1/e ≈ 0.37</K>.
              </Li>
              <Li>
                <b>Pure (unslotted) ALOHA</b>: transmit immediately, no sync. A frame sent at t₀ collides with frames sent in [t₀−1, t₀+1] → efficiency <K>18%</K> (≈ 1/2e, half of slotted).
              </Li>
            </Ul>
            <Demo title="Efficiency vs offered load">
              <AlohaChart />
            </Demo>
            <Callout kind="trap">
              “At best, the channel is used for useful transmissions <b>37%</b> of the time” = slotted. Pure ALOHA = <b>18%</b>. Don’t mix them.
            </Callout>
          </>
        ),
      },
      {
        title: 'CSMA: listen before you talk',
        body: (
          <>
            <Ul>
              <Li>
                <K>CSMA</K>: listen before transmitting. Channel idle → transmit the <b>entire frame</b>. Busy → <b>defer</b>. (“Don’t interrupt others!”)
              </Li>
              <Li>
                Collisions can <b>still</b> happen: <K>propagation delay</K> means two nodes may not hear each other’s just-started transmission. Distance &amp; propagation delay determine the collision probability.
              </Li>
              <Li>With plain CSMA, a collision wastes the <b>entire packet transmission time</b>.</Li>
            </Ul>
            <Demo title="Space–time picture" hint="slide B’s start time and the cable length">
              <CsmaTimeline />
            </Demo>
          </>
        ),
      },
      {
        title: 'CSMA/CD and backoff',
        body: (
          <>
            <P>
              <K>CSMA/CD</K> = CSMA + <b>collision detection</b>: collisions are detected within a short time and the colliding transmissions are <b>aborted</b>, reducing wasted channel time. Easy in <b>wired</b> LANs (compare transmitted vs received signal strength); hard in <b>wireless</b> (received signal is much weaker than your own transmission) – that’s why 802.11 uses <K>CSMA/CA</K>.
            </P>
            <ol className="list-decimal space-y-1.5 pl-5 text-[15px] text-slate-300">
              <li>NIC receives a datagram from the network layer, creates a frame.</li>
              <li>Senses the channel: idle → start sending. Busy → wait until idle, then send.</li>
              <li>Whole frame sent without a collision → done!</li>
              <li>Another transmission detected while sending → <b>abort and send a jam signal</b>.</li>
              <li>
                <K>Binary (exponential) backoff</K>: after the m-th collision pick K at random from <Mono>{'{0, 1, 2, …, 2^m − 1}'}</Mono>, wait <b>K × 512 bit times</b>, go back to step 2.
              </li>
            </ol>
            <Demo title="Make collisions happen" hint="watch the range double">
              <BackoffDemo />
            </Demo>
            <Callout kind="remember">
              Efficiency → 1 as <b>t<sub>prop</sub> → 0</b> or <b>t<sub>trans</sub> → ∞</b>. Better than ALOHA, and simple, cheap and decentralised.
            </Callout>
          </>
        ),
      },
      {
        title: 'Taking turns: polling & token passing',
        body: (
          <>
            <P>
              Channel partitioning is great at high load, random access is great at low load. “Taking turns” protocols try to get the best of both.
            </P>
            <Demo title="Poll or pass the token" hint="tap nodes to give them data">
              <TokenRing />
            </Demo>
            <Ul>
              <Li>
                <K>Polling</K>: a centralised controller “invites” nodes to transmit in turn. Typically for “dumb” devices. <b>Bluetooth</b> uses polling.
              </Li>
              <Li>
                <K>Token passing</K>: a control token is passed sequentially; transmit while holding it. Used by FDDI, token ring.
              </Li>
              <Li>
                Concerns (both): <b>overhead, latency, single point of failure</b> (master / token).
              </Li>
              <Li>Cable access networks mix it all: FDM + TDM + random access.</Li>
            </Ul>
            <Callout kind="remember" title="Summary of MAC protocols">
              <b>Channel partitioning</b> by time/frequency/code (TDMA, FDMA). <b>Random access</b>: ALOHA, S-ALOHA, CSMA, CSMA/CD. Carrier sensing is easy on wires, hard on wireless. <b>CSMA/CD</b> was used in old (shared) Ethernet; <b>CSMA/CA</b> in 802.11. <b>Taking turns</b>: polling, token passing.
            </Callout>
          </>
        ),
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'll-addr',
    title: 'MAC addresses & ARP',
    time: '14 min',
    priority: 'high',
    steps: [
      {
        title: 'Two kinds of address',
        body: (
          <>
            <Table
              head={['', 'IP address', 'MAC (LAN / physical / Ethernet) address']}
              rows={[
                ['Size', '32 bits', '48 bits, written in hex: 1A-2F-BB-76-09-AD (each digit = 4 bits)'],
                ['Layer / use', 'Network layer; used for layer-3 forwarding', 'Used “locally” to get a frame from one interface to another physically connected interface (same subnet)'],
                ['Where', 'Locally unique on the LAN, depends on the subnet you’re attached to (not portable)', 'Burned into the NIC ROM (sometimes software-settable). Allocation administered by IEEE – manufacturers buy a chunk so addresses are unique'],
                ['Analogy', 'postal address', 'IRD / social-security number'],
              ]}
            />
            <Callout kind="remember">MAC addresses are a <b>flat</b> address space → <b>portable</b>: move the interface to another LAN and it keeps its MAC. Broadcast MAC = <Mono>FF-FF-FF-FF-FF-FF</Mono>.</Callout>
            <Callout kind="past">
              “What is the function of a MAC address?” → <b>to identify a network interface in a local subnet</b> (get a frame to the next physical interface). It does NOT identify an IP address, forward frames between LANs, or enable self-learning with IP addresses. Asked in 2022 and 2023.
            </Callout>
          </>
        ),
      },
      {
        title: 'Why do we need MAC addresses if we have IP?',
        body: (
          <>
            <Ul>
              <Li>
                <K>IP gives the destination across the world</K> (hierarchy tells you <i>where</i>). <K>MAC gives the next hop on this wire.</K>
              </Li>
              <Li>
                <K>Hardware filtering</K>: the adapter filters by MAC without bothering the CPU (WiFi is broadcast – the CPU would otherwise inspect every packet).
              </Li>
              <Li>
                <K>Layer independence</K>: the link layer carries more than IP (e.g. ARP).
              </Li>
              <Li>
                <K>Works before IP is assigned</K>: a device joining the network has no IP yet – DHCP uses the MAC.
              </Li>
            </Ul>
            <Table
              head={['Hop', 'Dest IP', 'Dest MAC']}
              mono
              rows={[
                ['A → R', '222.222.222.222', 'E6-E9-00-17-BB-4B (R)'],
                ['R → B', '222.222.222.222', '49-BD-D2-C7-56-2A (B)'],
              ]}
            />
            <div className="text-xs text-slate-400">Same destination IP at both hops – the destination MAC changes (slide “Why do we need MAC addresses…”).</div>
            <Reveal q="Bonus slide: where are IP addresses unique?">
              <ul className="list-disc space-y-1 pl-5">
                <li><b>Public</b> IPs: globally unique (ICANN → regional registry → ISP → organisation); reallocated over time.</li>
                <li><b>Private</b> IPs: unique inside their own network – 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. Reused in millions of networks, never routed on the Internet.</li>
                <li><b>NAT</b> connects them: public IP + port identifies the connection (10.0.0.1:3345 ↔ 138.76.29.7:5001).</li>
              </ul>
            </Reveal>
          </>
        ),
      },
      {
        title: 'ARP: IP → MAC',
        body: (
          <>
            <Ul>
              <Li>
                Each IP node (host, router) on the LAN keeps an <K>ARP table</K>: <Mono>&lt;IP address; MAC address; TTL&gt;</Mono>. The TTL is when the mapping is forgotten (typically <b>20 min</b>) – “soft state”.
              </Li>
              <Li>
                If the MAC isn’t in the table: <b>broadcast an ARP query</b> (dest MAC FF-FF-FF-FF-FF-FF) containing the target IP. <b>Only the owner replies</b>, directly to the asker.
              </Li>
              <Li>
                ARP is <b>plug-and-play</b>: nodes build their ARP tables without admin intervention.
              </Li>
            </Ul>
            <Demo title="ARP step by step" hint="try both destinations">
              <ArpDemo />
            </Demo>
          </>
        ),
      },
      {
        title: 'Sending to another subnet',
        body: (
          <>
            <Callout kind="remember" title="The one rule">
              <b>IP addresses stay the same end-to-end. MAC addresses change at every router hop.</b> A <b>switch</b> never changes either.
            </Callout>
            <P>
              A creates a frame whose <b>destination MAC is the router’s</b> (A knows R’s IP as its first-hop router, and gets R’s MAC with ARP). R pulls the datagram up to IP, picks the outgoing interface, and builds a <b>new frame</b> with B’s MAC as destination.
            </P>
            <Demo title="Problem-sheet Q3: the datagram from B to A" hint="tap points 3, 2, 1">
              <HopFrames />
            </Demo>
            <Callout kind="slide" title="Problem sheet answers">
              Point 3: src MAC 60-E2-34-53-EF-3D, dst MAC 85-14-BD-7C-D0-E6, IPs 128.119.90.182 → 128.119.149.235. At point 2 MACs change (yes): 27-1F-BF-6F-90-AA → 44-E0-4E-95-7E-61. At point 1 they do <b>not</b> change.
            </Callout>
          </>
        ),
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'll-ethernet',
    title: 'Ethernet',
    time: '6 min',
    priority: 'med',
    steps: [
      {
        title: 'The dominant wired LAN',
        body: (
          <>
            <Ul>
              <Li>First widely used LAN technology. Simple, cheap. Kept up with the speed race: <b>10 Mbps → 400 Gbps</b>. Single chip, multiple speeds.</Li>
              <Li>
                <K>Bus</K> (coax, popular until the mid-90s): all nodes in the <b>same collision domain</b>.
              </Li>
              <Li>
                <K>Switched</K> (prevails today): an active layer-2 switch in the centre; each “spoke” runs its own Ethernet – <b>nodes don’t collide with each other</b>.
              </Li>
            </Ul>
          </>
        ),
      },
      {
        title: 'The Ethernet frame',
        body: (
          <>
            <Demo title="Tap each field" hint="the real frame layout">
              <FieldDiagram
                rows={[
                  [
                    { name: 'Preamble', size: '8 B', w: 1.6, desc: '7 bytes of 10101010 followed by one byte 10101011. Used to synchronise receiver and sender clock rates.' },
                    { name: 'Dest. address', size: '6 B', w: 1.6, desc: '6-byte destination MAC. If an adapter receives a frame with a matching destination (or the broadcast address, e.g. an ARP packet) it passes the data up; otherwise it discards the frame.' },
                    { name: 'Source address', size: '6 B', w: 1.6, desc: '6-byte source MAC.' },
                    { name: 'Type', size: '2 B', w: 0.9, desc: 'Indicates the higher-layer protocol – mostly IP, but others possible (Novell IPX, AppleTalk). Used to demultiplex up at the receiver.' },
                    { name: 'Data (payload)', size: '46–1500 B', w: 3, desc: 'The IP datagram (or other network-layer packet).' },
                    { name: 'CRC', size: '4 B', w: 0.9, desc: 'Cyclic redundancy check at the receiver. Error detected → the frame is dropped.' },
                  ],
                ]}
              />
            </Demo>
          </>
        ),
      },
      {
        title: 'Ethernet properties',
        body: (
          <>
            <Ul>
              <Li>
                <K>Connectionless</K>: no handshaking between sending and receiving NICs.
              </Li>
              <Li>
                <K>Unreliable</K>: the receiving NIC sends no ACKs or NAKs. Dropped frames are recovered only if the sender uses a higher-layer rdt (e.g. TCP); otherwise the data is lost.
              </Li>
              <Li>
                Classic MAC protocol: <K>unslotted CSMA/CD with binary backoff</K>.
              </Li>
              <Li>
                Many <b>802.3 standards</b>: <b>common MAC protocol and frame format</b>, different speeds (2 Mbps … 400 Gbps) and different physical media (copper twisted pair e.g. 1000BASE-T, fibre e.g. 1000BASE-SX/LX).
              </Li>
            </Ul>
            <Demo title="Ethernet: true or false?" hint="tap">
              <Classify
                cats={['True', 'False']}
                items={[
                  { text: 'Receiving NICs send ACKs back to the sender', cat: 'False' },
                  { text: 'A frame with a bad CRC is dropped', cat: 'True' },
                  { text: 'All Ethernet standards share the same frame format', cat: 'True' },
                  { text: 'Modern switched Ethernet still needs CSMA/CD because every host shares one collision domain', cat: 'False' },
                  { text: 'The Type field is used to demultiplex to the right network-layer protocol', cat: 'True' },
                ]}
              />
            </Demo>
          </>
        ),
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'll-switch',
    title: 'Switches: learn, forward, flood',
    time: '14 min',
    priority: 'high',
    steps: [
      {
        title: 'What a switch is',
        body: (
          <>
            <Ul>
              <Li>
                A <K>link-layer device</K> with an active role: it <b>stores and forwards</b> Ethernet frames, examines the incoming frame’s MAC address and <b>selectively forwards</b> it to one or more outgoing links.
              </Li>
              <Li>
                <K>Transparent</K>: hosts are unaware of the switch.
              </Li>
              <Li>
                <K>Plug-and-play, self-learning</K>: no configuration needed.
              </Li>
              <Li>
                <K>Multiple simultaneous transmissions</K>: hosts have a dedicated direct connection; the switch buffers packets; Ethernet is used on each link so there are <b>no collisions</b> and links are full duplex – <b>each link is its own collision domain</b>.
              </Li>
            </Ul>
            <Callout kind="remember">A→A′ and B→B′ can go at the same time. But A→A′ and C→A′ cannot (they compete for A′’s link).</Callout>
          </>
        ),
      },
      {
        title: 'The switch table & the 3-line algorithm',
        body: (
          <>
            <P>
              Each entry: <Mono>(MAC address of host, interface to reach host, time stamp/TTL)</Mono>. Looks like a routing table – but nobody configures it and no routing protocol fills it. It’s learned from <b>source</b> addresses.
            </P>
            <div className="rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-[13px] leading-relaxed text-slate-200">
              <div>
                <span className="text-amber-300">1.</span> record incoming link + MAC of the <b>sending</b> host
              </div>
              <div>
                <span className="text-amber-300">2.</span> index the switch table using the MAC <b>destination</b>
              </div>
              <div>
                <span className="text-amber-300">3.</span> if entry found:
              </div>
              <div className="pl-4">if dest is on the segment the frame arrived from → <span className="text-slate-400">DROP</span></div>
              <div className="pl-4">else → <span className="text-emerald-300">FORWARD on that interface only</span></div>
              <div className="pl-2">else → <span className="text-rose-300">FLOOD</span> (all interfaces except the arriving one)</div>
            </div>
            <Callout kind="tip">
              Learn from the <b>source</b>, look up the <b>destination</b>. Unknown destination = flood. This works <b>exactly the same</b> when switches are interconnected.
            </Callout>
          </>
        ),
      },
      {
        title: 'The learning lab',
        body: (
          <>
            <P>
              This is the <K>problem-sheet Q4</K> network: 12 hosts, two self-learning switches. Press the green button to run t=1…4 (each destination replies immediately). Then read the tables and the log.
            </P>
            <Demo title="Two self-learning switches" hint="Run problem-sheet Q4, or send your own frames">
              <SwitchLab />
            </Demo>
          </>
        ),
      },
      {
        title: 'Why those tables look the way they do',
        body: (
          <>
            <Ul>
              <Li>
                <b>t=1 A→D:</b> D unknown → flood. The <i>reply</i> D→A is forwarded only to A’s port (A is known at the right switch) – so the <b>left switch never learns D</b>.
              </Li>
              <Li>
                <b>t=2 K→J</b> (same switch): left switch learns K, floods (J unknown) – the flood crosses the trunk, so the right switch learns K on port 7. J’s reply to K stays inside the left switch.
              </Li>
              <Li>
                <b>t=3 K→F</b>, <b>t=4 I→C</b>: both unknown → flooded across the trunk; replies teach each switch where F and C are.
              </Li>
            </Ul>
            <Reveal q="Final tables from the sheet’s answers – can you predict them? (Left switch / Right switch)">
              <div className="grid gap-3 sm:grid-cols-2 font-mono text-xs">
                <div>
                  <b className="text-white">Left</b>
                  <div>A → 8</div><div>K → 14</div><div>J → 13</div><div>F → 8</div><div>I → 12</div><div>C → 8</div>
                </div>
                <div>
                  <b className="text-white">Right</b>
                  <div>A → 1</div><div>D → 4</div><div>K → 7</div><div>F → 6</div><div>I → 7</div><div>C → 3</div>
                </div>
              </div>
            </Reveal>
          </>
        ),
      },
      {
        title: 'Switches vs routers',
        body: (
          <>
            <Table
              head={['', 'Router', 'Switch']}
              rows={[
                ['Layer', 'Network layer', 'Link layer'],
                ['Looks at', 'network-layer headers (IP)', 'link-layer headers (MAC)'],
                ['Store-and-forward?', 'yes', 'yes'],
                ['Forwarding table built by', 'routing algorithms (IP addresses)', 'flooding + self-learning (MAC addresses)'],
              ]}
            />
            <Demo title="Router or switch?" hint="tap">
              <Classify
                cats={['Router', 'Switch', 'Both']}
                items={[
                  { text: 'Examines IP headers', cat: 'Router' },
                  { text: 'Learns its forwarding table by flooding and learning', cat: 'Switch' },
                  { text: 'Store-and-forward device', cat: 'Both' },
                  { text: 'Table filled using OSPF/BGP/DV', cat: 'Router' },
                  { text: 'Examines MAC addresses', cat: 'Switch' },
                  { text: 'Has a forwarding table', cat: 'Both' },
                ]}
              />
            </Demo>
          </>
        ),
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'll-vlan',
    title: 'VLANs',
    time: '6 min',
    priority: 'med',
    steps: [
      {
        title: 'Why VLANs?',
        body: (
          <>
            <P>What happens as a LAN scales or users move around?</P>
            <Ul>
              <Li>
                <K>Single broadcast domain</K>: all layer-2 broadcast traffic (ARP, DHCP, unknown MAC) must cross the <b>entire</b> LAN → efficiency, security and privacy issues.
              </Li>
              <Li>
                <K>Administrative issues</K>: a CS user moves office to ECSE – physically attached to the ECSE switch, but wants to stay logically attached to CS.
              </Li>
            </Ul>
          </>
        ),
      },
      {
        title: 'Port-based VLANs',
        body: (
          <>
            <Ul>
              <Li>
                A switch that supports VLANs can define <b>multiple virtual LANs over a single physical LAN infrastructure</b>.
              </Li>
              <Li>
                <K>Port-based VLAN</K>: ports are grouped so one physical switch acts as <b>multiple virtual switches</b> (e.g. ECSE = ports 1–8, CS = ports 9–15).
              </Li>
              <Li>
                <K>Traffic isolation</K>: frames to/from ports 1–8 can only reach ports 1–8. (VLANs can also be defined by endpoint MAC addresses.)
              </Li>
              <Li>
                <K>Dynamic membership</K>: ports can be re-assigned between VLANs.
              </Li>
              <Li>
                <K>Forwarding between VLANs</K>: done via <b>routing</b>, just as with separate switches (vendors sell combined switch + router).
              </Li>
            </Ul>
            <Demo title="Broadcast inside VLANs" hint="pick a port, send, then try the other mode">
              <VlanDemo />
            </Demo>
          </>
        ),
      },
      {
        title: 'VLANs across several switches',
        body: (
          <>
            <Ul>
              <Li>
                A <K>trunk port</K> carries frames between VLANs defined over <b>multiple physical switches</b>.
              </Li>
              <Li>
                Frames forwarded between switches must carry <b>VLAN ID information</b> – a protocol exists for that (the VLAN tag is added on the trunk).
              </Li>
              <Li>Slide example: ports 2, 3, 5 belong to the ECSE VLAN and ports 4, 6, 7, 8 to the CS VLAN – spread across the switches.</Li>
            </Ul>
            <Callout kind="tip">In the demo above, untick the trunk link: members of a VLAN on the <i>other</i> switch become unreachable. That’s the whole point of the trunk.</Callout>
          </>
        ),
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'll-dc',
    title: 'Data-centre networks',
    time: '5 min',
    priority: 'low',
    steps: [
      {
        title: 'What’s special about a data centre?',
        body: (
          <>
            <Ul>
              <Li>
                <b>10s to 100s of thousands of hosts</b>, closely coupled, in close proximity: online retailers (Amazon), cloud providers (AWS, Azure), content servers (YouTube, Akamai, Apple, Microsoft), search engines / data mining (Google).
              </Li>
              <Li>
                Challenges: <b>multiple applications</b> each serving massive numbers of clients; <b>reliability</b>; <b>managing/balancing load</b> and avoiding processing, networking and data bottlenecks.
              </Li>
            </Ul>
          </>
        ),
      },
      {
        title: 'The tiers',
        body: (
          <>
            <Demo title="Data-centre network elements" hint="tap a tier; show the disjoint paths">
              <DataCenter />
            </Demo>
            <Ul>
              <Li>
                <b>Significant interconnection</b> between switches and racks → <K>increased throughput</K> (many paths) and <K>increased reliability</K> (redundancy).
              </Li>
              <Li>
                <K>Two-layer (leaf–spine)</K> interconnection: leaf (ToR) switches ↔ spine switches. Facebook F16: each ToR connects to <b>16</b> fabric switches; each fabric switch connects to <b>16</b> spine switches.
              </Li>
            </Ul>
          </>
        ),
      },
      {
        title: 'Load balancing at the application layer',
        body: (
          <>
            <P>
              A <K>load balancer</K> is <b>application-layer routing</b>: it receives external client requests, <b>directs the workload within the data centre</b>, and returns results to the client – <b>hiding the data centre’s internals</b> from the client.
            </P>
            <Callout kind="tip">This lesson is “low priority” – your slides spend only a few slides on it. Know the tiers (border → Tier-1 core → Tier-2 aggregation → TOR → racks), why rich interconnection helps, and what the load balancer does.</Callout>
          </>
        ),
      },
    ],
  },
]
