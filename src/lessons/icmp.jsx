import FlipCards from '../components/FlipCards'
import Classify from '../components/Classify'
import { Callout, Demo, K, Li, Mono, P, Reveal, Table, Ul } from '../components/ui'
import { IcmpFormats, NestedPacket, PingDemo, TracerouteDemo } from '../demos/IcmpDemos'

export const icmp = [
  /* ------------------------------------------------------------------ */
  {
    id: 'icmp-basics',
    title: 'What ICMP is',
    time: '7 min',
    priority: 'high',
    steps: [
      {
        title: 'Messages about the network itself',
        body: (
          <>
            <P>
              <K>ICMP</K> (Internet Control Message Protocol) is how hosts and routers tell each other network-level information.
            </P>
            <Ul>
              <Li>
                <K>Error reporting</K>: unreachable host, network, port, protocol.
              </Li>
              <Li>
                <K>Echo request / reply</K>: used by <b>ping</b>.
              </Li>
              <Li>
                It sits “above” IP at the network layer, but its messages are <b>carried inside IP datagrams</b>. (IPv4 and IPv6 have their own versions.)
              </Li>
              <Li>
                An ICMP message = <K>type</K>, <K>code</K> and, for errors, <b>the first 8 bytes of the IP datagram that caused the error</b> (along with its IP header).
              </Li>
            </Ul>
            <Callout kind="trap">
              ICMP is a network-layer protocol, so it has <b>no source or destination port numbers</b> (a favourite Wireshark-lab question).
            </Callout>
          </>
        ),
      },
      {
        title: 'The message layout',
        body: (
          <>
            <P>Every ICMP message starts with the same two fields, <b>Type</b> and <b>Code</b>, which tell the receiver how to read everything after them.</P>
            <Demo title="Tap each field" hint="two layouts: echo and error">
              <IcmpFormats />
            </Demo>
          </>
        ),
      },
      {
        title: 'Type and code values',
        body: (
          <>
            <P>Tap a card to see the Type / Code.</P>
            <FlipCards
              h={104}
              cards={[
                { front: 'Echo request (ping)', back: 'Type 8, Code 0' },
                { front: 'Echo reply', back: 'Type 0, Code 0' },
                { front: 'TTL expired (“time exceeded”)', back: 'Type 11, Code 0' },
                { front: 'Destination port unreachable', back: 'Type 3, Code 3' },
                { front: 'Destination host unreachable', back: 'Type 3, Code 1' },
                { front: 'Destination network unreachable', back: 'Type 3, Code 0' },
              ]}
            />
            <Callout kind="slide">
              Your slides and lab use <b>11/0</b> (TTL exceeded), <b>3/3</b> (port unreachable, traceroute’s stop signal) and, in the Wireshark lab, <b>8/0 and 0/0</b> for echo. The other Type 3 codes are the standard values from the textbook.
            </Callout>
            <Demo title="Which message?" hint="tap">
              <Classify
                cats={['Echo request', 'Echo reply', 'TTL exceeded', 'Port unreachable']}
                items={[
                  { text: 'Type 11, Code 0', cat: 'TTL exceeded' },
                  { text: 'Type 8, Code 0', cat: 'Echo request' },
                  { text: 'Type 3, Code 3', cat: 'Port unreachable' },
                  { text: 'Type 0, Code 0', cat: 'Echo reply' },
                  { text: 'Sent by a router when a datagram’s TTL reaches 0', cat: 'TTL exceeded' },
                  { text: 'Sent by the destination at the end of a UDP traceroute', cat: 'Port unreachable' },
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
    id: 'icmp-ping',
    title: 'Ping and echo messages',
    time: '7 min',
    priority: 'high',
    steps: [
      {
        title: 'What ping does',
        body: (
          <>
            <Ul>
              <Li>
                <K>ping</K> checks that you can connect to another machine and that it is active. It’s a standard troubleshooting tool.
              </Li>
              <Li>
                It sends a small number of <b>ICMP echo requests</b>; each should elicit an <b>echo reply</b>.
              </Li>
              <Li>
                The output shows the <b>round-trip time</b> for each reply and a summary at the end (useful for machines that are only partially responsive).
              </Li>
              <Li>
                Pinging <Mono>auckland.ac.nz</Mono> gives a much lower response time than <Mono>google.com</Mono> – the lab hints at why: it’s much closer (less propagation delay).
              </Li>
            </Ul>
          </>
        ),
      },
      {
        title: 'Watch a ping capture',
        body: (
          <>
            <Demo title="Three pings in Wireshark" hint="Next message">
              <PingDemo />
            </Demo>
          </>
        ),
      },
      {
        title: 'What to notice',
        body: (
          <>
            <Table
              head={['Question from the lab', 'Answer']}
              rows={[
                ['Type/Code of echo request and reply?', 'Request 8/0, reply 0/0'],
                ['Identifier and sequence number: request vs its reply?', 'Identical – they link the pair together'],
                ['Successive echo requests?', 'Same identifier; sequence number goes up by 1 each time'],
                ['Is the reply’s data the same as the request’s?', 'Yes – the destination echoes the data back'],
                ['Checksum / identifier / sequence sizes?', '2 bytes each'],
              ]}
            />
            <Callout kind="slide" title="Wireshark detail">
              Wireshark may show identifier and sequence as both <b>Big Endian (BE)</b> and <b>Little Endian (LE)</b> values – the same bytes read in two byte orders (e.g. 00 01 is “1” in BE but “256” in LE). Don’t be thrown by it.
            </Callout>
            <Reveal q="Why does the checksum field cover the whole ICMP message?">
              It’s a 16-bit checksum over the complete ICMP message, so the receiver can check the message arrived intact.
            </Reveal>
          </>
        ),
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'icmp-traceroute',
    title: 'Traceroute and TTL exceeded',
    time: '12 min',
    priority: 'high',
    steps: [
      {
        title: 'The TTL trick',
        body: (
          <>
            <P>
              IP source and destination addresses name the <i>endpoints</i>, not the routers on the path. <K>traceroute</K> discovers the path by provoking a reply from each router in turn.
            </P>
            <ol className="list-decimal space-y-2 pl-5 text-[16px] leading-relaxed text-slate-300">
              <li>
                Send a probe with <b>TTL = 1</b>. The first router decrements it to 0, <b>discards</b> it and sends back <b>ICMP type 11, code 0</b>. Its IP address (and name) is in that reply; the source records the <b>RTT</b>.
              </li>
              <li>
                Send a probe with <b>TTL = 2</b> → second router answers. Then TTL = 3… and so on.
              </li>
              <li>
                Eventually a probe reaches the <b>destination</b>, which replies differently → the source <b>stops</b>.
              </li>
            </ol>
          </>
        ),
      },
      {
        title: 'Run it',
        body: (
          <>
            <Demo title="Traceroute, hop by hop" hint="switch between the lecture (UDP) and lab (ICMP echo) versions">
              <TracerouteDemo />
            </Demo>
          </>
        ),
      },
      {
        title: 'Probes, stopping and stars',
        body: (
          <>
            <Table
              head={['', 'Lecture / Linux traceroute', 'Lab / Windows tracert']}
              rows={[
                ['Probe packets', 'UDP segments to an unlikely port number', 'ICMP echo requests (the lab: “builds on the ping message type”)'],
                ['Routers on the way', 'ICMP type 11 code 0 (TTL exceeded)', 'ICMP type 11 code 0 (TTL exceeded)'],
                ['Destination replies with', 'ICMP port unreachable (type 3, code 3)', 'ICMP echo reply (type 0, code 0)'],
              ]}
            />
            <Ul>
              <Li>
                <b>3 probes per TTL</b> – each router is probed 3 times, hence the three RTT columns.
              </Li>
              <Li>
                A row of <Mono>*</Mono> = no reply: that router has <b>blocked ICMP</b> (or ignored it). Traceroute keeps sending until a router responds or the maximum hop count is reached.
              </Li>
              <Li>
                Windows is <Mono>tracert</Mono>, Linux/Mac is <Mono>traceroute</Mono>.
              </Li>
            </Ul>
            <Callout kind="past">
              Stopping criteria in the slides: the UDP segment <b>arrives at the destination</b> → destination returns <b>ICMP port unreachable (type 3, code 3)</b> → source stops.
            </Callout>
          </>
        ),
      },
      {
        title: 'Inside a TTL-exceeded packet',
        body: (
          <>
            <P>
              Lab task: draw one. An ICMP error packet contains <b>another packet inside it</b> – that’s why you see an IP header inside an ICMP packet in Wireshark.
            </P>
            <Demo title="The nested structure" hint="tap each block">
              <NestedPacket />
            </Demo>
            <Ul>
              <Li>
                The source learns a router’s IP from the <b>source address of the TTL-exceeded packet’s outer IP header</b>.
              </Li>
              <Li>
                To probe the router <b>N hops away</b>, the source sends an echo request with <b>IP TTL = N</b>.
              </Li>
              <Li>
                The ICMP header of TTL exceeded is <b>8 bytes</b> (type, code, checksum, + 4). The embedded IP header’s TTL is normally <b>1</b>.
              </Li>
            </Ul>
          </>
        ),
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'icmp-lab',
    title: 'Lab 4 questions: rapid recall',
    time: '6 min',
    priority: 'high',
    steps: [
      {
        title: 'Ping questions',
        body: (
          <>
            <P>The lab’s own questions. Say the answer to yourself first, then tap.</P>
            <FlipCards
              h={132}
              cols="grid-cols-1 sm:grid-cols-2"
              cards={[
                { front: 'Type/Code for an echo request and an echo reply?', back: 'Request: Type 8, Code 0. Reply: Type 0, Code 0.' },
                { front: 'Identifier and sequence number: request vs reply?', back: 'The reply has the same identifier and sequence number as the request it answers.' },
                { front: 'Identifier and sequence number across successive requests?', back: 'Same identifier; the sequence number increases by 1 each time.' },
                { front: 'Is the data in the echo reply the same as in the request?', back: 'Yes. The destination copies the request’s data back into the reply.' },
                { front: 'Why does ping to auckland.ac.nz respond faster than to google.com?', back: 'It’s closer (shorter path, less propagation and queuing delay).' },
              ]}
            />
          </>
        ),
      },
      {
        title: 'Traceroute questions',
        body: (
          <>
            <FlipCards
              h={140}
              cols="grid-cols-1 sm:grid-cols-2"
              cards={[
                { front: 'Type/Code for TTL exceeded?', back: 'Type 11, Code 0.' },
                { front: 'How can a receiver parse an ICMP message when formats differ?', back: 'Read Type and Code first (they come first and are always in the same place). They say how to interpret the rest.' },
                { front: 'How long is the ICMP header of a TTL-exceeded packet?', back: '8 bytes: type 1, code 1, checksum 2, then 4 more (unused / length).' },
                { front: 'What is the TTL in the IP header inside the ICMP payload, and why?', back: 'Typically 1: that’s what the offending packet carried when it reached the router, which decremented it to 0 and dropped it.' },
                { front: 'How does the source learn a router’s IP address?', back: 'From the source IP address of the TTL-exceeded packet (its outer IP header).' },
                { front: 'How many times is each router probed?', back: 'Three times.' },
                { front: 'How does the source craft a probe to find the router N hops away?', back: 'An echo request whose IP TTL is set to N.' },
                { front: 'What does a row of * * * mean?', back: 'No reply: that router blocks (or ignores) ICMP. Traceroute keeps going to the next TTL.' },
                { front: 'Why do the first routers match for two destinations but later ones differ?', back: 'Traffic leaves your AS through the same routers, then follows different inter-AS routes (BGP) to each destination.' },
                { front: 'Why might RTT jump a lot between two hops?', back: 'A long-distance link (e.g. leaving the country / undersea cable) adds a lot of propagation delay.' },
              ]}
            />
          </>
        ),
      },
    ],
  },
]
