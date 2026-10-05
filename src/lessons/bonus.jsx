import Classify from '../components/Classify'
import { Callout, Demo, K, Li, Mono, P, Table, Ul } from '../components/ui'
import { AuthDemo, CaesarDemo, HashDemo, RsaDemo, SignDemo } from '../demos/BonusDemos'

export const bonus = [
  /* ------------------------------------------------------------------ */
  {
    id: 'e-crypto',
    title: 'Cryptography: symmetric and public key',
    time: '15 min',
    priority: 'bonus',
    steps: [
      {
        title: 'The language, and how it gets broken',
        body: (
          <>
            <Callout kind="tip" title="Not on Test 2">
              Alex’s announcement doesn’t list the cryptography lectures. This module is for the final exam; skip it unless the Test 2 material is solid.
            </Callout>
            <Ul>
              <Li>
                <K>m</K> = plaintext. <Mono>K_A(m)</Mono> = ciphertext, encrypted with Alice’s key. Decryption with Bob’s key recovers it: <Mono>m = K_B(K_A(m))</Mono>.
              </Li>
              <Li>
                <K>Ciphertext-only attack</K>: Mallory has ciphertext to analyse – by <b>brute force</b> (try every key) or <b>statistical analysis</b>.
              </Li>
              <Li>
                <K>Known-plaintext attack</K>: Mallory has plaintext matching the ciphertext. <K>Chosen-plaintext attack</K>: Mallory can get ciphertext for plaintext she chooses.
              </Li>
            </Ul>
          </>
        ),
      },
      {
        title: 'Substitution ciphers',
        body: (
          <>
            <Ul>
              <Li>
                <K>Caesar cipher</K>: shift every letter by 3 (A→D). <K>ROT13</K>: shift by 13.
              </Li>
              <Li>
                <K>Monoalphabetic</K>: any one-to-one letter mapping (the key is the mapping). <K>Polyalphabetic</K>: n substitution ciphers used in a cycling pattern.
              </Li>
            </Ul>
            <Demo title="Caesar cipher" hint="then brute-force it">
              <CaesarDemo />
            </Demo>
          </>
        ),
      },
      {
        title: 'Symmetric keys: DES and AES',
        body: (
          <>
            <P>
              <K>Symmetric-key crypto</K>: Alice and Bob share the <b>same</b> key K<sub>S</sub>. The big question: <i>how do they agree on the key in the first place?</i>
            </P>
            <Table
              head={['', 'DES', 'AES']}
              rows={[
                ['Key', '56-bit', '128, 192 or 256-bit'],
                ['Block', '64-bit plaintext input, block cipher with chaining', '128-bit blocks'],
                ['Strength', 'A DES-challenge phrase was brute-forced in under a day; 3DES = encrypt 3 times with 3 keys', 'Brute force taking 1 s on DES would take 149 trillion years on AES'],
                ['Status', 'NIST standard 1993', 'NIST standard, replaced DES in Nov 2001'],
              ]}
            />
          </>
        ),
      },
      {
        title: 'Public-key crypto and RSA',
        body: (
          <>
            <Ul>
              <Li>
                Sender and receiver <b>don’t share a secret</b>. Bob has a <K>public key K⁺_B</K> (known to all) and a <K>private key K⁻_B</K> (known only to Bob).
              </Li>
              <Li>
                Requirements: <Mono>K⁻_B(K⁺_B(m)) = m</Mono>, and it must be infeasible to compute K⁻_B from K⁺_B. RSA also has <Mono>K⁻_B(K⁺_B(m)) = m = K⁺_B(K⁻_B(m))</Mono> – the order can be swapped.
              </Li>
            </Ul>
            <div className="rounded-xl bg-black/30 p-4 font-mono text-[13px] leading-relaxed text-slate-200">
              <div>1. choose two large primes p, q</div>
              <div>2. n = pq, z = (p−1)(q−1)</div>
              <div>3. choose e &lt; n with no common factor with z</div>
              <div>4. choose d so that ed mod z = 1</div>
              <div>public key (n, e) · private key (n, d)</div>
              <div className="mt-2 text-blue-300">encrypt: c = m^e mod n &nbsp; decrypt: m = c^d mod n</div>
            </div>
            <Demo title="RSA with tiny primes" hint="the slides’ example is p=5, q=7">
              <RsaDemo />
            </Demo>
            <Ul>
              <Li>
                <K>Why secure?</K> Multiplying p·q is easy; finding p and q from n is hard (factoring a big number).
              </Li>
              <Li>
                <K>In practice</K>: RSA is slow (DES is at least ~100× faster). Use public-key crypto to exchange a symmetric <b>session key K<sub>S</sub></b>, then use symmetric crypto for the data.
              </Li>
            </Ul>
          </>
        ),
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'e-hash',
    title: 'Hashes, signatures and certificates',
    time: '12 min',
    priority: 'bonus',
    steps: [
      {
        title: 'Digital signatures',
        body: (
          <>
            <Ul>
              <Li>
                Bob <K>signs</K> by encrypting with his <b>private</b> key. Alice <K>verifies</K> by applying Bob’s <b>public</b> key and checking the result equals m.
              </Li>
              <Li>
                Verifiable and non-forgeable. Gives <K>non-repudiation</K>: Alice can show a court that Bob signed m.
              </Li>
              <Li>
                Encrypting a long message with public-key crypto is expensive, so Bob signs a <b>hash</b> of it (a “message digest”).
              </Li>
            </Ul>
            <Demo title="Sign the hash, verify the hash" hint="then tick the tamper box and run again">
              <SignDemo />
            </Demo>
          </>
        ),
      },
      {
        title: 'Hash functions',
        body: (
          <>
            <Ul>
              <Li>
                <K>Many-to-1</K>, produces a <b>fixed-size</b> digest (“fingerprint”).
              </Li>
              <Li>
                Given a digest x, <b>computationally infeasible</b> to find m with H(m) = x. <K>Collision resistant</K>: finding two messages with the same digest is infeasible.
              </Li>
              <Li>
                The <b>Internet checksum</b> is a poor hash: it’s fixed-length and many-to-one, but it’s easy to find another message with the same value.
              </Li>
            </Ul>
            <Demo title="Checksum vs SHA-256" hint="the slide’s IOU1 / IOU9 example">
              <HashDemo />
            </Demo>
            <Table
              head={['Hash', 'Digest', 'Status']}
              rows={[
                ['MD5', '128 bits', 'No longer recommended'],
                ['SHA-1', '160 bits', 'Collision problems by ~2017'],
                ['SHA-256 (SHA-2)', '256 bits', 'What we use now: certificates, software updates, Bitcoin; no collision found'],
              ]}
            />
          </>
        ),
      },
      {
        title: 'Certification authorities',
        body: (
          <>
            <P>
              <b>The pizza prank:</b> Mallory orders four pepperoni pizzas “from Bob”, signs the order with her own private key, and sends her public key claiming it’s Bob’s. The pizza store verifies the signature successfully – and delivers to Bob.
            </P>
            <Ul>
              <Li>
                A <K>certification authority (CA)</K> binds a public key to a particular entity. The entity proves its identity; the CA creates a <b>certificate</b> containing the public key, <b>digitally signed by the CA</b>.
              </Li>
              <Li>
                To get Bob’s key, Alice gets his certificate and applies the <b>CA’s public key</b> to it.
              </Li>
              <Li>
                A public key doesn’t prove who owns it. Anyone can make a certificate, but it only counts if a <b>trusted CA</b> signed it. (Let’s Encrypt, DigiCert, Comodo…)
              </Li>
            </Ul>
            <Demo title="Signature or encryption?" hint="tap">
              <Classify
                cats={['Sign', 'Encrypt for confidentiality']}
                items={[
                  { text: 'Uses the sender’s PRIVATE key first', cat: 'Sign' },
                  { text: 'Uses the receiver’s PUBLIC key first', cat: 'Encrypt for confidentiality' },
                  { text: 'Provides non-repudiation', cat: 'Sign' },
                  { text: 'Keeps eavesdroppers from reading the message', cat: 'Encrypt for confidentiality' },
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
    id: 'e-auth',
    title: 'Authentication and secure email',
    time: '10 min',
    priority: 'bonus',
    steps: [
      {
        title: 'ap1.0 to ap5.0',
        body: (
          <>
            <P>Goal: Bob wants Alice to “prove” her identity to him. Open each protocol, then find the flaw.</P>
            <Demo title="Break the protocol" hint="open one at a time">
              <AuthDemo />
            </Demo>
            <Callout kind="remember">
              A <K>nonce</K> (a number used only once in a lifetime) is what defeats a <b>replay / playback attack</b>.
            </Callout>
          </>
        ),
      },
      {
        title: 'Secure email',
        body: (
          <>
            <Ul>
              <Li>
                <K>Confidentiality</K>: Alice generates a random symmetric key K<sub>S</sub>, encrypts the message with it (efficient), and encrypts K<sub>S</sub> with <b>Bob’s public key</b>. She sends both.
              </Li>
              <Li>
                <K>Integrity + authentication</K>: Alice signs a hash of the message with <b>her private key</b> and sends the message in the clear plus the signature.
              </Li>
              <Li>
                <K>All three</K>: Alice uses <b>three keys</b> – her private key, Bob’s public key, and a new symmetric key.
              </Li>
            </Ul>
            <Callout kind="past">
              “How many different keys are required for security, sender authentication and message integrity when sending email?” → <b>3</b>.
            </Callout>
          </>
        ),
      },
    ],
  },
]
