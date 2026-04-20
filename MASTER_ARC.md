# THE MYSTERY SCHOOL — MASTER ARC ARCHITECTURE
## Forged April 20, 2026 — Opus 4.7 · Full 25-Feature Integration Map

> The feature list is not the architecture. This document is.
> Every feature touches others. The cathedral is held by the cross-beams, not the rooms.

---

## I. THE THREE SPINES

All 25 features belong to one of three spines. Understanding the spine clarifies the purpose.

### SPINE A — THE LIVING RELATIONSHIP
*The app knows Mac as a continuous being.*
U-01 Covenant · U-02 Rite of Return · U-03 Mirror · U-17 Time Braiding · U-18 Threshold Registry · U-19 Companion Map · U-22 Resonance Testing

### SPINE B — THE LIVING COSMOS
*The app is in relationship with the real world — sky, body, dream, synchronicity.*
U-04 Cosmos · U-05 Wheel · U-06 Somatic · U-07 Elements · U-08 Oracle · U-09 Synchronicity · U-20 Dreams · U-21 Shadow Parts

### SPINE C — THE LIVING TRANSMISSION
*The app produces artifacts, ceremonies, and sovereignty.*
U-10 Voice · U-11 Scriptorium · U-12 Grimoire · U-13 Mycelium · U-14 Ceremony Arcs · U-15 Initiation · U-16 Void Council · U-23 Cipher · U-24 Sovereign Sync · U-25 Encryption

**Why this matters:** when building, check which spine you're serving. A feature that serves none of them is decoration. A feature that serves two is leverage.

---

## II. DEPENDENCY GRAPH

Some features REQUIRE others. Some ENHANCE others. Build order must respect this.

```
HARD DEPENDENCIES (must build before):
  U-12 Grimoire Export        ← requires U-11 Scriptorium (uses ScrollRenderer)
  U-15 Initiation Rites       ← enhanced by U-10 Voice (Sol's address spoken aloud)
  U-14 Ceremony Arcs          ← uses U-15 sigils (completion sigils in arc end)
  U-14 Ceremony Arcs          ← uses U-17 letters (threshold-return letters)
  U-14 Ceremony Arcs          ← linked to U-18 Threshold Registry (arc completions marked)
  U-16 Void Council           ← requires Void Room unlocked (already built S7)
  U-25 Encryption at Rest     ← protects data from U-09, U-17, U-18, U-19, U-20
  U-24 Sovereign Sync         ← benefits from U-25 (encrypted payload is already encrypted)

ENHANCEMENTS (work standalone, deepen with others):
  U-01 Covenant               → surfaces in U-02 Return flow, U-14 arcs, U-15 initiation
  U-03 Mirror Protocol        → pulls data from U-06, U-08, U-09, U-20, U-22
  U-06 Somatic Scoring        → feeds Guide context, appears in U-03 Mirror
  U-07 Elements               → feeds Guide suggestions, appears in U-03 Mirror
  U-09 Synchronicity          → visible in U-03 Mirror, affects Oracle weighting
  U-13 Mycelium               → navigable view — every other feature benefits from it existing
  U-17 Time Braiding          → wraps around U-14 arcs (pre/post letters)
  U-18 Threshold Registry     → appears in U-03 Mirror, U-17 letters, U-14 ceremonies
  U-19 Companion Map          → Guide references, Journal tags, appears in U-03 themes
  U-20 Dreams                 → pattern data feeds U-03 Mirror, Guide context
  U-21 Shadow Parts           → Guide suggestions, Journal integration
  U-22 Resonance              → surfaces in U-03 Mirror, deepens subject study
  U-23 Cipher                 → rewards spread through all other features (Easter eggs)
```

**Build order implication:** the current Wave ordering in UNIQUE_FEATURES.md is ALMOST right. One revision:
- **Move U-10 Voice of the School from Wave 4 to late Wave 3** — it elevates U-15 Initiation (already shipped in Wave 1) retroactively. The sooner Sol speaks, the sooner the school has a voice.

---

## III. INTEGRATION MOMENTS (THE CROSS-BEAMS)

These are the moments where features touch. Building them correctly is what makes the app feel *alive* rather than modular.

### IM-1: THE RETURN SEQUENCE
**Features involved:** U-02 Rite of Return → U-01 Covenant → U-17 Time Braiding
**The moment:** Mac has been away 30 days. On launch:
1. Rite of Return fires (U-02)
2. If covenant exists: after Re-center/Browse/Log choice, covenant surfaces: *"Does this still hold?"*
3. If a letter from past-self was due during absence: delivered now (U-17)
**Build reminder:** when building U-17, ensure letter-delivery check runs AFTER U-02 rite resolves, not before.

### IM-2: THE CEREMONY ARC SPINE
**Features involved:** U-14 Ceremony Arcs + U-15 Sigils + U-17 Letters + U-18 Registry
**The moment:** Mac signals "grief" threshold. App offers 40-day arc.
1. Before starting: offer to write a letter to the self who completes this (U-17)
2. 40 days of daily activations (reading/practice/journal/Guide)
3. On completion: generate sigil (reuse U-15 sigilGenerator), deliver the pre-written letter, mark in Registry (U-18), add to Mirror
**Build reminder:** U-14 is not one feature — it's the integration hub of the grief/passage path. Build U-15, U-17, U-18 BEFORE U-14, or U-14 becomes a scaffold needing rework.

### IM-3: THE MIRROR SYNTHESIS
**Features involved:** U-03 Mirror Protocol pulls from U-06, U-07, U-08, U-09, U-20, U-22
**The moment:** 90 days elapsed. Mirror generates.
**Build reminder:** U-03 is the LAST feature of Wave 5 for a reason — it needs all the data sources to exist first. If built too early, it shows a mostly-empty portrait.

### IM-4: THE ORACLE'S WEIGHTED DRAW
**Features involved:** U-08 Oracle draws from existing subject/tarot/journal/Guide pools
**The moment:** Mac asks the Oracle a question.
**Build reminder:** Oracle does not need new data — it needs *weighted access* to existing pools. The door biases the subject draw. The phase biases the journal prompt. Mac's current elemental balance (U-07) subtly tilts tarot.

### IM-5: THE ENCRYPTED VAULT BOUNDARY
**Features involved:** U-25 Encryption protects U-17, U-18, U-19, U-20 (intimate data)
**The moment:** User sets passphrase.
**Build reminder:** When building U-17/U-18/U-19/U-20, store data in a way that's easy to wrap with encryption later. Use a single `secureStoreGet/Set` helper from day one even if it's pass-through until U-25 ships.

---

## IV. RISK MATRIX

Features with hidden complexity. Flagging now prevents surprise.

| Feature | Risk | Mitigation |
|---|---|---|
| U-04 Cosmos | Astronomy math is nontrivial. Lunar calc is easy; planetary is hard. | Ship in two passes: v1 = moon phase only. v2 = Mercury retrograde + Saturn return. Full natal transits = v3 (maybe never). |
| U-13 Mycelium | Authoring 295 relationship sets is 6+ hours alone. | Ship the view with auto-detected prereqs first (subjects.js already has `prereq` field). Hand-author complement/tension/synthesis incrementally as subjects are studied. |
| U-14 Ceremony Arcs | 18 arc scripts (6 types × 3 lengths) is heavy authorial work. | Write 3-day arcs for all 6 types first. 7-day and 40-day arcs can follow. |
| U-20 Dreams | Archetypal pattern detection needs a good symbol dictionary. | Reuse `dreamSymbols.js` already built S7. Extend rather than replace. |
| U-23 Cipher | Fun to design, fiddly to test. Each puzzle is a small rabbit hole. | Build 3 puzzles, ship. Add more as delightful bonuses over time — no completion pressure. |
| U-24 Sovereign Sync | Merge logic is subtle. Conflicting edits across devices is a real problem. | V1 = replace-only (import overwrites local). V2 = chronological merge. Get v1 shipped, live with the constraint. |
| U-25 Encryption | Security done wrong is worse than no security. | Use a well-audited library (e.g. `node-forge` or Electron's built-in `safeStorage`). Never hand-roll crypto. |

---

## V. THE SOUL TEST (for every feature, always)

Before building any feature, answer these three questions:

1. **Does it serve Mac's sovereignty?** (not engagement, not retention, not metrics — sovereignty)
2. **Would Hermes build this?** (or is this a SaaS-patterned feature wearing mystical clothing?)
3. **If this feature never existed, would the school be less of a school?** (if no → don't build it)

If all three are yes → build. If any are no → redesign or drop.

**Corollary:** every feature that passes the soul test must also pass the FIRE TEST: it compiles, it doesn't crash, it's usable by someone who has never seen it. The soul test protects meaning; the fire test protects trust.

---

## VI. THE SHIPPING CALCULUS

Not all features are equal. Some are load-bearing, some are decorative, some are the reason the app exists.

### TIER S — LOAD-BEARING (the app is broken without these)
U-02 Rite of Return · U-01 Covenant · U-15 Initiation · U-14 Ceremony Arcs · U-25 Encryption at Rest

Without these, the school is a well-decorated notebook. With them, it's a school.

### TIER A — WORLD-CLASS (differentiators — no other app has these)
U-04 Cosmos · U-06 Somatic · U-08 Oracle · U-11 Scriptorium · U-17 Time Braiding · U-24 Sovereign Sync

These are the features reviewers and practitioners remember.

### TIER B — DEPTH (make the school feel alive over months)
U-03 Mirror · U-05 Wheel · U-09 Synchronicity · U-13 Mycelium · U-16 Void Council · U-20 Dreams · U-21 Shadow Parts · U-22 Resonance

### TIER C — DELIGHT (not required, but honor the attentive)
U-07 Elements · U-10 Voice · U-12 Grimoire · U-18 Registry · U-19 Companion Map · U-23 Cipher

### Optimal ship order (by tier, respecting dependencies):
```
SESSION 11:  U-02, U-01, U-15, U-06            (Wave 1 — Tier S/A)
SESSION 12:  U-04, U-08, U-05                  (Wave 2 — Tier A/B)
SESSION 13:  U-17, U-18, U-10                  (prep for U-14)
SESSION 14:  U-14 Ceremony Arcs                (the integration piece — full session alone)
SESSION 15:  U-25 Encryption, U-24 Sync        (sovereignty spine)
SESSION 16:  U-11, U-12                        (Scriptorium + Grimoire)
SESSION 17:  U-20, U-21, U-22                  (depth layers)
SESSION 18:  U-03 Mirror, U-13 Mycelium        (needs all data)
SESSION 19:  U-07, U-09, U-19, U-16, U-23      (polish wave — mixed tier C/B)
```

9 sessions to ship all 25. That is the honest estimate.

---

## VII. THE INVARIANTS (never violate)

These rules hold across every feature:

1. **No cloud dependency.** Everything in `electron-store` or encrypted local files.
2. **No telemetry.** The app does not report. Not even anonymous usage. Nothing.
3. **No dark patterns.** No streak-shaming, no notification warfare, no "X users just joined" FOMO.
4. **No feature that punishes absence.** The school holds, it does not grasp.
5. **No feature that requires account creation.** The app is usable offline, forever.
6. **Every text Mac writes is his — exportable, deletable, sovereign.**
7. **Every feature must pass the soul test AND the fire test before ship.**

If a future feature request violates any invariant → it does not belong in this app. It belongs in a different product or not at all.

---

## VIII. THE ULTIMATE TEST (from ROADMAP_WORLD_CLASS.md — restated here)

> At the end of three years, one user exists — somewhere in the world, in a language you don't speak — who has:
> - Been held through a real crisis by the app
> - Completed a real initiation ceremony at a door crossing
> - Built a peer circle with strangers who became soul-friends
> - Studied 100 subjects deeply enough to teach them
> - Contributed a subject back into the open curriculum
> - Experienced a transformation they can point to
>
> That user is who every commit is for.

This document is the map of what gets built for them.

---

*⊚ Sol ∴ P∧H∧B ∴ Rubedo*
