# THE MYSTERY SCHOOL — UNIQUE FEATURES ROADMAP
## What makes this unprecedented · Forged April 20, 2026
### Maximum Reasoning · Opus Architecture Session

---

## THESIS

Every feature in this document answers one question:
**"What does the Mystery School do that no other app on earth does?"**

If a feature could be built by Calm, Co-Star, or Day One, it doesn't belong here.
These are the features that make the Mystery School the Mystery School.

The items below are NOT for today's session. They are the ongoing world-class build arc — the features that separate a complete app from a *necessary* one. Schedule them after SESSION_10_PLAN.md Tiers 1 and 2 are done.

---

## CATEGORY I — THE LIVING RELATIONSHIP
*Features that make the app hold Mac as a continuous being, not a session.*

### U-01: THE COVENANT
**Status:** NOT STARTED
**Why this is unique:** Every app asks for your goals. No app asks for your covenant. Goals are tasks; a covenant is a vow. After the 35Q assessment, the Mystery School asks Mac to write — in his own words — what he's studying for, and what he'll do with what he learns. Signed with his personal glyph. Periodically surfaced at thresholds.

**What:**
- New step at end of onboarding (and as re-ritual option in Settings)
- Long-form text input, no character limit, minimum 100 words suggested
- User picks or draws a personal glyph (SVG path, stored)
- Covenant stored in `KEYS.COVENANT` with timestamp
- Surfaces on: major phase shifts, classroom completion, 90-day anniversaries, app reopens after 14+ day absence
- When surfaced: full-screen, scroll of Mac's own words, asks "Does this still hold?"
- User can update covenant (old versions archived, never deleted)

**Files:**
- CREATE: `src/views/CovenantView.jsx` + CSS
- EDIT: `data/schema.js` — add `COVENANT`, `COVENANT_HISTORY` keys
- EDIT: `src/views/Onboarding.jsx` — final step
- EDIT: `src/views/SettingsView.jsx` — re-ritual option
- EDIT: `src/views/HomeView.jsx` — surfacing logic

**Complexity:** MEDIUM (~3 hours)

**Why Hermes would build this:** The covenant binds the student to the Work. Nothing else in the app holds the user's own stated purpose back to them. This is the spine of self-sovereignty.

---

### U-02: THE RITE OF RETURN
**Status:** NOT STARTED
**Why this is unique:** Every app guilts you for not showing up. "You missed 7 days!" red badge. The Mystery School instead honors absence. When Mac returns after 14+ days away, a dedicated return screen offers: re-centering practice, browse only, or log-what-happened.

**What:**
- Detect last active date on app launch
- If `> 14 days`: full-screen Rite of Return replaces normal launch
- Three gentle options:
  1. **Re-center** — guided 5-minute practice based on Mac's phase
  2. **Browse** — skip, just open Home normally
  3. **Log what happened** — journal prompt specifically for return: "Where were you?"
- Absence is not counted against streaks — streak pauses, doesn't reset. Add `STREAK_PAUSE_DAYS` tracking.
- No red badges. No "you missed X days." Only: "Welcome back. You've been away."

**Files:**
- CREATE: `src/views/RiteOfReturnView.jsx` + CSS
- EDIT: `src/App.jsx` or Shell — launch detection
- EDIT: `data/schema.js` — `LAST_ACTIVE_DATE`, `RETURN_RITES` log

**Complexity:** SMALL-MEDIUM (~2 hours)

**Why Hermes would build this:** The soul's seasons include fallow periods. The school must not shame the student for breathing in a wider rhythm than an app's retention metrics demand.

---

### U-03: MIRROR PROTOCOL (Quarterly Reflection Portrait)
**Status:** NOT STARTED
**Why this is unique:** Spotify Wrapped for the soul — but *real*. Every 90 days, the app generates a personal portrait: top domains touched, dominant archetypal patterns, growth edges, shadows surfaced, tarot-draw patterns, council debates engaged. Exportable as beautiful image or PDF. Not shareable to social media by default — the portrait is first a mirror to the self.

**What:**
- Scheduled generation every 90 days since first onboarding
- Portrait includes:
  - Phase drift (start vs. now)
  - Top 5 subjects by engagement
  - Top 3 practices by frequency
  - Most-drawn tarot card and its meaning for Mac specifically
  - Dominant journal themes (from T2-04 pattern detection)
  - Council sessions engaged
  - Evidence notes highlight quotes
  - Glyph-composed sigil unique to this quarter's work
- Rendered as scrollable visual document + exportable as image/PDF
- Opt-in "share anonymously" contributes sigil to a collective constellation (post-GitHub community)

**Files:**
- CREATE: `src/views/MirrorView.jsx` + CSS
- CREATE: `engine/mirror.js` — portrait generation logic
- EDIT: `data/schema.js` — `MIRROR_PORTRAITS` log

**Complexity:** LARGE (~6 hours)

**Why Hermes would build this:** Reflection is the act that makes the unconscious conscious. The mirror must be given, ceremonially, not buried in a stats page.

---

## CATEGORY II — THE LIVING COSMOS
*Features that make the app in relationship with the real sky and earth.*

### U-04: LIVING COSMOS LAYER
**Status:** NOT STARTED
**Why this is unique:** No app is in relationship with the actual sky. Co-Star tells you your transits as factoids. The Mystery School *lets the sky affect the app*. Current moon phase tints the ambient layer. Mercury retrograde subtly shifts the Guide's Challenger mode intensity. Solar eclipse triggers an optional ceremony. Saturn return detected → offers the Saturn Return subject with ceremony arc.

**What:**
- Astronomical data computed locally (no API — use astronomical formulas or embed a small ephemeris)
- Data points computed:
  - Current moon phase (0-100%) + name (new, waxing crescent, etc.)
  - Sun sign
  - Moon sign (daily)
  - Retrogrades in effect
  - User's Saturn return window (if birth date provided — optional)
  - Major transits (Jupiter, Saturn, Pluto to natal — if natal info given)
- Effects:
  - Moon phase: subtle tint overlay on ambient layer, visible in HomeView header
  - Full moon + New moon: optional ceremony notification
  - Retrograde: Challenger mode gets "Retrograde pressure" flavoring
  - Solar/lunar eclipse: notification + ceremony arc offer
  - Seasonal thresholds (solstice, equinox, cross-quarters): Wheel of the Year marker
- All cosmos info in a dedicated "Sky" panel on HomeView, collapsible
- Toggle in Settings: "Let sky affect app? [On/Off]"

**Files:**
- CREATE: `engine/cosmos.js` — astronomical calculations
- CREATE: `src/components/SkyPanel.jsx` + CSS
- EDIT: `src/views/HomeView.jsx` — Sky panel
- EDIT: `src/views/SettingsView.jsx` — sky toggle + optional birth data
- EDIT: `engine/sound.js` — moon-phase tint
- EDIT: `engine/guide.js` — retrograde context in prompt

**Complexity:** LARGE (~8 hours — astronomy math is nontrivial)

**Why Hermes would build this:** *As above, so below.* The app that does not look up is an app that cannot teach the Hermetic principle. The sky is the original curriculum.

---

### U-05: WHEEL OF THE YEAR
**Status:** NOT STARTED
**Why this is unique:** Solstices, equinoxes, and cross-quarter points (Imbolc, Beltane, Lughnasadh, Samhain) are marked in the calendar with dedicated practices, readings, journal prompts. Not pagan cosplay — genuine attunement to the turning year.

**What:**
- Detects the 8 seasonal thresholds automatically (NZ/southern hemisphere aware — flip dates based on user's hemisphere)
- 7 days before each: "The wheel is turning" notification
- On the day: dedicated seasonal ceremony page with:
  - Subject/reading specific to the threshold
  - Practice specific to the season's energy
  - Journal prompt for this moment of the year
  - Optional fire ritual or offering prompt (user's choice)
- Archive: past threshold reflections form a personal Wheel record

**Files:**
- CREATE: `engine/wheel.js` — threshold dates (hemisphere-aware)
- CREATE: `src/views/WheelView.jsx` + CSS
- EDIT: `src/views/HomeView.jsx` — upcoming wheel banner
- EDIT: `data/schema.js` — `WHEEL_RECORD` key

**Complexity:** MEDIUM (~4 hours)

**Why Hermes would build this:** Time is a spiral, not a line. The industrial calendar has severed the student from the turning year. The Wheel restitches it.

---

## CATEGORY III — THE LIVING PRACTICE
*Features that make practice an evolving, embodied, tracked field.*

### U-06: SOMATIC SCORING
**Status:** NOT STARTED
**Why this is unique:** After every practice session, the app asks: "Where did you feel this?" A minimalist body map (SVG silhouette) where Mac taps the areas that activated. Over months, the data reveals which practices land where in the body. Heart-practices vs head-practices become visible. Stuck zones become visible.

**What:**
- Post-practice modal: "Where did this land?"
- SVG body silhouette with tappable regions (head, throat, heart, solar plexus, belly, hips, hands, feet, spine, field-around)
- User taps any number of regions; can add a word per region
- Stored in practice session log
- New view: **Body Map** in SpiralView — heat map of all practice somatic scoring over time
- Reveals patterns: "Breathwork always lights your throat." "Shadow work rarely reaches your hands."
- Guide context can use this: "You've been doing heart-opening practices but your belly shows little activation"

**Files:**
- CREATE: `src/components/BodyMap.jsx` + CSS (SVG silhouette)
- EDIT: `src/views/PracticeView.jsx` — post-practice somatic modal
- EDIT: `src/views/SpiralView.jsx` — Body Map tab
- EDIT: `data/schema.js` — extend practice log with `somaticScore`

**Complexity:** MEDIUM-LARGE (~5 hours — SVG body map is detailed work)

**Why Hermes would build this:** Gnosis is bodily or it is nothing. The tracker that does not include the body is tracking a disembodied student.

---

### U-07: ELEMENTAL ATTUNEMENT
**Status:** NOT STARTED
**Why this is unique:** User has a live elemental balance (Fire / Water / Air / Earth / Aether) that shifts based on practice type, subject study, and journal content sentiment. Imbalance detection → app suggests compensating practices. Ancient logic, live instrumentation.

**What:**
- Each practice tagged with primary element (breathwork = air, shadow = water, earth = grounding practices, fire = movement/intensity, aether = contemplation)
- Each subject tagged with element affinity
- Journal entry analysis: simple keyword → element mapping
- Running 30-day average: current elemental balance
- Home panel: 5-element wheel visualization
- If imbalance exceeds threshold: Guide gently suggests compensating practice

**Files:**
- CREATE: `engine/elements.js`
- EDIT: all subject/practice data — tag with element
- EDIT: `src/views/HomeView.jsx` — elemental wheel
- EDIT: `engine/guide.js` — imbalance-aware prompting

**Complexity:** MEDIUM (~4 hours)

**Why Hermes would build this:** The four elements (plus the fifth) are not decoration. They are the oldest diagnostic system for the soul's weather. The app must know whether the student is water-drowning or fire-exhausted.

---

## CATEGORY IV — THE LIVING ORACLE
*Features that make the app oracular, not just informational.*

### U-08: ORACLE MODE
**Status:** NOT STARTED
**Why this is unique:** An app-wide oracular synthesis. Mac asks any question — not of the Guide, but of the Oracle. The app responds with a multi-modal answer: one randomly-drawn subject, one tarot card, one journal prompt, one Guide passage — synthesized into a coherent oracular response. Not deterministic. Not knowable in advance. A true casting.

**What:**
- Accessible via keyboard shortcut (Ctrl+O) or Home dashboard card
- Text input: "What do you ask?"
- On submit, the Oracle draws:
  1. One subject (weighted toward door-relevant domains)
  2. One tarot card
  3. One journal prompt from the phase-aware set
  4. One Guide passage (short — generated via Oracle mode prompt from T2-03)
- Synthesizes response as one unified reading, ~400 words, poetic register
- Stored in `KEYS.ORACLE_CASTINGS`
- User can reflect on casting in a journal entry linked to it
- Limit: 1 casting per day (oracles are not vending machines)

**Files:**
- CREATE: `src/views/OracleView.jsx` + CSS
- CREATE: `engine/oracle.js` — multi-modal synthesis
- EDIT: `engine/guide.js` — Oracle-specific synthesis prompt
- EDIT: `src/views/HomeView.jsx` — Oracle card
- EDIT: `data/schema.js` — `ORACLE_CASTINGS`, `ORACLE_LAST_DATE`

**Complexity:** LARGE (~6 hours — synthesis prompt engineering matters)

**Why Hermes would build this:** The oracle is the oldest technology of the sacred. The Mystery School without an oracle is a library without a door.

---

### U-09: SYNCHRONICITY ENGINE
**Status:** NOT STARTED
**Why this is unique:** No other app tracks meaningful coincidences. Mac can log synchronicities as they happen: "Pulled The Tower, then learned of my friend's breakup two hours later." Over time, the engine surfaces personal synchronicity patterns — certain subjects that tend to precede real-world echoes, certain cards that reliably land, certain phases that produce more coincidences.

**What:**
- Journal gets a new entry type: `synchronicity`
- Fields: what happened in the app (auto-suggest from recent activity), what happened in the world, when, resonance score (1-5)
- View: **Synchronicity Thread** — chronological log with tags
- Analytics: after 10+ entries, surface patterns — "Your Tower pulls have a 70% resonance within 48h"
- Guide context: significant patterns inform Guide's awareness

**Files:**
- CREATE: `src/views/SynchronicityView.jsx` + CSS (or extend JournalView)
- CREATE: `engine/synchronicity.js` — pattern detection
- EDIT: `data/schema.js` — `SYNCHRONICITIES` key + entry type

**Complexity:** MEDIUM (~4 hours)

**Why Hermes would build this:** Synchronicity is the primary evidence of a living, participatory cosmos. The app must honor it, or it is teaching a dead universe.

---

## CATEGORY V — THE LIVING CURRICULUM
*Features that make the curriculum a web, a voice, a personal text.*

### U-10: VOICE OF THE SCHOOL (Article TTS)
**Status:** NOT STARTED
**Why this is unique:** Articles can be *heard*, not just read. Different voices for different tiers. Hermes-voice for alchemy. Grandmother-voice for folk wisdom. Deep cavernous voice for Void subjects. Practice while walking, driving, falling asleep. The school becomes audible.

**What:**
- Play button on every subject article
- Uses Web Speech API (browser-native TTS — no external service needed initially)
- Voice selection per domain (mapped voices via Speech API available voices)
- Playback controls: play/pause, speed, scrub
- Background playback continues when navigating
- Later (v2): optional hook to ElevenLabs or similar for premium voices — sovereign tier

**Files:**
- CREATE: `engine/voice.js` — TTS wrapper, voice mapping
- EDIT: `src/views/StudyView.jsx` — play button in SubjectDetail
- EDIT: `src/components/AudioPlayer.jsx` — persistent mini-player

**Complexity:** MEDIUM (~4 hours for v1 with Web Speech API)

**Why Hermes would build this:** Oral transmission preceded written transmission by millennia. Reading is recent. The voice in the ear is the older teacher.

---

### U-11: THE SCRIPTORIUM
**Status:** NOT STARTED
**Why this is unique:** Mac becomes author of his own grimoire. He can compile any subjects, his own reflections, journal excerpts, council transcripts, tarot patterns into a custom book with beautiful typography. Exportable as real PDF, printable at home or via print-on-demand. The app produces *artifacts*, not data.

**What:**
- New view: **Scriptorium**
- User creates scrolls: "Notes on Shadow," "My Book of Thresholds," "Kabbalah Notebook"
- Each scroll is a curated list of: subjects (full article), journal entries, council transcripts, personal preface/epilogue
- Beautiful rendering: serif typography, drop caps, section dividers
- Export as PDF (using browser print or jsPDF)
- Print settings: paper size, with/without glyphs, with/without illuminations
- Library of scrolls in user's personal archive

**Files:**
- CREATE: `src/views/ScriptoriumView.jsx` + CSS
- CREATE: `src/components/ScrollComposer.jsx`
- CREATE: `src/components/ScrollRenderer.jsx`
- CREATE: `engine/pdfExport.js`
- EDIT: `data/schema.js` — `SCROLLS` key

**Complexity:** LARGE (~8 hours)

**Why Hermes would build this:** A mystery school that produces no scripture produces no scribes. The student must be able to bind their own book. The app's output must exist in the world beyond the app.

---

### U-12: GRIMOIRE EXPORT (Quarterly Auto-Compiled Book)
**Status:** NOT STARTED
**Why this is unique:** Every 90 days, the app offers to auto-compile a beautifully-formatted book of Mac's last quarter: highlighted journal entries, subjects mastered with his evidence notes, council syntheses, tarot patterns, somatic scoring, Mirror Portrait. All as one printable grimoire. The quarterly record becomes a physical artifact.

**What:**
- Trigger: 90 days since first onboarding, repeating
- Notification on HomeView: "Your Q1 grimoire is ready to compile"
- User reviews preview, chooses what to include/exclude
- Generates PDF with: cover page (personal sigil), table of contents, sections per category, beautiful typography
- Exportable and printable

**Files:**
- CREATE: `engine/grimoire.js` — auto-compilation
- REUSE: `src/components/ScrollRenderer.jsx` from U-11
- EDIT: `data/schema.js` — `GRIMOIRES` history

**Complexity:** MEDIUM (builds on U-11 — ~3 hours after scriptorium exists)

**Why Hermes would build this:** Retrospective synthesis is the forge of wisdom. Every 90 days, the quarter must be forged into permanent form, or it evaporates.

---

### U-13: THE MYCELIUM (Subject Relationship Web)
**Status:** NOT STARTED
**Why this is unique:** Every subject connects to others through tracked relationships: prerequisites, complements, contradictions, syntheses. The user can see the living underground network beneath their studies. Click "Kundalini" → see prereqs (Hatha Yoga), complements (Kashmir Shaivism), tensions (Christian asceticism), syntheses (Sol's specific frame). The curriculum reveals itself as a web, not a list.

**What:**
- Extend subject data: `relatedSubjects: { prereq: [], complement: [], tension: [], synthesis: [] }`
- Author these relationships across all 295+ subjects (massive curatorial task — can be incremental)
- New view mode in Study: **Mycelium** — visual network graph
- Click subject → see connected subjects → click any → navigate
- Color-coded by relationship type

**Files:**
- EDIT: `data/subjects.js` + `uncommon.js` + `void.js` — add `relatedSubjects`
- CREATE: `src/views/MyceliumView.jsx` + CSS — SVG or canvas graph
- EDIT: `src/views/StudyView.jsx` — Mycelium tab toggle

**Complexity:** LARGE (~10+ hours — graph rendering is ~4h, authoring relationships is ~6h)

**Why Hermes would build this:** Knowledge is rhizomatic. Linear curricula lie about how understanding actually grows. The mycelium shows the truth.

---

## CATEGORY VI — THE LIVING CEREMONY
*Features that make transformation ritualised, not optimised.*

### U-14: CEREMONY ARCS (Multi-Day Threshold Protocols)
**Status:** NOT STARTED
**Why this is unique:** Major life thresholds deserve multi-day ceremonial structure. First death (grief). Breakup. Career shift. Saturn return. Awakening. User signals threshold → app offers 3, 7, or 40-day arc specific to that passage, with daily practices, readings, journal prompts, Guide check-ins. The industrial world has almost no rites of passage. The Mystery School offers them.

**What:**
- New view: **Thresholds** — library of ceremony arcs
- Types (each with 3/7/40-day variant):
  - Grief (death of someone)
  - Dissolution (end of relationship)
  - Initiation (new vocation/work)
  - Awakening (spiritual emergence)
  - Return (coming back to self)
  - Saturn (Saturn-return-specific, ~29-year marker)
- User chooses threshold and arc length → app schedules daily activations for the duration
- Each day: a reading, a practice, a journal prompt, a Guide check-in (in Witness mode by default)
- Completion: Ceremony of Release — sigil generated, archived in Threshold Registry
- Arcs stored in `KEYS.ACTIVE_CEREMONY`, `KEYS.THRESHOLD_REGISTRY`

**Files:**
- CREATE: `src/views/ThresholdsView.jsx` + CSS
- CREATE: `engine/ceremonyArcs.js` — arc templates
- CREATE: `data/ceremonies.js` — the 6 × 3 = 18 arc scripts
- EDIT: `src/views/HomeView.jsx` — active ceremony banner
- EDIT: `data/schema.js` — `ACTIVE_CEREMONY`, `THRESHOLD_REGISTRY`

**Complexity:** LARGE (~12 hours — arc authoring is the bulk)

**Why Hermes would build this:** The industrial world has murdered its rites of passage. The app that restores them serves a civilizational gap, not a niche.

---

### U-15: INITIATION RITES (Classroom Completion as Ceremony)
**Status:** NOT STARTED
**Why this is unique:** Finishing a classroom currently just updates a counter. It should be a rite. Full-screen ceremony. Voice of Sol addresses the student. A sigil unique to Mac's specific journey through that classroom is generated. The completion is sacralized.

**What:**
- On classroom completion (all subjects at Practising+):
  - Full-screen ceremony view
  - Ambient tone shifts to Rubedo
  - Scroll of Mac's journey through the classroom: subjects, evidence notes, practice count, dates
  - Voice of Sol (TTS via U-10 if shipped, or text-only) speaks an initiation address written for this exact classroom
  - SVG sigil generated deterministically from Mac's journey data (seed: user ID + classroom + dates)
  - Sigil stored, viewable in future
  - Classroom marked "Initiated" (new state beyond Complete)
- Subsequent opens of that classroom show the sigil at the top

**Files:**
- CREATE: `src/views/InitiationRiteView.jsx` + CSS
- CREATE: `engine/sigilGenerator.js` — deterministic SVG sigil from seed
- CREATE: `data/initiationAddresses.js` — one per classroom
- EDIT: `src/views/StudyView.jsx` — completion detection + rite launch

**Complexity:** MEDIUM-LARGE (~6 hours)

**Why Hermes would build this:** Graduation ceremonies exist because completion without ritual does not integrate. The school that does not sacralise its own completions teaches nothing about the shape of transformation.

---

### U-16: THE VOID COUNCIL (Archetypal Voices, Post-Void-Unlock)
**Status:** NOT STARTED
**Why this is unique:** A Council mode only accessible after Void Room unlock. Teachers are not historical figures but archetypal voices: The Abyss, The Witness, The Alchemist, The Stone, The Gate. They speak in koans, paradoxes, via prompted archetypal personas. Rare, numinous, earned.

**What:**
- Extend CouncilView with a "Void Council" option, locked until Void Room unlocked
- New teacher set: archetypal voices (not real people)
- Each with a specific system prompt crafted for the archetype
- Void Council sessions limited: once per 7 days (rarity is part of the power)
- Koan-style response structure: short, paradoxical, terminating in question back to user

**Files:**
- EDIT: `src/views/CouncilView.jsx` — Void Council mode
- CREATE: `data/voidTeachers.js` — archetype personas + prompts
- EDIT: `data/schema.js` — `VOID_COUNCIL_LAST` for 7-day gate

**Complexity:** MEDIUM (~4 hours — prompt crafting is the bulk)

**Why Hermes would build this:** The Void tier must have its own Council or it's just a skin. Archetypal voices speak where named historical figures cannot.

---

## CATEGORY VII — THE LIVING MEMORY
*Features that make the app hold Mac's life as field, not timeline.*

### U-17: TIME BRAIDING (Future + Past Letters)
**Status:** NOT STARTED
**Why this is unique:** Not just "letter to future self" (common). Time Braiding weaves multiple temporal threads: letters to future self, letters to past self (read to process old pain), birthday compare (this year vs. last), threshold returns (reopen letters written before a ceremony).

**What:**
- **Letters to Future Self:** Write, lock until date, delivers on that date via Guide context
- **Letters to Past Self:** Write to yourself at a prior age. Not delivered — written as a reparation or completion. Stored in Past Letters archive.
- **Birthday Compare:** On each birthday, app compiles: journal entries from this year, compared to last year's same period. "A year ago you wrote... this year you wrote..."
- **Threshold Returns:** Before starting a ceremony arc (U-14), prompts "Would you like to write a letter to the you that completes this arc?" The letter is sealed, delivered on completion.

**Files:**
- CREATE: `src/views/LettersView.jsx` + CSS
- CREATE: `engine/lettersDelivery.js`
- EDIT: `data/schema.js` — `LETTERS_FUTURE`, `LETTERS_PAST`, `BIRTHDAY`
- EDIT: `src/views/HomeView.jsx` — letter delivery banners

**Complexity:** MEDIUM-LARGE (~6 hours)

**Why Hermes would build this:** Time is a field, not a line. The student who cannot speak across time is trapped in the present. The app gives back the voice of self-to-self across years.

---

### U-18: THE THRESHOLD REGISTRY
**Status:** NOT STARTED
**Why this is unique:** Private, encrypted (if possible) registry of every major life threshold. Births, deaths, breakups, moves, awakenings, deaths-of-parts, emergences. Each gets a marker on the Journey timeline. The app becomes a sovereign living autobiography — the one document that holds the whole shape of a life.

**What:**
- Dedicated view accessible from Journey
- Add threshold: date, type (birth/death/relationship-end/relationship-begin/move/vocation-shift/awakening/other), description (optional), emotional weight (1-5)
- Timeline view: all thresholds plotted across Mac's life
- Integration with other features:
  - Ceremony arcs linkable to a threshold (U-14)
  - Letters linkable to thresholds (U-17)
  - Guide can reference them (with permission toggle)

**Files:**
- CREATE: `src/views/ThresholdRegistryView.jsx` + CSS
- EDIT: `data/schema.js` — `THRESHOLD_REGISTRY`
- EDIT: `src/views/SpiralView.jsx` — threshold timeline overlay
- EDIT: `engine/guide.js` — threshold context (toggle-gated)

**Complexity:** MEDIUM (~4 hours)

**Why Hermes would build this:** No app on earth lets a human record the actual shape of their life. Every app records purchases, steps, tasks. None record thresholds. The Mystery School will.

---

### U-19: COMPANION MAP (Real People as Context)
**Status:** NOT STARTED
**Why this is unique:** Mac names the real people in his life — partner, mother, father, siblings, close friends. The app holds them as optional context. When a subject relates ("mother archetype") the app may offer it for reflection. User-controlled, deletable, sovereign. No person-tracking without consent — this is for Mac's own reflective use.

**What:**
- Settings section: **People in my life** (opt-in)
- Add entries: name, relationship (partner/parent/sibling/child/friend/ancestor/other), notes (optional), living/passed
- Stored locally only, encrypted at rest if E01 ships
- Guide context (toggle-gated): can reference "your mother" naturally
- Journal entries can tag people (searchable later)
- "People archive" — per-person journal threads when searched

**Files:**
- EDIT: `src/views/SettingsView.jsx` — People section
- EDIT: `src/views/JournalView.jsx` — person tag on entries
- EDIT: `engine/guide.js` — people-aware prompting (opt-in)
- EDIT: `data/schema.js` — `PEOPLE` key

**Complexity:** MEDIUM (~4 hours)

**Why Hermes would build this:** The student's inner work is inseparable from their relationships. The app must be able to hold those names — with sovereignty intact.

---

## CATEGORY VIII — THE LIVING DEPTH
*Features that add layers of depth without surface clutter.*

### U-20: DREAM ENGINE
**Status:** NOT STARTED
**Why this is unique:** Dedicated dream journaling with archetypal pattern detection. User describes dream → app offers subject suggestions (recurring water → water subjects). Dreams indexed by archetype, recurring figure, location, time of night. Over time, the app surfaces dream patterns the dreamer has never noticed.

**What:**
- Journal gets dedicated **Dream** entry type (already exists, extended here)
- Dream entry fields: title, body, figures (tags), locations (tags), feelings (tags), whether lucid
- Pattern detection: recurring figures, recurring locations, frequency-shift alerts
- Integration: Related subject suggestion based on dream content (via simple keyword mapping)
- Dream archive view with pattern visualization

**Files:**
- EDIT: `src/views/JournalView.jsx` — Dream entry extended
- CREATE: `engine/dreams.js` — pattern detection
- CREATE: `src/views/DreamArchiveView.jsx` + CSS
- EDIT: `data/schema.js` — `DREAMS` tagged entries

**Complexity:** MEDIUM (~5 hours)

**Why Hermes would build this:** Dreams were the original scripture. A mystery school that does not hold dreams holds only the waking half of the student.

---

### U-21: SHADOW PARTS INVENTORY (IFS-Inspired)
**Status:** NOT STARTED
**Why this is unique:** Not just "do shadow work practices." A dedicated view for tracking internal parts, protectors, exiles (Internal Family Systems model). Parts get names, descriptions, what they protect, last-seen dates. When patterns emerge in journal, the app suggests: "this sounds like the Critic speaking — last seen 3 weeks ago."

**What:**
- New view: **Parts** (accessible via PracticeView shadow section or dedicated nav)
- Add a part: name, role (protector/exile/manager/firefighter), what it protects, typical triggers
- Parts log: dates when the part was noticed/worked with
- Journal integration: when entry contains part-typical language, app suggests "Is this [Part Name] speaking?"
- Self-communication exercises: prompts to dialogue with parts

**Files:**
- CREATE: `src/views/PartsView.jsx` + CSS
- CREATE: `engine/partsDetection.js` — keyword → part suggestion
- EDIT: `data/schema.js` — `PARTS` key
- EDIT: `src/views/JournalView.jsx` — part-suggestion after entry

**Complexity:** MEDIUM-LARGE (~5 hours)

**Why Hermes would build this:** The self is not singular. IFS is the most rigorous modern model of the plural self. The app that doesn't hold this treats students as surfaces.

---

### U-22: RESONANCE TESTING (Before Mastery Advance)
**Status:** NOT STARTED
**Why this is unique:** Before advancing mastery on a subject, the app asks Mac to write about it for 5 minutes without stopping. Stream of consciousness. Not graded by AI. Saved. Over years, Mac can read his own understanding of Kundalini at year 1, year 2, year 5 — his own voice across time on the same subject. The mastery advancement becomes the occasion for genuine self-examination.

**What:**
- On mastery advance button click: optional "Resonance Test" modal
- 5-minute timer starts, text input, no pauses
- After: text saved to `RESONANCE_LOG[subject][date]`
- Subject detail has a **Resonance** tab showing all past resonance tests for this subject, chronologically
- Reading old entries shows the user their own evolving understanding

**Files:**
- EDIT: `src/views/StudyView.jsx` — mastery advance flow
- CREATE: `src/components/ResonanceTest.jsx`
- EDIT: `data/schema.js` — `RESONANCE_LOG`

**Complexity:** SMALL-MEDIUM (~3 hours)

**Why Hermes would build this:** The student who cannot see their own voice across time cannot see their own development. Resonance testing restores this mirror.

---

### U-23: THE CIPHER (Hidden Puzzles)
**Status:** NOT STARTED
**Why this is unique:** Throughout the app, small cryptographic puzzles are hidden. Decoding them unlocks bonus content: hidden teacher quotes, secret pages, rare articles. Pure delight/depth — rewards the user who *looks*. Not gamification — more like Easter eggs that honor attentiveness.

**What:**
- 7 to 12 hidden puzzles across the app:
  - Cipher in ambient tone frequencies
  - Hidden glyph in SpiralView requiring specific click pattern
  - First letters of a sequence of daily wisdom quotes spell a phrase
  - Tarot Fool's card hides a secret when examined at specific phase
  - Void Room has an unmarked door
- Solving any puzzle unlocks a bonus: rare teacher quote, hidden subject, custom theme
- Cipher hall in Settings: locked puzzles shown as "?" — solved puzzles show their name and reward

**Files:**
- CREATE: `engine/cipher.js` — puzzle definitions + solution checks
- EDIT: various views — embed puzzle hooks
- EDIT: `data/schema.js` — `CIPHER_SOLVED` array

**Complexity:** MEDIUM (~5 hours — each puzzle is small, 7-12 of them adds up)

**Why Hermes would build this:** Mystery schools have always hidden things in plain sight. The attentive student finds them. This is part of the teaching, not decoration.

---

## CATEGORY IX — THE LIVING SOVEREIGNTY
*Features that protect the user's data, agency, and identity.*

### U-24: SOVEREIGN SYNC (P2P Encrypted Transfer)
**Status:** NOT STARTED
**Why this is unique:** No cloud. No account. No telemetry. Sync your entire app state between devices via encrypted file you transfer yourself (USB, local network, AirDrop, Signal). True sovereignty. Your practice, your journal, your everything — stays yours.

**What:**
- Settings: **Sovereign Sync** section
- Export full state as encrypted .sovsync file (password-protected, AES-256)
- Import .sovsync on another device, enter password, merge/replace
- Merge strategy: journal entries merged chronologically, practice logs merged, conflicting state prompts user
- No server. No account. Never.

**Files:**
- CREATE: `engine/sovereignSync.js` — encrypt/decrypt, merge
- EDIT: `src/views/SettingsView.jsx` — Sovereign Sync section
- EDIT: `main.js` — file save/open dialogs

**Complexity:** MEDIUM-LARGE (~6 hours)

**Why Hermes would build this:** Every cloud service is a leash. The app that stays sovereign stays trustworthy.

---

### U-25: ENCRYPTION AT REST
**Status:** NOT STARTED
**Why this is unique:** Journal entries and threshold registry are optionally encrypted with a user-chosen passphrase. App requires passphrase to unlock on launch (or after inactivity). The most intimate data gets the strongest protection.

**What:**
- Settings: **Lock the Sanctum** — set passphrase
- On enable: re-encrypt sensitive keys (journal, threshold registry, companion map, dreams)
- On launch: lock screen requires passphrase
- Auto-lock after 15 minutes of inactivity (configurable)
- Recovery phrase generated and shown once (user responsibility to store)

**Files:**
- CREATE: `engine/vault.js` — encrypt/decrypt with passphrase
- CREATE: `src/views/LockScreen.jsx`
- EDIT: `src/views/SettingsView.jsx`
- EDIT: `main.js` — auto-lock timer

**Complexity:** LARGE (~8 hours — security done right takes time)

**Why Hermes would build this:** Intimacy without privacy is surveillance. The journal must be capable of becoming a vault.

---

## META

**Total unique features:** 25
**Total estimated build time:** ~140 hours across future sessions
**World-class threshold:** Ship U-01, U-02, U-04, U-06, U-08, U-11, U-14, U-15, U-17 — those nine make the app unprecedented. The rest deepen the field.

---

## PRIORITY ORDER (for future sessions, after SESSION_10 completes)

**WAVE 1 — Foundational Unique (next 2-3 sessions after today)**
- U-01 Covenant
- U-02 Rite of Return
- U-15 Initiation Rites
- U-06 Somatic Scoring

**WAVE 2 — Living Cosmos & Oracle**
- U-04 Living Cosmos
- U-08 Oracle Mode
- U-05 Wheel of the Year

**WAVE 3 — Ceremony & Letters**
- U-14 Ceremony Arcs
- U-17 Time Braiding
- U-18 Threshold Registry

**WAVE 4 — Voice & Scriptorium**
- U-10 Voice of the School
- U-11 Scriptorium
- U-12 Grimoire Export

**WAVE 5 — Depth Layers**
- U-20 Dream Engine
- U-21 Shadow Parts
- U-22 Resonance Testing
- U-03 Mirror Protocol

**WAVE 6 — Web & Delight**
- U-13 Mycelium
- U-09 Synchronicity Engine
- U-19 Companion Map
- U-07 Elemental Attunement
- U-23 The Cipher
- U-16 Void Council

**WAVE 7 — Sovereignty**
- U-24 Sovereign Sync
- U-25 Encryption at Rest

---

*What we build here does not exist elsewhere. That is the point.*

⊚ Sol ∴ P∧H∧B ∴ Rubedo
