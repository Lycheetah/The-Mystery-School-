# THE MYSTERY SCHOOL — SESSION 11 BUILD PLAN
## Forged April 20, 2026 — Sol Architecture · Executed by Sonnet
### Governing question: *"Would Hermes build this?"*

---

## TONIGHT SCOPE (SHIPPABLE)

**Ship tonight: U-02 + U-01.** Cut: U-15, U-06 → Session 12.

**Why:** 4 features = ~16h. One night = ~5h realistic. 2 features clean > 4 rushed. U-02 + U-01 together form the post's narrative:

> *"The Mystery School now holds absence without shame, and asks the student to bind themselves to their own Work."*

Complete story. Post-worthy. No broken edges.

**Tonight's sequence (~5h):**
1. U-02 Rite of Return  (~2h)  → npm run dev verify → fire tests pass
2. U-01 Covenant        (~3h)  → npm run dev verify → fire tests pass
3. `npm run build`                → produces new EXE
4. Screenshot + draft post
5. Commit + tag (optional v1.1.0)

**Session 12 (another night):**
- U-15 Initiation Rites (6h) — full session on its own, sigil generator is careful work
- U-06 Somatic Scoring (5h) — SVG body map is detailed

---

## PRIME DIRECTIVE

Session 11 ships the ethical spine of Wave 1 — the features that make the Mystery School *humane and sovereign*. By end of session:

1. **U-02 Rite of Return** — the school never shames absence  [TONIGHT]
2. **U-01 The Covenant** — the student binds themselves to the Work  [TONIGHT]
3. **U-15 Initiation Rites** — classroom completion becomes ceremony  [SESSION 12]
4. **U-06 Somatic Scoring** — the body is tracked, not just the mind  [SESSION 12]

Full specs for each are in `~/mystery-school/UNIQUE_FEATURES.md`. This plan gives the execution order and file targets. Read UNIQUE_FEATURES.md for full detail before building any task.

---

## EXECUTION RULES (read before touching anything)

1. **Work top-down.** U-02 → U-01 → U-15 → U-06. Finish each before starting next.
2. **One task per cycle.** READ minimum files → CHANGE → `npm run dev` verify → next.
3. **Dev command:** `cd C:\Users\thedo\mystery-school && npm run dev`
4. **Never use Agent tool.** Direct Read/Edit/Write only.
5. **Never trigger `eas build` or `npm run build`.** Dev only this session.
6. **Silence rule.** Ship diffs. No narration between tasks.
7. **Mark tasks done** in this file (edit Status line) when complete.
8. **Grep "NOT STARTED"** to find next task after context compression.
9. **Mobile `app/` directory is PAUSED.** All work in `src/`.

---

## CURRENT BUILD STATE

- **Platform:** Electron + Vite + React. `src/` is everything.
- **Last build:** ✓ 103 modules, 19.35s clean (Session 10)
- **295 subjects** — all articles written across all tiers
- **All 40 original roadmap tasks:** DONE
- **UNIQUE_FEATURES.md:** 25 features, all NOT STARTED — this session starts Wave 1

**Key files to know:**
```
src/App.jsx                    — root, launch detection goes here
src/components/Shell.jsx       — nav, view routing, navPayload
data/schema.js                 — KEYS store — add new keys here
data/subjects.js               — main subjects
engine/guide.js                — Guide system prompt builder
src/views/HomeView.jsx         — dashboard — surfacing logic goes here
src/views/PracticeView.jsx     — practice sessions
src/views/StudyView.jsx        — subject browser + detail
src/views/SpiralView.jsx       — Journey/Stats/Evidence/Constellation tabs
```

---

## TASK 1 — U-02: RITE OF RETURN
**Status:** NOT STARTED
**Complexity:** SMALL-MEDIUM (~2h)
**Why first:** Smallest. Highest ethical impact. Sets the tone for what this school is.

### What to build
On app launch, detect last active date. If `> 14 days` since last use:
- Full-screen Rite of Return replaces normal Home
- Three options:
  1. **Re-center** — 5-min phase-appropriate practice (use existing breathwork engine)
  2. **Browse** — skip, open Home normally
  3. **Log what happened** — journal prompt: "Where were you? What happened while you were away?"
- Absence does NOT reset streak — streak pauses. Add `STREAK_PAUSE_DAYS` tracking.
- No red badges. No "you missed X days." Only: *"Welcome back. You've been away."*

### Files
```
CREATE: src/views/RiteOfReturnView.jsx
CREATE: src/views/RiteOfReturnView.css
EDIT:   src/App.jsx  — launch detection (check LAST_ACTIVE_DATE on mount, set flag)
EDIT:   src/components/Shell.jsx  — if returnRite flag, show RiteOfReturnView before Home
EDIT:   data/schema.js  — add LAST_ACTIVE_DATE, RETURN_RITES keys
```

### Schema additions
```js
LAST_ACTIVE_DATE: 'last_active_date',   // ISO date string, updated on every session
RETURN_RITES:     'return_rites',        // array of { date, choiceMade, note }
```

### Implementation notes
- Update `LAST_ACTIVE_DATE` in `App.jsx` on every mount (after checking)
- Threshold: 14 days (`Date.now() - lastActive > 14 * 24 * 60 * 60 * 1000`)
- For "Re-center": pull user's current phase from `USER_STATE`, pick phase-matched practice from `PROTOCOL_MAP` in `engine/assessment.js`, navigate to PracticeView with that practice pre-selected
- For "Log what happened": open JournalView with pre-filled prompt
- Streak pause: when RETURN detected, store gap days in `STREAK_PAUSE_DAYS` — don't add to missed count

---

## TASK 2 — U-01: THE COVENANT
**Status:** NOT STARTED
**Complexity:** MEDIUM (~3h)
**Why second:** The spine of self-sovereignty. After Rite of Return proves the school's ethics, this proves its depth.

### What to build
Post-assessment, the school asks the student to write their covenant — in their own words:
- What are you here to study?
- What will you do with what you learn?
- What do you promise to yourself?

Minimum suggested: 100 words. No cap. No right answer. Signed with a personal glyph (1-3 char picker).

Covenant surfaces at:
- Major phase shifts (detected in assessment/pulse)
- Every classroom completion
- 90-day anniversaries of first onboarding
- App reopens after 14+ day absence (after Rite of Return)
- User can re-affirm or rewrite (old versions archived)

### Files
```
CREATE: src/views/CovenantView.jsx
CREATE: src/views/CovenantView.css
EDIT:   src/views/Onboarding.jsx       — add final covenant step after door selection
EDIT:   src/views/SettingsView.jsx     — "Revisit your covenant" button
EDIT:   src/views/HomeView.jsx         — surfacing logic (phase shifts, anniversaries, return)
EDIT:   data/schema.js                 — COVENANT, COVENANT_HISTORY, COVENANT_GLYPH
```

### Schema additions
```js
COVENANT:         'covenant',          // { text, glyph, date }
COVENANT_HISTORY: 'covenant_history',  // array of past covenants
COVENANT_GLYPH:   'covenant_glyph',    // user's personal glyph (1-3 chars)
```

### Surfacing logic (HomeView)
```js
// Check on mount:
// 1. Days since onboarding % 90 === 0 → show covenant anniversary
// 2. Phase just shifted (compare USER_STATE.phase to ASSESSMENT.previousPhase) → show
// 3. Just returned from 14+ days → show after Rite of Return (RiteOfReturn sets flag)
// 4. Just completed a classroom → StudyView calls onCovenantSurface()
```

### CovenantView UI
- Full-screen, dark, ceremonial
- Scroll showing previous covenant (if exists) with date
- Text area (min-height 200px, no char limit, 100-word suggestion)
- Glyph picker: text input 1-3 chars + preview
- "Seal the Covenant" button — disabled until 50+ chars
- After sealing: brief ceremony animation, then return to wherever they came from

---

## TASK 3 — U-15: INITIATION RITES
**Status:** NOT STARTED
**Complexity:** MEDIUM-LARGE (~6h)
**Why third:** Makes completion sacred. Every classroom has been built — now they become thresholds.

### What to build
When all subjects in a classroom reach `Practising` or higher mastery:
- Full-screen ceremony view launches
- Rubedo ambient tone plays
- Scroll of journey: subjects studied, evidence notes, practice sessions, dates
- Initiation address: Sol speaks to the student about this specific classroom's meaning
- SVG sigil generated deterministically from seed (user ID + classroom ID + completion date)
- Sigil stored, displayed permanently at top of that classroom
- Classroom state advances to `'initiated'` (beyond `'complete'`)

### Files
```
CREATE: src/views/InitiationRiteView.jsx
CREATE: src/views/InitiationRiteView.css
CREATE: engine/sigilGenerator.js        — deterministic SVG from seed string
CREATE: data/initiationAddresses.js     — one initiation address per classroom (10 classrooms)
EDIT:   src/views/StudyView.jsx         — detect completion, launch rite, show sigil
EDIT:   data/schema.js                  — INITIATION_SIGILS, INITIATED_CLASSROOMS
```

### Sigil generator
```js
// engine/sigilGenerator.js
// Input: seed string (userId + classroomId + date)
// Output: SVG string — deterministic geometric pattern
// Approach: use seed to drive a simple geometric algorithm
// (e.g., Lissajous-style curves or overlapping circles with seed-derived params)
// No randomness — same seed always produces same sigil
export function generateSigil(seed) { ... }
```

### Initiation addresses (data/initiationAddresses.js)
Write one ~150-word address per classroom. Voice: Sol, warm, exact, earned.
Classrooms: Hermetic Foundations, Shadow & Depth, Eastern Wisdom, Western Esoteric,
Somatic & Embodied, Scientific Frontier, Indigenous & Earth, Creative & Expressive,
Relational & Systemic, Contemplative Traditions.

### Completion detection (StudyView)
```js
// After every mastery update:
// Check if all subjects in current classroom are at 'practising' or 'integrated'
// If yes AND classroom not already in INITIATED_CLASSROOMS:
//   → launch InitiationRiteView as overlay
```

---

## TASK 4 — U-06: SOMATIC SCORING
**Status:** NOT STARTED
**Complexity:** MEDIUM-LARGE (~5h)
**Why fourth:** Gnosis is bodily or it is nothing. The body map is the most visually unique feature in the app.

### What to build
After every practice session completes, a modal asks: *"Where did this land?"*
SVG body silhouette with tappable regions. User taps any number of regions, can add a word.
Stored in practice log. Body Map heat map in SpiralView.

### Files
```
CREATE: src/components/BodyMap.jsx        — SVG silhouette, tappable regions
CREATE: src/components/BodyMap.css
EDIT:   src/views/PracticeView.jsx        — post-practice: show BodyMap modal
EDIT:   src/views/SpiralView.jsx          — new "Body" tab with heat map
EDIT:   data/schema.js                    — extend practice log entries with somaticScore
```

### Body regions (SVG silhouette)
```
Regions: head, throat, heart, solar-plexus, belly, hips, hands, feet, spine, field
Each region is an SVG path/circle with:
  - default: transparent fill, subtle border
  - selected: accent color fill at 60% opacity
  - hover: accent color at 20%
```

### Data structure
```js
// Added to practice session log entry:
somaticScore: [
  { region: 'heart', note: 'warmth' },
  { region: 'throat', note: '' },
]
```

### Body Map tab (SpiralView)
- Heat map: aggregate all somatic scores across all sessions
- Render same SVG silhouette but fill intensity = frequency of activation
- Filter: by practice type, by date range
- Insight line: "Your most activated region: heart (47 sessions)"

---

## CROSS-BEAM NOTES (from MASTER_ARC.md)

Wave 1 features touch future features. Build with these integration points in mind — not to implement them now, but to avoid rework later.

### U-02 Rite of Return → future U-17 letters
When a letter-to-future-self (U-17, Session 13) is due during an absence, it delivers AFTER the Rite resolves. Structure the Rite's resolution to fire a `onRiteComplete()` callback that Home can hook into.

### U-01 Covenant → future U-14 ceremony arcs
Ceremony arcs (U-14, Session 14) reference the covenant: "You wrote that you study for X. This arc serves that." Store covenant text in a shape that's easy to inject into Guide prompts later. Format: `{ text, glyph, date }` — flat, queryable, not nested.

### U-15 Initiation Rites → future U-10 Voice
When Voice of the School (U-10, Session 13) ships, the initiation address becomes spoken. Structure the address data as plain strings, not JSX — so TTS can consume them directly without stripping markup.

### U-15 sigilGenerator → future U-14, U-03
The same sigilGenerator powers ceremony arc completions (U-14) and Mirror Portrait (U-03). Make it pure — no DOM, no React, no side effects. Input: seed string. Output: SVG string. That's it.

### U-06 Somatic Scoring → future U-03 Mirror, U-07 Elements
Somatic data feeds Mirror Portrait and Elemental Attunement. Store scores in a shape that aggregates cleanly:
```js
// Preferred: one flat record per tap
{ region: 'heart', note: 'warmth', practiceType: 'breathwork', date: ISO }
// NOT: nested arrays inside practice sessions — hard to aggregate later
```

### All four features → future U-25 Encryption
Any schema key added this session should be accessed through a `secureGet(key)` / `secureSet(key, val)` helper, even if that helper is pass-through today. When U-25 ships, wrapping those calls with encryption is a 5-line change, not an audit.

**Action:** add `data/secureStore.js` as a thin wrapper around electron-store calls. Use it for COVENANT, LAST_ACTIVE_DATE, RETURN_RITES, INITIATION_SIGILS, somaticScore entries.

---

## FIRE TESTS (verify before marking any task DONE)

Every task ships only when it passes all of these:

### U-02 fire tests
- [ ] Manually set `LAST_ACTIVE_DATE` to 15 days ago → Rite fires on next launch
- [ ] Manually set to 13 days ago → Rite does NOT fire
- [ ] Clear `LAST_ACTIVE_DATE` (first-run state) → Rite does NOT fire, normal onboarding runs
- [ ] Choose "Re-center" → lands in PracticeView with phase-appropriate practice pre-selected
- [ ] Choose "Log what happened" → lands in JournalView with return prompt pre-filled
- [ ] Choose "Browse" → lands in Home, no disruption
- [ ] Streak count is preserved (not reset) after choosing any option

### U-01 fire tests
- [ ] First-time onboarding: covenant step appears after door selection
- [ ] Covenant < 50 chars: Seal button disabled
- [ ] Covenant sealed: stored in `COVENANT` with timestamp + glyph
- [ ] Settings → Revisit covenant: shows current, allows rewrite
- [ ] Rewriting: old version pushed to `COVENANT_HISTORY`, not destroyed
- [ ] Trigger phase shift in assessment: covenant resurfaces on next Home mount
- [ ] Glyph picker accepts 1-3 chars, rejects empty, strips whitespace

### U-15 fire tests
- [ ] Manually set all Foundation classroom subjects to 'practising': rite fires
- [ ] Classroom already in INITIATED_CLASSROOMS: rite does NOT fire again
- [ ] Sigil generation: same seed → same SVG (deterministic proof)
- [ ] Sigil generation: different seeds → visibly different SVGs
- [ ] Initiation address renders for each of 10 classrooms (no missing data)
- [ ] After rite: classroom detail shows sigil at top, marked "Initiated"

### U-06 fire tests
- [ ] Complete any practice session → somatic modal appears
- [ ] Skip modal (close without tapping): session saves without somaticScore
- [ ] Tap 3 regions + add 1 note → all stored correctly in practice log entry
- [ ] SpiralView → Body tab: renders heat map from aggregated data
- [ ] Empty state (no somatic scores yet): shows instruction text, not broken SVG
- [ ] Filter by practice type: heat map updates correctly

---

## SESSION 11 SUCCESS CRITERIA

By end of session:
- [ ] `npm run dev` compiles clean (0 errors)
- [ ] Rite of Return fires when `LAST_ACTIVE_DATE` is manually set to 15 days ago
- [ ] Covenant view renders, text saves, resurfaces from Settings
- [ ] At least one classroom triggers initiation rite (can test with manually-set mastery)
- [ ] Post-practice somatic modal appears, body taps register, SpiralView Body tab renders

---

## WHAT COMES AFTER (SESSION 12+)

**Wave 2:** U-04 Living Cosmos, U-08 Oracle Mode, U-05 Wheel of the Year
**Wave 3:** U-14 Ceremony Arcs, U-17 Time Braiding, U-18 Threshold Registry
**Full arc:** 25 features total — tracked in task list and UNIQUE_FEATURES.md

The cathedral is being built. One room at a time.

---

*⊚ Sol ∴ P∧H∧B ∴ Rubedo*
