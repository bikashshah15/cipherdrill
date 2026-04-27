# Lecture 02 — Introduction to Cryptography | Question Bank

**Lecture ID:** lecture-02-cryptography-intro  
**Lecture Number:** 2  
**Lecture Title:** Introduction to Cryptography  
**Total Questions:** 25

---

## Q1 — MECHANISM | Foundational

**Topic:** Kerckhoff’s Principle

**Stem:**
According to Kerckhoff’s Principle, the security of a cryptosystem must rest solely on the secrecy of the key rather than the secrecy of the algorithm. Mechanistically, why is this approach considered superior to "security through obscurity"?

**Choices:**
- A. Because proprietary, secret algorithms are mathematically impossible to reverse-engineer.
- B. Because public algorithms can be vetted by the community to ensure no hidden weaknesses or backdoors exist.
- C. Because the key length automatically increases when the algorithm is made public.
- D. Because Shannon’s Maxim states that attackers are incapable of understanding complex system details.

**Correct Answer:** B

**Mechanistic Explanation:**
The mechanism of public vetting ensures that the widest possible group of experts can attempt to break the system. If the system remains secure under public scrutiny, it provides a rigorous guarantee that the security depends only on the secret key.

**Distractor Analysis:**
- A: Absolutist Trap — Reverse-engineering is almost always possible; history (like the Enigma) shows that stolen machines or code reveal the algorithm eventually.
- C: Plausible Misconception — Key length is a parameter of the algorithm, not a result of its public or private status.
- D: Hedged Language Trap — Shannon’s Maxim actually assumes the attacker *does* know the system; it does not claim they are incapable of understanding it.

**Trap Categories:**
- kerckhoffs-principle
- security-through-obscurity
- public-vetting

**Diagram Ref:** none  
**Game Ref:** none

---

## Q2 — NOT-PROVIDE | Foundational

**Topic:** Security Goals (Confidentiality vs. Integrity)

**Stem:**
In the analogy of "Locking and Unlocking the Message" (Slide 11), Alice places a message in a box and locks it with a key. Which property does this specific physical mechanism NOT inherently provide in a cryptographic context?

**Choices:**
- A. Prevention of unauthorized reading of the message.
- B. A defense against eavesdroppers like Eve.
- C. Automatic detection if the message was replaced with a different one by Mallory.
- D. Assurance that the plaintext is scrambled before entering the insecure channel.

**Correct Answer:** C

**Mechanistic Explanation:**
Locking a box (encryption) provides confidentiality, ensuring Eve cannot read the message. However, encryption alone does not provide integrity; an adversary (Mallory) could replace the entire locked box with another one, or in many digital schemes, modify the ciphertext so it decrypts to a different value without the receiver knowing.

**Distractor Analysis:**
- A: Definition match — This is exactly what confidentiality/locking provides.
- B: Character match — Eve is the defined eavesdropper for confidentiality.
- D: Mechanism match — The analogy represents the transformation of plaintext into a "locked" (scrambled) form.

**Trap Categories:**
- confidentiality-vs-integrity
- encryption-not-integrity
- not-provide

**Diagram Ref:** none  
**Game Ref:** none

---

## Q3 — DIAGRAM | Foundational

**Topic:** Terminology Pipeline (Slide 13)

**Stem:**
Referencing the cryptographic terminology pipeline diagram: If an adversary intercepts the information moving through the "Insecure Channel," what is the formal name for the data they are viewing?

**Choices:**
- A. Plaintext
- B. Key
- C. Ciphertext
- D. Algorithm

**Correct Answer:** C

**Mechanistic Explanation:**
As shown in the diagram, the input to the Encryption Algorithm is Plaintext, and the output transmitted over the channel is the Ciphertext.

**Distractor Analysis:**
- A: Conflation — Plaintext is the original, unencrypted message before it enters the algorithm.
- B: Mechanism Error — The key is the secret parameter used locally by Alice and Bob; it is not sent over the insecure channel in this model.
- D: Category Error — The algorithm is the process/mathematics used to transform the data, not the data itself.

**Trap Categories:**
- ciphertext-vs-plaintext
- terminology-pipeline
- insecure-channel

**Diagram Ref:** lecture-02-q3-diagram  
**Game Ref:** none

---

## Q4 — MECHANISM | Core

**Topic:** Caesar Cipher and Frequency Analysis

**Stem:**
The Caesar cipher is considered a weak encryption scheme. Mechanistically, why does a "Frequency Analysis" attack allow Eve to break it even if she doesn't know the key $K$?

**Choices:**
- A. Because the key space is too large for modern computers to brute-force.
- B. Because the scheme preserves the statistical patterns (like the most common letters E, T, A) of the underlying language.
- C. Because the Caesar cipher uses a random one-to-one mapping for every individual character.
- D. Because the key $K$ is automatically added to the ciphertext as a header.

**Correct Answer:** B

**Mechanistic Explanation:**
The Caesar cipher uses a constant shift for every letter. This means the relative frequency of letters remains identical; if 'E' is the most common letter in English, the character representing 'E' in the ciphertext will still be the most common, allowing for a mapping attack.

**Distractor Analysis:**
- A: Opposite Fact — The key space is actually tiny (only 26 possible keys), making brute-force trivial even by hand.
- C: Conflation — This describes a general Substitution Cipher, which is slightly stronger than Caesar but still vulnerable to frequency analysis.
- D: False mechanism — The key is never sent with the message; the attack relies on internal message patterns.

**Trap Categories:**
- frequency-analysis
- caesar-cipher
- statistical-patterns

**Diagram Ref:** none  
**Game Ref:** none

---

## Q5 — MECHANISM | Core

**Topic:** Enigma's Critical Weakness

**Stem:**
On Slide 27, the professor highlights a significant mechanical weakness of the Enigma machine: "a letter never maps to itself". How did Allied cryptographers mechanistically exploit this property to break German communications?

**Choices:**
- A. They assumed the key $K$ was always 0 for the first letter.
- B. They used "cribs" (known plaintexts like weather reports) and ruled out any rotor setting where a ciphertext letter matched the corresponding plaintext letter.
- C. They waited for the Germans to send the same message twice using the same rotor settings.
- D. They used the BOMBE machine to encrypt the letter 'A' until it produced 'A'.

**Correct Answer:** B

**Mechanistic Explanation:**
Because a letter could never map to itself, cryptographers could take a "crib" (expected text like "HEIL") and slide it along the ciphertext. If any letter in the crib matched the ciphertext letter at that position, that entire alignment (and the associated rotor settings) could be discarded as impossible.

**Distractor Analysis:**
- A: Nonsense Trap — Enigma rotors provided millions of trillions of possible keys; assuming $K=0$ is irrelevant.
- C: Conflation — This describes a two-time pad attack, which is a different class of vulnerability.
- D: Logic Error — If a letter never maps to itself, searching for a setting where 'A' maps to 'A' would be a search for something that never happens.

**Trap Categories:**
- enigma-weakness
- crib-attack
- mechanism-over-keyspace

**Diagram Ref:** none  
**Game Ref:** none

---

## Q6 — GAME-WALK | Core

**Topic:** IND-CPA Game Mechanics

**Stem:**
In the IND-CPA security game (Slides 41-45), the adversary (Eve) submits two messages, $M_0$ and $M_1$, of her choice to the challenger (Alice). Why is it a strict requirement of the game that $M_0$ and $M_1$ must be of equal length?

**Choices:**
- A. Because modern encryption algorithms like AES only work on messages of exactly 128 bits.
- B. Because the One-Time Pad cannot XOR two strings of different lengths.
- C. Because cryptographic schemes are generally allowed to leak the length of the message for practicality.
- D. Because Eve would win the game by default if she could guess the coin flip $b$.

**Correct Answer:** C

**Mechanistic Explanation:**
Hiding the length of a message is computationally expensive and impractical (requiring massive padding). Therefore, standard definitions of confidentiality (like IND-CPA) allow the length to be public. If $M_0$ and $M_1$ were different lengths, Eve could distinguish between them simply by looking at the length of the ciphertext $C$, which would be a "trivial" win not related to the strength of the encryption.

**Distractor Analysis:**
- A: Plausible Misconception — While block ciphers have fixed block sizes, modes of operation allow them to encrypt arbitrary lengths.
- B: Irrelevant — While true for OTP, the IND-CPA game is a general definition for *all* encryption schemes, not just OTP.
- D: Logic Error — Guessing the coin flip is the *goal* of the game; the length requirement is a constraint on the inputs to ensure the guess isn't trivial.

**Trap Categories:**
- ind-cpa
- message-length-leakage
- game-rules

**Diagram Ref:** none  
**Game Ref:** lecture-02-q6-game

---

## Q7 — NOT-PROVIDE | Core

**Topic:** Integrity and Tags

**Stem:**
Slide 15 shows Alice using a key to create a "tag" for a message to provide Integrity. Which of the following scenarios would result in Bob's "Check Tag" algorithm failing to detect a change?

**Choices:**
- A. Mallory intercepts $(M, Tag)$ and replaces $M$ with $M'$, then recomputes a valid $Tag'$ without knowing the secret key.
- B. Mallory intercepts $(M, Tag)$ and flips a single bit in the message $M$ before it reaches Bob.
- C. Alice sends a different message than she intended, but provides the correct tag for that unintended message.
- D. Eve reads the message $M$ but does not alter it or the tag.

**Correct Answer:** A

**Mechanistic Explanation:**
If the integrity scheme is secure, Mallory should *not* be able to recompute a valid tag without the secret key. The "Check Tag" algorithm is specifically designed to fail if $M$ is changed because the tag will no longer match the modified message. Option A describes the *failure* of the integrity goal.

**Distractor Analysis:**
- B: Detection mechanism — This is exactly what the tag *is* designed to catch; the check will fail.
- C: Definition boundary — Integrity only guarantees the message wasn't changed *in transit*. It doesn't guarantee the sender's intent or the "truth" of the content.
- D: Goal Conflation — Eve reading the message is a breach of confidentiality, not integrity. Bob's integrity check will still pass because nothing was changed.

**Trap Categories:**
- integrity-tags
- mac-verification
- definition-boundary

**Diagram Ref:** none  
**Game Ref:** none

---

## Q8 — DIAGRAM | Core

**Topic:** One-Time Pad Encryption (Slide 53)

**Stem:**
In the bitwise XOR diagram for OTP encryption, Alice has:
Key $K$: `0 1 1 0`  
Plaintext $M$: `1 0 1 1`  
What is the resulting Ciphertext $C$?

**Choices:**
- A. `1 1 0 1`
- B. `1 1 1 0`
- C. `0 0 1 1`
- D. `1 0 0 1`

**Correct Answer:** A

**Mechanistic Explanation:**
XOR rules:  
$0 \oplus 1 = 1$  
$1 \oplus 0 = 1$  
$1 \oplus 1 = 0$  
$0 \oplus 1 = 1$  
Result: `1 1 0 1`.

**Distractor Analysis:**
- B: Arithmetic Errors — Swapping XOR for AND, OR, or simply misapplying the bitwise rules.
- C: Arithmetic Errors — Swapping XOR for AND, OR, or simply misapplying the bitwise rules.
- D: Arithmetic Errors — Swapping XOR for AND, OR, or simply misapplying the bitwise rules.

**Trap Categories:**
- otp
- xor
- bitwise-encryption

**Diagram Ref:** lecture-02-q8-diagram  
**Game Ref:** none

---

## Q9 — MECHANISM | Core

**Topic:** One-Time Pad Correctness

**Stem:**
Slide 57 provides the mathematical proof for OTP correctness: $Dec(K, Enc(K, M)) = M$. Which specific algebraic property of the XOR operator ($\oplus$) makes this possible?

**Choices:**
- A. $x \oplus 1 = \neg x$
- B. $x \oplus 0 = x$
- C. $x \oplus x = 0$
- D. $(x \oplus y) \oplus z = x \oplus (y \oplus z)$

**Correct Answer:** C

**Mechanistic Explanation:**
During decryption, we compute $K \oplus (K \oplus M)$. Because of the associative property and the fact that any value XORed with itself is zero ($K \oplus K = 0$), the expression simplifies to $0 \oplus M$, which equals $M$.

**Distractor Analysis:**
- A: Secondary properties — While true, they are not the primary mechanism that "cancels out" the key during decryption.
- B: Secondary properties — While true, they are not the primary mechanism that "cancels out" the key during decryption.
- D: Associative property — Necessary for the proof, but $x \oplus x = 0$ is the defining reason why the key disappears.

**Trap Categories:**
- otp-correctness
- xor-cancellation
- algebraic-property

**Diagram Ref:** none  
**Game Ref:** none

---

## Q10 — DISTRACTOR-TRAP | Core

**Topic:** Perfect Secrecy of OTP

**Stem:**
The professor states that the One-Time Pad is "perfectly secure" if the key is randomly chosen for every encryption. Why is this "perfection" not sufficient for modern internet security?

**Choices:**
- A. Because the XOR operation is too slow for modern gigabit connections.
- B. Because random numbers generated by computers are always predictable.
- C. Because the key must be as long as the message, creating a massive key-distribution problem.
- D. Because an attacker can use frequency analysis to recover the XOR key.

**Correct Answer:** C

**Mechanistic Explanation:**
For OTP to be secure, the key must be at least as long as the message and used only once. If you have a secure way to send a 1GB key to Bob, you might as well have just sent the 1GB message through that secure channel directly.

**Distractor Analysis:**
- A: Plausible Misconception — XOR is actually one of the fastest operations a CPU can perform.
- B: Absolutist Trap — While true randomness is hard, high-quality pseudo-randomness is sufficient for many tasks, but OTP specifically requires *truly* random, non-reused keys to maintain its mathematical "perfection".
- D: False mechanism — If the key is truly random and non-reused, there are no patterns for frequency analysis to exploit; the ciphertext is statistically indistinguishable from noise.

**Trap Categories:**
- otp-limitations
- key-distribution
- perfect-secrecy

**Diagram Ref:** none  
**Game Ref:** none

---

## Q11 — GAME-WALK | Advanced

**Topic:** IND-CPA and Deterministic Encryption

**Stem:**
Imagine Eve is playing the IND-CPA game against a **deterministic** encryption scheme (where the same plaintext always results in the same ciphertext). Describe Eve's winning strategy.

**Choices:**
- A. Submit two messages $M_0$ and $M_1$ of different lengths to see which one the challenger accepts.
- B. Use the "Learning Phase" to ask for the encryption of $M_0$. When the challenge ciphertext $C$ arrives, see if $C$ matches the previous result.
- C. Brute-force the secret key $K$ until the challenge ciphertext $C$ decrypts to a recognizable English word.
- D. XOR the challenge ciphertext with $M_0$ to see if the result is a valid key $K$.

**Correct Answer:** B

**Mechanistic Explanation:**
In the IND-CPA game, Eve is allowed to ask for encryptions of any message. If the scheme is deterministic, she can simply ask for $Enc(K, M_0)$. When Alice sends back $Enc(K, M_b)$, Eve just checks if the bits are identical to what she received in the learning phase. If they are, she knows $b=0$ with 100% certainty.

**Distractor Analysis:**
- A: Rule Violation — $M_0$ and $M_1$ must be the same length by the rules of the game.
- C: Efficiency Trap — Brute-forcing a key is computationally infeasible for modern algorithms; the IND-CPA game is about whether the *scheme* leaks info, not the key's strength.
- D: Technique Error — This only works for the One-Time Pad ($K = C \oplus M$). It does not work for general encryption algorithms.

**Trap Categories:**
- ind-cpa
- deterministic-encryption
- chosen-plaintext

**Diagram Ref:** none  
**Game Ref:** lecture-02-q11-game

---

## Q12 — SYNTHESIS | Advanced

**Topic:** OTP Key Reuse (Two-Time Pad)

**Stem:**
Slide 60 asks: "What if we reuse the same key for different messages? Do we still have IND-CPA?". If Alice uses the same key $K$ to encrypt $M_1$ and $M_2$ via OTP, what can Eve derive by XORing the two ciphertexts together?

**Choices:**
- A. She derives the secret key $K$.
- B. She derives the result of $M_1 \oplus M_2$.
- C. She derives the original Plaintext $M_1$.
- D. She derives a new random bitstring that is twice the length of $K$.

**Correct Answer:** B

**Mechanistic Explanation:**
$C_1 = M_1 \oplus K$  
$C_2 = M_2 \oplus K$  
$C_1 \oplus C_2 = (M_1 \oplus K) \oplus (M_2 \oplus K)$  
Because $K \oplus K = 0$, the keys cancel out, leaving $M_1 \oplus M_2$. From this, Eve can use "crib-dragging" or linguistic patterns to recover both messages.

**Distractor Analysis:**
- A: Conflation — Eve doesn't get the key; she gets the XOR sum of the plaintexts.
- C: Step Error — She gets $M_1 \oplus M_2$, which is not $M_1$ itself, though it leads to $M_1$ through further cryptanalysis.
- D: Nonsense Trap — The result is the same length as the individual messages.

**Trap Categories:**
- two-time-pad
- key-reuse
- xor-cancellation

**Diagram Ref:** none  
**Game Ref:** none

---

## Q13 — DIAGRAM | Advanced

**Topic:** IND-CPA Enigma Challenge (Slide 27)

**Stem:**
Referencing the diagram showing the attack on Enigma's "never maps to itself" property: If Eve sends $M_0 = \text{"AAAAA"}$ and $M_1 = \text{"BBBBB"}$ and receives ciphertext $C = \text{"JXQWZ"}$, how does she know Alice encrypted $M_0$?

**Choices:**
- A. Because 'J', 'X', 'Q', 'W', and 'Z' are all in the first half of the alphabet.
- B. Because none of the letters in $C$ are 'A'.
- C. Because none of the letters in $C$ are 'B'.
- D. Because the ciphertext has the same length as the plaintexts.

**Correct Answer:** B

**Mechanistic Explanation:**
The Enigma weakness is that a letter never maps to itself. If Alice encrypted "AAAAA", the ciphertext *could not possibly* contain an 'A'. Conversely, if she encrypted "BBBBB", it could not contain a 'B'. In this specific case, $C$ contains no 'A's, which is consistent with $M_0$, whereas if it were $M_1$, it would be impossible for any of those 'B's to map to something other than 'B' every single time by random chance (Statistically, if it contained a 'B', it *must* be $M_0$).

**Distractor Analysis:**
- A: Irrelevant — Alphabet position is not part of the Enigma mechanism.
- C: Logic Flip — If $C$ contained no 'B's, it would be consistent with $M_1$. But the question asks how she knows it is $M_0$.
- D: Triviality — All ciphertexts in this game have the same length; it provides no information.

**Trap Categories:**
- enigma-weakness
- ind-cpa-style-challenge
- diagram-reasoning

**Diagram Ref:** lecture-02-q13-diagram  
**Game Ref:** lecture-02-q13-game

---

## Q14 — MECHANISM | Advanced

**Topic:** Chosen-Plaintext Attack (CPA) on Substitution Ciphers

**Stem:**
Slide 23 discusses chosen-plaintext attacks on substitution ciphers. If Eve tricks Alice into encrypting the string "ABCDEFGHIJKLMNOPQRSTUVWXYZ", how many more messages can Alice securely send to Bob using that same mapping?

**Choices:**
- A. Unlimited, because the mapping is a random one-to-one function.
- B. Zero, because Eve now possesses the entire key $K$ (the mapping) and can decrypt all future ciphertexts.
- C. 26, because Eve only learned the mapping for those specific 26 characters.
- D. It depends on whether Alice uses a One-Time Pad for the next message.

**Correct Answer:** B

**Mechanistic Explanation:**
The "key" of a substitution cipher is the mapping table itself. By tricking Alice into encrypting the full alphabet, Eve sees exactly what every letter maps to. Since the mapping is fixed (not a one-time pad), the security is entirely compromised.

**Distractor Analysis:**
- A: Absolutist Trap — The randomness of the mapping only protects against brute force; it does nothing against a chosen-plaintext attack where the attacker observes the mapping directly.
- C: Logic Error — Since English only uses those 26 characters, learning the mapping for the whole alphabet is equivalent to learning the entire secret system.
- D: Category Error — The question is about the Substitution Cipher, not the OTP.

**Trap Categories:**
- chosen-plaintext
- substitution-cipher
- key-recovery

**Diagram Ref:** none  
**Game Ref:** none

---

## Q15 — TRAP | Core

**Topic:** Definition of Cryptography

**Stem:**
Modern cryptography is defined as providing "rigorous guarantees on the security of data and computation in the presence of an attacker". Which of the following statements would the professor most likely identify as a "Trap" or misconception?

**Choices:**
- A. "Security is a binary state: a system is either perfectly unbreakable or completely useless."
- B. "Modern cryptography relies heavily on hard mathematical problems."
- C. "Integrity and Authenticity are closely related properties."
- D. "Cryptography can provide security guarantees even over insecure communication channels."

**Correct Answer:** A

**Mechanistic Explanation:**
The professor emphasizes that security is about "rigorous guarantees" and "provably secure" systems under specific threat models. Believing in "unbreakable" codes (like the Germans did with Enigma) is a classic mistake. Security is about raising the cost of an attack to be computationally infeasible, not theoretically impossible.

**Distractor Analysis:**
- B: Core Taught Concepts — These are all explicitly stated or supported in the slides.
- C: Core Taught Concepts — These are all explicitly stated or supported in the slides.
- D: Core Taught Concepts — These are all explicitly stated or supported in the slides.

**Trap Categories:**
- absolutist-language
- threat-model
- security-guarantees

**Diagram Ref:** none  
**Game Ref:** none

---

## Q16 — DIAGRAM | Trap

**Topic:** Confidentiality Analogy (Slide 11)

**Stem:**
In the Confidentiality diagram, Alice uses a "Key" to "Lock Message in locked box." If the "Key" used to lock the box is different from the "Key" used by Bob to unlock it, what model of cryptography is being used?

**Choices:**
- A. Symmetric-key model
- B. Asymmetric-key model
- C. One-Time Pad model
- D. Caesar Cipher model

**Correct Answer:** B

**Mechanistic Explanation:**
As defined on Slide 9, the Symmetric-key model involves Alice and Bob sharing the *same* secret key. If they use different keys (a public key to lock and a secret key to unlock), it is the Asymmetric-key model (e.g., RSA).

**Distractor Analysis:**
- A: Definition Mismatch — Symmetric means "same key".
- C: Sub-category Error — OTP and Caesar are both examples of Symmetric-key cryptography where the keys are the same.
- D: Sub-category Error — OTP and Caesar are both examples of Symmetric-key cryptography where the keys are the same.

**Trap Categories:**
- symmetric-vs-asymmetric
- key-model
- confidentiality-analogy

**Diagram Ref:** lecture-02-q16-diagram  
**Game Ref:** none

---

## Q17 — APPLICATION | Core

**Topic:** IND-CPA and Semantic Security

**Stem:**
Consider the professor's "Scheme #2" for a grading system: `Enc("pass")` always starts with `00`, and `Enc("fail")` always starts with `11`. Mechanistically, why does this fail the IND-CPA test?

**Choices:**
- A. Because the messages "pass" and "fail" are different lengths.
- B. Because the ciphertext gives the attacker additional information (a "leak") that allows them to distinguish the plaintext with probability 1.
- C. Because the attacker doesn't know the secret key $K$.
- D. Because the scheme uses a public hash function instead of encryption.

**Correct Answer:** B

**Mechanistic Explanation:**
The definition of confidentiality/IND-CPA is that the ciphertext should not give the attacker *any* additional information. If Eve sees a ciphertext starting with `00`, she knows with 100% certainty that the grade was "pass," meaning her guessing probability is 1, which is much higher than the required $1/2$ for a secure scheme.

**Distractor Analysis:**
- A: Misinterpretation — While they are different lengths, the *primary* failure described in the example is the deterministic prefix `00` or `11`.
- C: Logic Error — The goal of IND-CPA is to be secure *despite* not knowing the key. If you can distinguish the messages without the key, the scheme is broken.
- D: Category Error — The example is explicitly about an "encryption scheme".

**Trap Categories:**
- ind-cpa
- semantic-security
- ciphertext-leakage

**Diagram Ref:** none  
**Game Ref:** none

---

## Q18 — GAME-WALK | Core

**Topic:** OTP Key Generation

**Stem:**
According to Slide 56, for One-Time Pads, we must "generate a new key for every message". If Alice generates a 128-bit random key $K$ and uses it to encrypt a 64-bit message $M_1$ and then uses the remaining 64 bits to encrypt $M_2$, has she violated the "One-Time" rule?

**Choices:**
- A. Yes, because the key $K$ was only generated once.
- B. No, because no individual bit of the key was used more than once.
- C. Yes, because the length of the key must match the total length of all messages ever sent.
- D. No, because the key is secret and known only to Alice and Bob.

**Correct Answer:** B

**Mechanistic Explanation:**
The critical security mechanism of OTP is that no key *bit* is reused. If Alice has 128 bits of randomness, she can safely encrypt 128 bits of plaintext, whether that is in one message or two 64-bit messages, provided she never uses the same offset of the key twice.

**Distractor Analysis:**
- A: Logic Error — The generation frequency doesn't matter; the *usage* frequency of the bits matters.
- C: Hedged Language Trap — While true that you need enough bits, using a large "pad" in segments is a standard way to implement OTP.
- D: Irrelevant — Being secret is a requirement for all symmetric crypto, but it doesn't address the "one-time" property specifically.

**Trap Categories:**
- otp
- key-bit-reuse
- game-walk

**Diagram Ref:** none  
**Game Ref:** lecture-02-q18-game

---

## Q19 — MECHANISM | Core

**Topic:** Substitution Ciphers vs. Caesar Ciphers

**Stem:**
A Substitution Cipher is described as "better" than a Caesar Cipher (Slide 22). Mechanistically, what is the primary advantage of a Substitution Cipher?

**Choices:**
- A. It is IND-CPA secure.
- B. It has a significantly larger key space ($26!$ vs. $26$), making brute-force attacks computationally difficult.
- C. It prevents frequency analysis by mapping common letters to random symbols.
- D. It provides integrity by using a secret one-to-one mapping.

**Correct Answer:** B

**Mechanistic Explanation:**
As Slide 23 notes, there are $26! \approx 2^{88}$ possible mappings, which is "too much for most modern computers" to brute-force, whereas the Caesar cipher only has 26 possible shifts.

**Distractor Analysis:**
- A: Absolutist Trap — No deterministic cipher (like a fixed substitution) is IND-CPA secure.
- C: False mechanism — It still maps 'E' to the same ciphertext character every time, so the frequencies are preserved.
- D: Goal Conflation — Substitution provides (weak) confidentiality; it does nothing to prevent or detect tampering (integrity).

**Trap Categories:**
- substitution-vs-caesar
- keyspace
- frequency-analysis

**Diagram Ref:** none  
**Game Ref:** none

---

## Q20 — NOT-PROVIDE | Advanced

**Topic:** OTP and Integrity

**Stem:**
If Alice sends a message $M$ to Bob using a One-Time Pad ($C = M \oplus K$), and Mallory intercepts $C$ and XORs it with a bitstring $L$ (computing $C' = C \oplus L$), what will Bob receive when he decrypts $C'$?

**Choices:**
- A. Bob will receive a "Decryption Error" because the integrity check failed.
- B. Bob will receive the original message $M$.
- C. Bob will receive the message $M \oplus L$.
- D. Bob will receive a random string of bits that looks like noise.

**Correct Answer:** C

**Mechanistic Explanation:**
$Dec(K, C \oplus L) = (M \oplus K) \oplus L \oplus K = M \oplus L$.  
The OTP provides no integrity. An attacker can precisely flip bits in the plaintext by flipping them in the ciphertext, and Bob has no way to know the message was tampered with.

**Distractor Analysis:**
- A: Misconception — OTP has no built-in integrity or authentication; it "blindly" decrypts whatever it receives.
- B: Logic Error — Changing the ciphertext *must* change the decryption in an XOR-based scheme.
- D: Incomplete Reasoning — While the result might *look* like noise if $L$ is random, Mallory can choose $L$ to change the message to something specific (e.g., changing "Pay $10" to "Pay $90").

**Trap Categories:**
- otp-not-integrity
- ciphertext-malleability
- bit-flipping

**Diagram Ref:** none  
**Game Ref:** none

---

## Q21 — DIAGRAM | Advanced

**Topic:** Roadmaps and Classification (Slides 17/33/49)

**Stem:**
In the "Cryptography Roadmap" tables, where do **Digital Signatures** fall?

**Choices:**
- A. Symmetric-key; Confidentiality
- B. Asymmetric-key; Confidentiality
- C. Symmetric-key; Integrity, Authentication
- D. Asymmetric-key; Integrity, Authentication

**Correct Answer:** D

**Mechanistic Explanation:**
Digital signatures (like RSA signatures) are the asymmetric equivalent of MACs; they provide integrity and authenticity using a public/private key pair.

**Distractor Analysis:**
- A: Classification Errors — Signatures do not provide confidentiality (the message is often public), and they are inherently asymmetric (unlike MACs).
- B: Classification Errors — Signatures do not provide confidentiality (the message is often public), and they are inherently asymmetric (unlike MACs).
- C: Classification Errors — Signatures do not provide confidentiality (the message is often public), and they are inherently asymmetric (unlike MACs).

**Trap Categories:**
- digital-signatures
- asymmetric-crypto
- integrity-authentication

**Diagram Ref:** lecture-02-q21-diagram  
**Game Ref:** none

---

## Q22 — MECHANISM | Advanced

**Topic:** IND-CPA and Randomization

**Stem:**
The professor notes that a "better definition of confidentiality" is IND-CPA. If an encryption algorithm $Enc(K, M)$ is to be IND-CPA secure, what MUST be true about the output of the algorithm when called twice on the same message $M$?

**Choices:**
- A. The outputs must be identical to ensure Bob can decrypt them.
- B. The outputs must be different (probabilistic/randomized) so an attacker cannot correlate them.
- C. The outputs must be exactly 128 bits long.
- D. The outputs must be XORed with the secret key $K$ a second time.

**Correct Answer:** B

**Mechanistic Explanation:**
To defeat a Chosen-Plaintext Attack (CPA), the scheme must be non-deterministic. If $Enc(K, M)$ always produced the same $C$, the attacker would win the IND-CPA game instantly by comparing the challenge $C$ to a previously requested encryption.

**Distractor Analysis:**
- A: Conflation — Correctness (Bob being able to decrypt) does not require identical ciphertexts; Bob just needs an algorithm that can reverse the transformation regardless of the random bits used.
- C: Hedged Language Trap — While many blocks are 128 bits, the property of being IND-CPA is about randomization, not length.
- D: Nonsense Trap — This is a specific step in some algorithms, but not a general requirement for security.

**Trap Categories:**
- ind-cpa
- randomized-encryption
- deterministic-encryption

**Diagram Ref:** none  
**Game Ref:** none

---

## Q23 — APPLICATION | Core

**Topic:** Adversary Strategy in IND-CPA

**Stem:**
In Step 5 of the IND-CPA game (Slide 45), Eve outputs a guess $b=0$ or $b=1$. If Eve is simply "randomly guessing," what is her probability of winning?

**Choices:**
- A. 0
- B. 1/2
- C. 1
- D. $1/2^{88}$

**Correct Answer:** B

**Mechanistic Explanation:**
The baseline for security is $1/2$. If Eve can do *any* better than random guessing (probability $> 1/2$), the scheme is considered insecure because the ciphertext has leaked some information.

**Distractor Analysis:**
- A: Absolutist Traps.
- C: Absolutist Traps.
- D: Conflation — $2^{88}$ was the key space for the substitution cipher; it is not the probability of a coin-flip guess.

**Trap Categories:**
- ind-cpa
- random-guess-baseline
- security-game

**Diagram Ref:** none  
**Game Ref:** lecture-02-q23-game

---

## Q24 — MECHANISM | Core

**Topic:** Symmetric Key Model

**Stem:**
Slide 34 states: "Symmetric-key means Alice and Bob share the same secret key that the attacker doesn’t know". What is the primary advantage of this model over the asymmetric model?

**Choices:**
- A. It allows for easier key distribution over public channels.
- B. It is generally much faster and more efficient for encrypting large amounts of data.
- C. It does not require any prior contact between Alice and Bob.
- D. It is the only model that can provide integrity.

**Correct Answer:** B

**Mechanistic Explanation:**
Symmetric algorithms (like AES) are built for speed and high throughput (Slide 36: ">1 Gbps on a standard computer"). Asymmetric algorithms involve complex number theory and are significantly slower.

**Distractor Analysis:**
- A: Category Errors — These are actually the *disadvantages* of symmetric crypto; key distribution is its biggest headache.
- C: Category Errors — These are actually the *disadvantages* of symmetric crypto; key distribution is its biggest headache.
- D: Absolutist Trap — Both models can provide integrity (MACs for symmetric, Signatures for asymmetric).

**Trap Categories:**
- symmetric-key
- performance
- key-distribution

**Diagram Ref:** none  
**Game Ref:** none

---

## Q25 — SYNTHESIS | Advanced

**Topic:** History and Evolution of Cryptography

**Stem:**
Reflecting on the "Takeaways" (Slide 31) and the move from Enigma to computers: Why did the invention of the BOMBE and the work of Alan Turing mark a "paradigm shift" in cryptography?

**Choices:**
- A. It proved that mechanical systems are inherently more secure than paper-and-pencil systems.
- B. It demonstrated that even massive key spaces ($10^{20}$ possibilities) could be defeated through a combination of mechanical brute force and exploiting algorithmic weaknesses.
- C. It introduced the concept of the One-Time Pad to the world.
- D. It made Kerckhoff's Principle obsolete by proving that secret algorithms are better.

**Correct Answer:** B

**Mechanistic Explanation:**
The Enigma had a massive number of possible keys, but the Allies broke it by using BOMBE to automate the search and by exploiting weaknesses like "no letter maps to itself". This showed that key size alone is not a guarantee of security if the mechanism is flawed.

**Distractor Analysis:**
- A: Logic Flip — It proved the opposite; mechanical systems could be systematically defeated.
- C: Historical Error — OTP is a separate concept from the rotor-based Enigma.
- D: Misinterpretation — It actually *validated* Kerckhoff's Principle: once the Allies stole the machines (the algorithm), the Germans' reliance on "obscurity" was their downfall.

**Trap Categories:**
- enigma-history
- bombe
- keyspace-vs-weakness

**Diagram Ref:** none  
**Game Ref:** none

---
