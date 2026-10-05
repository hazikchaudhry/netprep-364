import Seq from '../components/Seq'
import FieldDiagram from '../components/FieldDiagram'
import Classify from '../components/Classify'
import { Callout, Demo, K, Li, Mono, P, Reveal, Table, Ul } from '../components/ui'
import { PlanesDemo, ControlStyles, OspfAreas, SnmpDemo, MibTable } from '../demos/ControlMisc'
import DijkstraDemo from '../demos/DijkstraDemo'
import DVTables from '../demos/DVTables'
import CountToInfinity from '../demos/CountToInfinity'
import BFExample from '../demos/BFExample'
import { AsMap, BgpAdvert, BgpSelect, HotPotato } from '../demos/BgpDemos'

export const networkControl = [
  /* ------------------------------------------------------------------ */
  {
    id: 'nc-planes',
    title: 'Forwarding vs routing',
    time: '6 min',
    priority: 'med',
    steps: [
      {
        title: 'Two jobs for the network layer',
        body: (
          <>
            <P>
              A router does two very different things. <K>Forwarding</K> is the quick local one; <K>routing</K> is the slow planning one.
            </P>
            <Demo title="Forwarding vs routing" hint="send packets, then rebuild the table">
              <PlanesDemo />
            </Demo>
            <Ul>
              <Li>
                <K>Data plane = forwarding</K>: move a packet from the router’s input to the right output.
              </Li>
              <Li>
                <K>Control plane = routing</K>: determine the route packets take from source to destination (“path planning”).
              </Li>
              <Li>
                The <K>routing algorithm</K> fills the <K>forwarding table</K>. The packet’s <b>destination IP address</b> is what gets looked up.
              </Li>
            </Ul>
          </>
        ),
      },
      {
        title: 'Who computes the tables?',
        body: (
          <>
            <P>Two ways to organise the control plane. Your slides show both.</P>
            <Demo title="Two control-plane styles">
              <ControlStyles />
            </Demo>
            <Callout kind="slide">
              <b>Per-router control</b>: algorithm components in each router interact to compute forwarding tables. <b>Centralised control</b>: a distinct (typically remote) controller interacts with local control agents (CAs) in routers. Everything else in Module A is the per-router style.
            </Callout>
          </>
        ),
      },
      {
        title: 'Routing = finding good paths in a graph',
        body: (
          <>
            <Ul>
              <Li>
                Model: <Mono>G = (N, E)</Mono> – N = routers (nodes), E = links (edges). Each link has a cost <Mono>c(x,x′)</Mono>.
              </Li>
              <Li>
                A <K>path</K> = sequence of routers a packet traverses. “Good” = <b>least cost</b> or <b>policy compliant</b>.
              </Li>
              <Li>
                Cost can be delay, $, bandwidth, hops… the slides <b>keep it abstract</b>.
              </Li>
            </Ul>
            <Table
              head={['', 'Option A', 'Option B']}
              rows={[
                ['Who knows what?', 'Centralised: every router has the complete topology + costs → link state', 'Decentralised: routers know only neighbours + link costs, iterate and exchange → distance vector'],
                ['How fast do routes change?', 'Static: change slowly', 'Dynamic: change quickly (periodic updates, cost changes)'],
                ['Does cost react to traffic?', 'Load-sensitive: cost reflects congestion', 'Load-insensitive: modern algorithms (load sensitivity has many challenges)'],
              ]}
            />
            <Demo title="Sort the algorithm" hint="tap the right one">
              <Classify
                cats={['Link State', 'Distance Vector']}
                items={[
                  { text: 'Every router has complete topology and link-cost info', cat: 'Link State' },
                  { text: 'Routers know only their neighbours and iteratively exchange info', cat: 'Distance Vector' },
                  { text: 'Uses Dijkstra’s algorithm', cat: 'Link State' },
                  { text: 'Uses the Bellman-Ford equation', cat: 'Distance Vector' },
                  { text: 'Classed as a “centralised” algorithm in the slides', cat: 'Link State' },
                  { text: 'Classed as a “decentralised” algorithm in the slides', cat: 'Distance Vector' },
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
    id: 'nc-linkstate',
    title: 'Link state & Dijkstra',
    time: '14 min',
    priority: 'high',
    steps: [
      {
        title: 'Idea: everyone has the full map',
        body: (
          <>
            <Ul>
              <Li>
                Topology and all link costs are broadcast so <K>all nodes have the same info</K> (“link state broadcast”).
              </Li>
              <Li>
                Each node then runs <K>Dijkstra</K> on its own copy: least-cost paths from <b>one source</b> to <b>all other nodes</b>.
              </Li>
              <Li>
                Output = that node’s <K>forwarding table</K>.
              </Li>
              <Li>
                <b>Iterative</b>: after k iterations you know the least-cost path to k destinations.
              </Li>
            </Ul>
            <Callout kind="past">
              “Dijkstra’s algorithm is used in which protocol?” → <b>OSPF</b> (Open Shortest Path First). Not RIP, not BGP. This appeared in the 2022, 2023 and 2024 Test 2s.
            </Callout>
          </>
        ),
      },
      {
        title: 'The algorithm in plain words',
        body: (
          <>
            <Table
              head={['Symbol', 'Means']}
              mono
              rows={[
                ['N′', 'nodes whose least-cost path is definitely known'],
                ['D(v)', 'current cost estimate from source to v'],
                ['p(v)', 'predecessor of v on the path from the source'],
                ['c(u,v)', 'link cost; ∞ if not direct neighbours'],
              ]}
            />
            <div className="rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-[13px] leading-relaxed text-slate-200">
              <div className="text-slate-500">// initialise</div>
              <div>N′ = &#123;u&#125;</div>
              <div>D(v) = c(u,v) if v is adjacent to u, else ∞</div>
              <div className="mt-2 text-slate-500">// repeat until all nodes are in N′</div>
              <div>
                find w <span className="text-amber-300">not in N′ with the smallest D(w)</span>
              </div>
              <div>add w to N′</div>
              <div>
                for each neighbour v of w <span className="text-amber-300">that is not in N′</span>:
              </div>
              <div className="pl-4 text-sky-300">D(v) = min( D(v), D(w) + c(w,v) )</div>
            </div>
            <Callout kind="tip">
              Say it as: <i>“pick the cheapest unfinished node, then see if going through it gives its neighbours a shortcut.”</i>
            </Callout>
            <Callout kind="past" title="Past test">
              “How does Link-State pick the next node to check?” → <b>the node with the lowest current cost</b> (not furthest, not arbitrary, not most connections).
            </Callout>
          </>
        ),
      },
      {
        title: 'Watch it run',
        body: (
          <>
            <P>This is the exact network from your <K>problem sheet</K> (and the slide-26 graph). Press Next step and read the working under the graph.</P>
            <Demo title="Dijkstra from u" hint="Next step → watch D and p change">
              <DijkstraDemo startMode="watch" />
            </Demo>
          </>
        ),
      },
      {
        title: 'Now you drive',
        body: (
          <>
            <P>Same graph, but <b>you</b> choose which node joins N′ next. The app tells you if you’re wrong. Try both graphs.</P>
            <Demo title="You try" hint="click a node">
              <DijkstraDemo startMode="try" startGraph="lecture" />
            </Demo>
            <Callout kind="trap">
              Only update neighbours <b>of the node you just added</b> and only if <b>not already in N′</b>. D(v) only changes when the new route is strictly cheaper. A tie keeps the old p(v).
            </Callout>
          </>
        ),
      },
      {
        title: 'Reading the result',
        body: (
          <>
            <Ul>
              <Li>
                <K>Shortest-path tree</K>: trace predecessors p(·) backwards from any node to the source.
              </Li>
              <Li>
                <K>Forwarding table in u</K>: for each destination, the <b>first link</b> on its path (e.g. dest z → link (u,w)).
              </Li>
              <Li>
                Cost to z and its predecessor are read from the table as <Mono>n,p</Mono> – e.g. <Mono>8,w</Mono>.
              </Li>
            </Ul>
            <Reveal q="Problem sheet Q2: the link costs X and Y are unknown. The shortest distances from z are w=7, y=9, x=13 (via w), u=15 (via w), v=16 (via w). Can you find X (v–x) and Y (v–w)?">
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <b>Y = 9.</b> v is reached via w, so 16 = 7 + Y.
                </li>
                <li>
                  <b>X = n/a.</b> v’s shortest path doesn’t use the v–x link, so the table can’t tell you its cost (you only get a lower bound).
                </li>
              </ul>
            </Reveal>
          </>
        ),
      },
      {
        title: 'Cost & limits of link state',
        body: (
          <>
            <Ul>
              <Li>
                <K>Complexity</K>: n nodes → each iteration checks all nodes not in N′ → n(n+1)/2 comparisons = <b>O(n²)</b>. Better implementations: <b>O(n log n)</b>.
              </Li>
              <Li>
                <K>Messages</K>: with n nodes and E links, O(nE) messages are sent.
              </Li>
              <Li>
                <K>Oscillations</K> are possible – e.g. if link cost equals the amount of traffic carried (load-sensitive).
              </Li>
              <Li>
                <K>Robustness</K>: a node can advertise a wrong link cost, but each node computes only <i>its own</i> table.
              </Li>
            </Ul>
            <Callout kind="past" title="Past test: “a limitation of Link-State”">
              Right answer (by the slides): <b>it does not scale well as the number of nodes increases</b> (O(n²) + lots of messages). Wrong ones: “needs to pass vectors to neighbours” (that’s DV), “requires a direct connection to all nodes”, “only used between ASes”. Oscillation only happens with load-sensitive costs, so “easily trapped in oscillations whenever the network changes” is overstated.
            </Callout>
          </>
        ),
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'nc-dv',
    title: 'Distance vector & Bellman-Ford',
    time: '14 min',
    priority: 'high',
    steps: [
      {
        title: 'Idea: ask your neighbours',
        body: (
          <>
            <P>
              A node doesn’t know the whole map. It only knows its <b>direct links</b> and what its <b>neighbours tell it</b>. The <K>Bellman-Ford equation</K> turns that into a route:
            </P>
            <div className="rounded-xl border border-sky-400/30 bg-sky-400/10 p-4 text-center font-mono text-lg font-bold text-sky-100">
              d<sub>x</sub>(y) = min<sub>v</sub> &#123; c(x,v) + d<sub>v</sub>(y) &#125;
            </div>
            <Ul>
              <Li>
                <b>c(x,v)</b> = cost to neighbour v (“delivery to the shop”)
              </Li>
              <Li>
                <b>d<sub>v</sub>(y)</b> = neighbour v’s cost to y (“the shop’s price”)
              </Li>
              <Li>
                <b>min over all neighbours v</b> of x
              </Li>
            </Ul>
            <Demo title="Worked example (slide 36)" hint="try each neighbour">
              <BFExample />
            </Demo>
          </>
        ),
      },
      {
        title: 'The algorithm: gossip until nothing changes',
        body: (
          <>
            <Ul>
              <Li>
                Node x keeps its <K>distance vector</K> D<sub>x</sub> = [D<sub>x</sub>(y) : y ∈ N] plus the vectors of its neighbours.
              </Li>
              <Li>
                From time to time each node <b>sends its DV to its neighbours</b>. When a node receives a new one it <b>recomputes with Bellman-Ford</b>.
              </Li>
              <Li>
                <b>Iterative, asynchronous, distributed</b>: a node only notifies neighbours <i>when its own DV changes</i>.
              </Li>
              <Li>
                Under natural conditions D<sub>x</sub>(y) converges to the true least cost d<sub>x</sub>(y).
              </Li>
            </Ul>
            <Demo title="Problem-sheet Q3 network" hint="Exchange → watch the tables fill. Tap any cell for its working.">
              <DVTables />
            </Demo>
            <Callout kind="past">
              “When does DV finish calculating costs?” → <b>when there are no more distance-vector changes to process</b>. Not “when all nodes are known” and not a preset iteration limit.
            </Callout>
          </>
        ),
      },
      {
        title: 'Link costs change: good news vs bad news',
        body: (
          <>
            <P>
              <b>Good news travels fast.</b> <b>Bad news travels slow</b> – the <K>count-to-infinity</K> problem.
            </P>
            <Demo title="Slide 41–43 network: x–y = 4, y–z = 1, x–z = 50" hint="try 4 → 1, then 4 → 60">
              <CountToInfinity />
            </Demo>
            <Ul>
              <Li>
                Cost decreases: only a couple of rounds.
              </Li>
              <Li>
                Cost increases to 60: y thinks “z knows a cheap way to x” (it doesn’t – z’s route goes <i>through y</i>). They bounce the cost up by 1 each round. The slides count <b>44 iterations</b> before z notices its direct x–z link (50) is cheaper.
              </Li>
              <Li>
                “We only know the cheapest costs, not all costs.”
              </Li>
            </Ul>
          </>
        ),
      },
      {
        title: 'Fix: poisoned reverse',
        body: (
          <>
            <Callout kind="remember" title="Poisoned reverse (say it like this)">
              If <b>Z routes through Y</b> to get to X, then Z tells Y that Z’s distance to X is <b>infinite</b>. Y therefore never tries to route to X via Z, which breaks the loop.
            </Callout>
            <Demo title="Turn poisoned reverse ON, then do 4 → 60" hint="compare the number of rounds">
              <CountToInfinity startPoison />
            </Demo>
            <Callout kind="trap">
              It solves <i>most</i> count-to-infinity problems but <b>cannot deal with cases that have more than three neighbours</b> (loops involving more nodes). “Poisoned reverse” is the answer to the problem-sheet question “explain a solution for a 3-node network”.
            </Callout>
          </>
        ),
      },
      {
        title: 'Link state vs distance vector',
        body: (
          <>
            <Table
              head={['', 'Link state (LS)', 'Distance vector (DV)']}
              rows={[
                ['Message complexity', 'n nodes, E links → O(nE) messages', 'Exchange between neighbours only; convergence time varies'],
                ['Speed of convergence', 'O(n²) algorithm; may have oscillations', 'Varies; may have routing loops; count-to-infinity problem'],
                ['If a router malfunctions', 'Can advertise an incorrect link cost, but each node computes only its own table', 'Can advertise an incorrect path cost, and every node’s table is used by others → error propagates through the network'],
              ]}
            />
            <Demo title="LS or DV?" hint="tap">
              <Classify
                cats={['LS', 'DV', 'Both']}
                items={[
                  { text: 'Sends vectors to its neighbours', cat: 'DV' },
                  { text: 'Floods link-state advertisements', cat: 'LS' },
                  { text: 'Can suffer count-to-infinity', cat: 'DV' },
                  { text: 'Finds least-cost paths', cat: 'Both' },
                  { text: 'Errors in one node’s info spread through the network', cat: 'DV' },
                  { text: 'Each node computes only its own table from the full topology', cat: 'LS' },
                ]}
              />
            </Demo>
            <Callout kind="past" title="Which protocol uses which?">
              <b>OSPF → link state (Dijkstra)</b>. <b>RIP → distance vector (Bellman-Ford)</b>.
            </Callout>
          </>
        ),
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'nc-hier',
    title: 'Autonomous systems, RIP & OSPF',
    time: '9 min',
    priority: 'high',
    steps: [
      {
        title: 'Why not one big flat network?',
        body: (
          <>
            <P>Our model so far assumed identical routers and a flat network. Real life isn’t like that:</P>
            <Ul>
              <Li>
                <K>Scale</K>: billions of destinations – can’t store them all in routing tables, and exchanging tables would swamp the links.
              </Li>
              <Li>
                <K>Administrative autonomy</K>: the Internet is a network of networks. Each admin wants to control routing in their own network.
              </Li>
            </Ul>
            <Callout kind="remember">
              Fix = <b>hierarchical routing</b>: aggregate routers into regions called <K>autonomous systems (AS)</K> – e.g. OneNZ, Spark.
            </Callout>
          </>
        ),
      },
      {
        title: 'Intra-AS vs inter-AS',
        body: (
          <>
            <Demo title="Which links are which?" hint="switch between OSPF / eBGP / iBGP">
              <AsMap />
            </Demo>
            <Table
              head={['Intra-AS (inside one AS)', 'Inter-AS (between ASes)']}
              rows={[
                ['Routing among hosts and routers within one AS', 'Routing between ASes (e.g. smartphone in London → Auckland uni network)'],
                ['All routers in the AS run the same intra-domain protocol; different ASes can run different ones', 'Gateways perform inter-domain routing as well as intra-domain'],
                ['Also called IGP (interior gateway protocol)', 'Gateway router = at the “edge” of its AS, has link(s) to router(s) in another AS'],
              ]}
            />
            <Callout kind="slide">
              Forwarding table entries: <b>intra-AS</b> routing sets entries for destinations <i>within</i> the AS; <b>inter-AS + intra-AS</b> together set entries for <i>external</i> destinations.
            </Callout>
          </>
        ),
      },
      {
        title: 'RIP vs OSPF',
        body: (
          <>
            <Table
              head={['', 'RIP', 'OSPF']}
              rows={[
                ['Algorithm', 'Distance vector', 'Link state + Dijkstra'],
                ['Metric', '# hops, each link cost 1, max 15 hops', 'Link costs set by admin'],
                ['Updates', 'DVs exchanged with neighbours every 30 s (“advertisement”)', 'Router floods link-state advertisements to ALL routers in the AS'],
                ['Carried by', '—', 'OSPF messages directly over IP (not TCP/UDP)'],
                ['“Open”?', 'Included in BSD-UNIX in 1982', '“Open” = publicly available'],
              ]}
            />
            <Ul>
              <Li>
                Other intra-AS protocols: <K>IGRP</K> (Cisco proprietary until 2016) and <K>IS-IS</K> (nearly identical to OSPF).
              </Li>
              <Li>
                OSPF “advanced” features: <b>all messages authenticated</b> (prevent malicious intrusion), <b>multiple same-cost paths allowed</b>, <b>hierarchical</b> (next step).
              </Li>
            </Ul>
            <Demo title="RIP or OSPF?" hint="tap">
              <Classify
                cats={['RIP', 'OSPF']}
                items={[
                  { text: 'Hop count, maximum 15', cat: 'RIP' },
                  { text: 'Floods link-state advertisements to the whole AS', cat: 'OSPF' },
                  { text: 'Uses Dijkstra', cat: 'OSPF' },
                  { text: 'Distance vector, sends DVs every 30 s', cat: 'RIP' },
                  { text: 'Messages are authenticated', cat: 'OSPF' },
                ]}
              />
            </Demo>
          </>
        ),
      },
      {
        title: 'Hierarchical OSPF',
        body: (
          <>
            <P>
              A big OSPF AS can have <K>two levels</K>: <b>local areas</b> and the <b>backbone</b>. Link-state ads only flood <i>inside</i> an area.
            </P>
            <Demo title="Meet the routers" hint="tap a router type">
              <OspfAreas />
            </Demo>
            <Callout kind="past">
              “In hierarchical OSPF, what is the purpose of the <b>area border routers</b>?” → <b>to summarise distances to nets in their own area</b> (and advertise that to other area border routers). They do <i>not</i> link ASes together – boundary routers do that.
            </Callout>
          </>
        ),
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'nc-bgp',
    title: 'BGP – routing between ASes',
    time: '13 min',
    priority: 'high',
    steps: [
      {
        title: 'BGP: the glue of the Internet',
        body: (
          <>
            <P>
              <K>BGP</K> = Border Gateway Protocol: the <b>de facto inter-domain routing protocol</b>. It lets a network announce: <i>“I’m here, and here’s what I can reach.”</i>
            </P>
            <Demo title="eBGP vs iBGP" hint="start on the eBGP view">
              <AsMap start="inter" />
            </Demo>
            <Ul>
              <Li>
                <K>eBGP</K>: obtain reachability information <b>from neighbouring ASes</b>.
              </Li>
              <Li>
                <K>iBGP</K>: propagate that information <b>to all AS-internal routers</b>.
              </Li>
              <Li>Then determine <b>good routes</b> to other networks based on reachability <b>and policy</b>.</Li>
              <Li>Gateway routers run <b>both</b> eBGP and iBGP.</Li>
            </Ul>
            <Callout kind="past">
              “What does eBGP transmit messages between?” → <b>gateway routers of neighbouring autonomous systems</b>. (Not backbone routers, not all routers in an AS, not adjacent gateways in the same AS.) Asked in 2022, 2023 and 2024.
            </Callout>
          </>
        ),
      },
      {
        title: 'BGP sessions and messages',
        body: (
          <>
            <Ul>
              <Li>
                A <K>BGP session</K>: two BGP routers (“peers”) exchange BGP messages over a <b>semi-permanent TCP connection</b>.
              </Li>
              <Li>
                They advertise <b>paths</b> to destination network prefixes – BGP is a <K>path-vector</K> protocol.
              </Li>
              <Li>
                When 3a advertises “AS3, X” to 2c, <b>AS3 promises AS2 it will forward datagrams towards X</b>.
              </Li>
            </Ul>
            <Demo title="Life of a BGP session" hint="Next message">
              <Seq
                actors={[
                  { id: 'a', label: 'Router 3a', sub: 'AS3' },
                  { id: 'b', label: 'Router 2c', sub: 'AS2' },
                ]}
                steps={[
                  { from: 'a', to: 'b', label: 'OPEN', note: 'OPEN: opens the TCP connection to the remote BGP peer and authenticates the sending peer.' },
                  { from: 'b', to: 'a', label: 'KEEPALIVE', tone: 'good', note: 'KEEPALIVE also acknowledges (ACKs) the OPEN request.' },
                  { from: 'a', to: 'b', label: 'UPDATE  “AS3, X”', tone: 'warn', note: 'UPDATE: advertises a new path (or withdraws an old one).' },
                  { from: 'b', to: 'a', label: 'KEEPALIVE', tone: 'good', note: 'KEEPALIVE keeps the connection alive when there are no UPDATEs.' },
                  { from: 'a', to: 'b', label: 'NOTIFICATION', tone: 'bad', note: 'NOTIFICATION: reports errors in the previous message and is also used to close the connection.' },
                ]}
              />
            </Demo>
            <Table
              head={['Message', 'Job']}
              mono
              rows={[
                ['OPEN', 'open TCP connection to peer + authenticate'],
                ['UPDATE', 'advertise a new path / withdraw an old one'],
                ['KEEPALIVE', 'keep alive when no UPDATEs; ACKs OPEN'],
                ['NOTIFICATION', 'report errors; close the connection'],
              ]}
            />
          </>
        ),
      },
      {
        title: 'Path advertisement: AS-PATH & NEXT-HOP',
        body: (
          <>
            <P>
              An advertised <K>prefix + attributes = a “route”</K>. Two attributes matter:
            </P>
            <Ul>
              <Li>
                <K>AS-PATH</K>: the list of ASes the advertisement has passed through.
              </Li>
              <Li>
                <K>NEXT-HOP</K>: the specific internal-AS router that leads to the next-hop AS.
              </Li>
            </Ul>
            <Demo title="Follow the advertisement for prefix X" hint="Next hop ×4">
              <BgpAdvert />
            </Demo>
            <Callout kind="remember" title="Policy-based routing">
              <b>Import policy</b>: a gateway uses it to accept/decline a received path (e.g. “never route through AS Y”). <b>Export policy</b>: decides whether to <i>advertise</i> a path to neighbouring ASes.
            </Callout>
            <Callout kind="past">
              “What is the role of <b>policy</b> within BGP?” → <b>choosing which routes to advertise to neighbours</b> (and which to accept).
            </Callout>
          </>
        ),
      },
      {
        title: 'Which route wins?',
        body: (
          <>
            <P>A router may learn <b>several routes</b> to the same destination (slide 75: 1c hears “AS2, AS3, X” from 2a <i>and</i> “AS3, X” from 3a). It picks using these rules, <b>in order</b>:</P>
            <ol className="list-decimal space-y-1 pl-5 text-[15px] text-slate-300">
              <li>
                <K>Local preference</K> value attribute – a policy decision
              </li>
              <li>
                <K>Shortest AS-PATH</K>
              </li>
              <li>
                <K>Closest NEXT-HOP router</K> – hot-potato routing
              </li>
              <li>Additional criteria</li>
            </ol>
            <Demo title="Run the selection rules" hint="pick a scenario → apply the rules one by one">
              <BgpSelect />
            </Demo>
          </>
        ),
      },
      {
        title: 'Hot-potato routing',
        body: (
          <>
            <P>
              <K>Hot potato</K>: choose the local gateway with the <b>least intra-domain cost</b> – get the packet out of <i>your</i> AS as quickly (cheaply) as possible, and <b>don’t worry about the inter-domain cost</b>.
            </P>
            <Demo title="Slide 79: router 2d" hint="drag the OSPF costs">
              <HotPotato />
            </Demo>
            <Callout kind="past">
              “What is the goal of hot-potato routing?” → <b>to move messages out of an AS as quickly as possible</b> (not “to the target AS as cheaply/quickly as possible”, not “according to policy / NEXT-HOP”). Asked in 2023 and 2024.
            </Callout>
          </>
        ),
      },
      {
        title: 'Policy, and why two kinds of routing?',
        body: (
          <>
            <P>
              <b>Example</b> (slide 80): an ISP B only wants to carry traffic to/from its <i>customers</i>. A advertises path “Aw” to B and C. B <b>chooses not to advertise</b> “BAw” to C – B gets no money for carrying C↔A↔w traffic. So C never learns the path via B and routes C→A→w directly.
            </P>
            <Table
              head={['', 'Intra-AS', 'Inter-AS']}
              rows={[
                ['Policy', 'Single admin → no policy decisions needed', 'Admin wants control over how its traffic is routed and who routes through its net'],
                ['Scale', 'Hierarchical routing saves table size and reduces update traffic', 'Hierarchical routing saves table size and reduces update traffic'],
                ['Performance', 'Can focus on performance', 'Policy may dominate over performance'],
              ]}
            />
            <Demo title="Intra or inter?" hint="tap">
              <Classify
                cats={['Intra-AS', 'Inter-AS']}
                items={[
                  { text: 'Single admin, so policy is not an issue', cat: 'Intra-AS' },
                  { text: 'Policy may matter more than performance', cat: 'Inter-AS' },
                  { text: 'Can focus on performance', cat: 'Intra-AS' },
                  { text: 'Admin wants to control who routes traffic through its network', cat: 'Inter-AS' },
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
    id: 'nc-snmp',
    title: 'Network management & SNMP',
    time: '6 min',
    priority: 'med',
    steps: [
      {
        title: 'What is network management?',
        body: (
          <>
            <P>An AS has thousands of interacting hardware and software components – like a jet airplane or nuclear plant, you need to <b>monitor, configure and control</b> it.</P>
            <Ul>
              <Li>
                <K>Managing server / controller</K> – the operator’s side.
              </Li>
              <Li>
                <K>Managed devices</K> (routers, switches…) – each holds <K>managed objects</K> whose data is gathered in a <K>MIB</K> (Management Information Base).
              </Li>
              <Li>
                An <K>agent</K> on each device talks to the server using <K>SNMP</K> (Simple Network Management Protocol).
              </Li>
            </Ul>
          </>
        ),
      },
      {
        title: 'Two ways to carry MIB info',
        body: (
          <>
            <Demo title="SNMP conversations" hint="switch modes, then step through">
              <SnmpDemo />
            </Demo>
            <Table
              head={['Message type', 'Direction', 'Function']}
              mono
              rows={[
                ['GetRequest / GetNextRequest / GetBulkRequest', 'manager → agent', '“get me data” (one instance / next in list / a block)'],
                ['SetRequest', 'manager → agent', 'set a MIB value'],
                ['Response', 'agent → manager', 'value, response to a request'],
                ['Trap', 'agent → manager', 'inform manager of an exceptional event'],
              ]}
            />
          </>
        ),
      },
      {
        title: 'The MIB and the PDU',
        body: (
          <>
            <P>
              The <K>MIB</K> holds a device’s operational (and some configuration) data. There are 400+ MIB modules in RFCs, plus vendor-specific ones. <K>SMI</K> (Structure of Management Information) is the data-definition language.
            </P>
            <MibTable />
            <Demo title="SNMP PDU layouts" hint="tap a field">
              <FieldDiagram
                title="Get / Set (message types 0–3)"
                rows={[
                  [
                    { name: 'PDU type', size: '0–3', desc: 'Get/Set message types are numbered 0–3.' },
                    { name: 'Request ID', desc: 'Links a response to its request.' },
                    { name: 'Error status', size: '0–5', desc: 'Error status code, 0–5.' },
                    { name: 'Error index', desc: 'Which variable caused the error.' },
                    { name: 'Name · Value …', w: 2, desc: 'The variables to get/set: pairs of MIB object name and value.' },
                  ],
                ]}
              />
              <div className="mt-4" />
              <FieldDiagram
                title="Trap (message type 4)"
                rows={[
                  [
                    { name: 'PDU type', size: '4', desc: 'Type 4 = trap.' },
                    { name: 'Enterprise', desc: 'Identifies the type of managed object generating the trap.' },
                    { name: 'Agent addr', desc: 'Address of the agent that sent it.' },
                    { name: 'Trap type', size: '0–7', desc: 'Trap type, 0–7.' },
                    { name: 'Specific code', desc: 'Specific code for enterprise-specific traps.' },
                    { name: 'Time stamp', desc: 'When it happened.' },
                    { name: 'Name · Value …', w: 2, desc: 'Trap info.' },
                  ],
                ]}
              />
            </Demo>
            <Callout kind="tip">Your slides call this “a quick bit on network management”. Expect at most 1–2 easy questions: the vocabulary (MIB, agent, managing server, SNMP) and request/response vs trap.</Callout>
          </>
        ),
      },
    ],
  },
]
