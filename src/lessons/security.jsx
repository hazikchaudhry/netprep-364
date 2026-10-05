import FlipCards from '../components/FlipCards'
import Classify from '../components/Classify'
import { Callout, Demo, K, Li, P, Table, Ul } from '../components/ui'
import { MalloryDemo } from '../demos/SecDemos'

export const security = [
  /* ------------------------------------------------------------------ */
  {
    id: 'sec-intro',
    title: 'What is security? Alice, Bob and Mallory',
    time: '6 min',
    priority: 'high',
    steps: [
      {
        title: 'The definitions',
        body: (
          <>
            <Callout kind="slide" title="Information security (NIST SP 800-12)">
              “The protection of information and information systems from unauthorised access, use, disclosure, disruption, modification, or destruction in order to ensure <b>confidentiality, integrity, and availability</b>.”
            </Callout>
            <Callout kind="slide" title="Network security">
              Protecting computer networks and their data from unauthorised access, misuse, modification, or disruption. Defending networks from cyber threats while ensuring trusted communication and reliable operations.
            </Callout>
            <P>
              <K>How?</K> A combination of <b>technologies, policies and practices</b>. There is <b>no silver bullet</b>: it’s an evolving space and needs ongoing investment.
            </P>
          </>
        ),
      },
      {
        title: 'Security isn’t one tool',
        body: (
          <>
            <P>Your slide lists examples of security elements. Sort them: is each a <i>technology</i> or a <i>people/process</i> measure?</P>
            <Demo title="Technology or process?" hint="tap">
              <Classify
                cats={['Technology', 'Policy / people']}
                items={[
                  { text: 'Firewalls', cat: 'Technology' },
                  { text: 'Intrusion detection and prevention', cat: 'Technology' },
                  { text: 'Encryption', cat: 'Technology' },
                  { text: 'Virtual Private Networks (VPNs)', cat: 'Technology' },
                  { text: 'Training', cat: 'Policy / people' },
                  { text: 'Policies and procedures', cat: 'Policy / people' },
                  { text: 'Incident response handling', cat: 'Policy / people' },
                  { text: 'Audits (compliance and penetration testing)', cat: 'Policy / people' },
                ]}
              />
            </Demo>
            <P className="text-sm text-slate-500">The rest of the list from the slide: access control, antivirus, backups, compliance with standards.</P>
          </>
        ),
      },
      {
        title: 'Alice, Bob and Mallory',
        body: (
          <>
            <Ul>
              <Li>
                <K>Alice</K> and <K>Bob</K> want to communicate (data, messages).
              </Li>
              <Li>
                <K>Mallory</K> is the attacker intercepting the communication. (“Believe it or not, there are many more” characters.)
              </Li>
            </Ul>
            <Demo title="What can Mallory do?" hint="one tab per CIA property">
              <MalloryDemo />
            </Demo>
            <Callout kind="tip">Each way Mallory interferes breaks exactly one of the three properties. That’s the next lesson.</Callout>
          </>
        ),
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'sec-cia',
    title: 'The CIA triad',
    time: '10 min',
    priority: 'high',
    steps: [
      {
        title: 'Confidentiality',
        body: (
          <>
            <Callout kind="remember" title="Definition">
              Preserving authorised restrictions on information access and disclosure, including means for protecting personal privacy and proprietary information.
            </Callout>
            <Table
              head={['Threats', 'Counter-measures']}
              rows={[
                [
                  <>
                    <b>Eavesdropping</b>: passive interception of data (e.g. sniffing network traffic)
                  </>,
                  <>
                    <b>Encryption</b>: scrambling data so it’s unreadable to unauthorised parties (e.g. SSL/TLS)
                  </>,
                ],
                [
                  <>
                    <b>Unauthorised access</b>: entry without permission (weak passwords, social engineering, phishing)
                  </>,
                  <>
                    <b>Access control</b>: restricting access to resources (usernames/passwords, two-factor authentication)
                  </>,
                ],
                [
                  <>
                    <b>Shoulder surfing</b>: watching someone enter sensitive information
                  </>,
                  <>
                    <b>Physical security</b>: securing physical assets (e.g. swipe-card access)
                  </>,
                ],
              ]}
            />
            <Demo title="Confidentiality or not?" hint="tap">
              <Classify
                cats={['Confidentiality', 'Something else']}
                items={[
                  { text: 'Sniffing traffic on a shared network', cat: 'Confidentiality' },
                  { text: 'Phishing a password out of someone', cat: 'Confidentiality' },
                  { text: 'Using TLS so eavesdroppers see scrambled data', cat: 'Confidentiality' },
                  { text: 'An insider deletes the database', cat: 'Something else' },
                ]}
              />
            </Demo>
          </>
        ),
      },
      {
        title: 'Integrity',
        body: (
          <>
            <Callout kind="remember" title="Definition">
              Guarding against improper information modification or destruction, and ensuring information <b>non-repudiation</b> and <b>authenticity</b>. Covers <b>data</b> and <b>system</b>.
            </Callout>
            <Table
              head={['Data integrity', 'System integrity']}
              rows={[
                [
                  'Data has not been altered in an unauthorised manner – in storage, during processing, and while in transit.',
                  'A system performs its intended function in an unimpaired manner, free from unauthorised manipulation (intentional or accidental).',
                ],
              ]}
            />
            <Table
              head={['Threats', 'Counter-measures']}
              rows={[
                [<><b>Malicious modification</b>: data tampering, man-in-the-middle</>, <><b>Hashing</b>: a unique fingerprint of a file or message (e.g. digital signatures)</>],
                [<><b>Accidental modification</b>: human error or glitches (overwriting records)</>, <><b>Data validation</b>: checking data is correct and complete</>],
                [<><b>Data corruption</b>: unreadable/unusable data (e.g. corruption in transmission)</>, <><b>Version control</b>: backups of previous versions</>],
              ]}
            />
          </>
        ),
      },
      {
        title: 'Availability',
        body: (
          <>
            <Callout kind="remember" title="Definition">
              Ensuring <b>timely and reliable access</b> to and use of information.
            </Callout>
            <Table
              head={['Threats', 'Counter-measures']}
              rows={[
                [<><b>Denial-of-service (DoS)</b>: overloading a service so it can’t handle new requests</>, <><b>Redundancy</b>: distribute resources with backups (load balancers)</>],
                [<><b>Malware</b>: stops authorised users reaching the system or data (e.g. ransomware)</>, <><b>Access control</b>: limit access to critical components (rate limiting, logging and auditing)</>],
                [<><b>Insider threats</b>: a disgruntled employee deleting critical components (e.g. a database)</>, <><b>Backups</b>: back up regularly <i>and check you can restore</i></>],
              ]}
            />
          </>
        ),
      },
      {
        title: 'Which property is it?',
        body: (
          <>
            <P>Mixed examples, the way a test would ask. Which property is mainly at stake?</P>
            <Demo title="Spot the property" hint="tap">
              <Classify
                cats={['Confidentiality', 'Integrity', 'Availability']}
                items={[
                  { text: 'Ransomware locks a company’s files', cat: 'Availability' },
                  { text: 'A man-in-the-middle changes the amount in a payment', cat: 'Integrity' },
                  { text: 'Someone watches you type your PIN', cat: 'Confidentiality' },
                  { text: 'A flood of requests makes a website unusable (DoS)', cat: 'Availability' },
                  { text: 'A file is corrupted during transmission', cat: 'Integrity' },
                  { text: 'Two-factor authentication on an account', cat: 'Confidentiality' },
                  { text: 'Hashing a file to detect changes', cat: 'Integrity' },
                  { text: 'Load balancers and backups', cat: 'Availability' },
                ]}
              />
            </Demo>
          </>
        ),
      },
      {
        title: 'A balancing act',
        body: (
          <>
            <P>The three properties overlap and pull against each other, so security is about balance, not maximising one.</P>
            <FlipCards
              h={140}
              cols="grid-cols-1 sm:grid-cols-3"
              cards={[
                { front: 'Confidentiality vs Availability', back: 'Strong encryption may slow down an application. Multi-factor authentication slows us down.' },
                { front: 'Integrity vs Availability', back: 'Aggressive input validation can reject legitimate inputs.' },
                { front: 'Availability vs Confidentiality / Integrity', back: 'Multiple instances and Content Delivery Networks improve availability, but updates take time to propagate.' },
              ]}
            />
            <Callout kind="tip" title="Likely question styles (my guess)">
              No past Test 2 covers this lecture, so this is a guess: “which property does X threaten?”, “which counter-measure addresses Y?”, “which two properties are in tension here?”. Use the slides’ own wording for threats and counter-measures.
            </Callout>
          </>
        ),
      },
    ],
  },
]
