# IND-CPA, Determinism, and Encryption Games

## The core idea

IND-CPA formalizes semantic security as a game: an adversary chooses two equal-length messages, receives an encryption of one of them, and tries to guess which message was encrypted. The attacker is allowed to ask for encryptions of other plaintexts, so the scheme must remain secure even when the attacker can build reference ciphertexts.

## Why deterministic encryption fails

If encryption is deterministic, then repeated encryption of the same message under the same key produces the same ciphertext. A chosen-plaintext adversary can query `Enc_k(M_0)` before the challenge, then compare that reference value with the challenge ciphertext.

The distinguishing rule is simple:

```text
if C* == Enc_k(M_0), guess b = 0
else guess b = 1
```

The failure is equality leakage. It is not automatically key recovery.

## Randomness and nonces

Randomized encryption, IVs, and unique nonces are mechanisms for preventing equal plaintexts from producing linkable ciphertexts. They are not magic. A nonce-based mode needs the nonce to be unique where the security proof requires uniqueness. In CTR mode, repeating a nonce under the same key repeats the keystream:

$$
C_1 \\oplus C_2 = (M_1 \\oplus S) \\oplus (M_2 \\oplus S) = M_1 \\oplus M_2
$$

That leaks relationships between plaintexts even if the key itself is not recovered.

## What IND-CPA does not say

IND-CPA is a confidentiality definition. It does not guarantee integrity, authenticity, or resistance to ciphertext modification. A scheme can hide plaintexts from eavesdroppers and still be malleable. Authenticated encryption is the normal tool when confidentiality and integrity are both required.

## Professor traps to watch

- Overclaiming that every confidentiality failure reveals the key.
- Confusing CPA encryption-oracle access with CCA decryption-oracle access.
- Treating randomness as sufficient without asking how it is generated and used.
- Answering with a true statement about integrity when the question asks about confidentiality.
