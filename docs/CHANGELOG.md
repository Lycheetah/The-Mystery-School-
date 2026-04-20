# Mystery School — Change Log

## Session 8 — 2026-04-19

### Features Built

**Task #33 — Sovereign Tier**
- `data/sovereign.js`: `checkSovereignCode()`, `SOVEREIGN_PERKS` (3 perks: unlimited guide, sovereign themes, personal glyph)
- `theme/colours.js`: Two new sovereign depth themes — Sol (pure gold) and Eclipse (electric void). Filtered from the theme picker unless sovereign is unlocked.
- SettingsView: Sovereign Tier section — locked state shows perk preview + code input; unlocked state shows active perks + personal glyph input (1–3 chars)
- GuideView: Loads `KEYS.SOVEREIGN_TIER` on mount; bypasses daily message limit and shows "∞ sovereign" counter when unlocked
- Unlock code: `SOVEREIGNTY-2026`

### Files Created This Session
```
data/sovereign.js
```

### Files Modified This Session
```
theme/colours.js              — SOL + ECLIPSE sovereign depth themes added
src/views/SettingsView.jsx    — sovereign state, helpers, section
src/views/SettingsView.css    — sovereign section styles
src/views/GuideView.jsx       — sovereign tier loaded, limit bypass wired
```

---

## Session 7 — 2026-04-19

### Features Built

**Task #23 — Guide + Council Launch Buttons on Subject Detail**
- StudyView: "Ask the Guide" and "Take to Council" buttons added to every subject detail panel (Foundation, Uncommon, Void rooms)
- Shell.jsx: `navigateTo(viewId, payload)` + `navPayload` state for cross-view pre-fill navigation
- GuideView: consumes `navPayload.prefill` — opens new conversation with subject pre-filled in input
- CouncilView: consumes `navPayload.prefill` — pre-populates subject search picker

**Task #24 — Age + Parental Mode System**
- `data/schema.js`: Added `AGE_MODE`, `PARENTAL_MODE`, `LOCALE` store keys
- SettingsView: Language, Age Mode (Child/Teen/Adult), Parental Mode sections
- Age mode adjusts Guide tone; Child automatically enables Parental Mode
- Parental Mode restricts Void Room content and strong shadow prompts (guard hooks ready)

**Task #25 — i18n Architecture**
- `engine/i18n.js`: `t(key)`, `setLocale(code)`, `getLocale()` — simple key-value system
- `data/locales/en.js`: ~50 English strings (nav, common, study, practice, journal, guide, settings)
- `data/locales/es.js`: ~50 Spanish translations
- `App.jsx`: loads saved locale on startup via `getStoreValue(KEYS.LOCALE)`
- Architecture ready for extension — plug in any locale file, wire `t()` to components

**Task #26 — Shadow Work Progression**
- PracticeView: 6-stage shadow progression system (Recognition → Witnessing → Confrontation → Reclamation → Integration → Embodiment)
- Stage panel appears in sidebar when Shadow Work domain filter is active
- Stage determined by shadow practice session count (from PRACTICE_LOG)
- Progress pips, current stage desc, next threshold shown
- ShadowPrompts: fires `onComplete` callback on session complete, increments count live

**Task #27 — Dream Journal with Symbol Tracking**
- `engine/dreamSymbols.js`: 15 Jungian archetypes, keyword extraction, frequency builder
- JournalView: extracts symbols on dream entry save, stores in entry.symbols
- Dream entry view: shows detected symbols with Jungian meanings
- List view (Dream filter): symbol frequency bar chart across all dream entries
- "Reflect with Guide" button on all journal entries (navigates to Guide with prefill)

**Task #28 — Lunar Phase Engine**
- `engine/lunar.js`: accurate lunar age + phase calculation from J2000 reference point
- 8 phases: New Moon through Waning Crescent with glyphs, illumination %, rhythm guidance
- HomeView: lunar phase widget added (after tarot card), showing current phase + rhythm recommendation

**Task #29 — Middle Tier Content (first batch)**
- 11 missing middle-layer subject articles written and inserted into SUBJECT_CATALOGUE.md:
  - Shamanic Journeying (Lower/Upper World)
  - Ancestral Healing Work
  - Sweat Lodge Ceremony
  - Tantra (Classical Hindu/Buddhist)
  - Maqamat — The Stations of the Soul
  - Sama — Sacred Movement & Whirling
  - Ceremonial Ritual Design
  - Fire Ceremony
  - 5Rhythms (Gabrielle Roth)
  - Authentic Movement Practice
  - AI-Assisted Creativity
- Catalogue now at ~274 article headings

**Task #30 — Journal → Guide Context Wiring**
- JournalView: accepts `onNavigateTo` prop, "Reflect with Guide" button on all entries
- GuideView: loads journal summary on mount (entry count, type breakdown, recent 7-day activity)
- `engine/guide.js`: `buildGuideSystemPrompt` accepts 4th param `journalContext`
- `buildJournalSection()`: privacy-safe metadata section (counts only, never content)
- Guide now knows: total entries, recent activity, whether dreams/shadow work are present

---

### Files Created This Session
```
engine/lunar.js
engine/dreamSymbols.js
engine/i18n.js
data/locales/en.js
data/locales/es.js
docs/CHANGELOG.md         ← this file
docs/ARCHITECTURE.md
```

### Files Modified This Session
```
data/schema.js            — 3 new KEYS: AGE_MODE, PARENTAL_MODE, LOCALE
src/App.jsx               — i18n locale load on startup
src/views/SettingsView.jsx — Language, Age Mode, Parental Mode sections + helpers
src/views/SettingsView.css — age mode grid, row, chip styles
src/views/PracticeView.jsx — shadow stage panel, SHADOW_STAGES constant, onComplete callback
src/views/PracticeView.css — shadow stage panel CSS
src/views/JournalView.jsx  — dream symbol extraction, frequency panel, Reflect with Guide
src/views/JournalView.css  — dream symbol block, frequency panel CSS
src/views/HomeView.jsx     — lunar phase import + widget JSX
src/views/HomeView.css     — lunar card CSS
src/views/GuideView.jsx    — journal context loading, navPayload consumption wired
src/views/CouncilView.jsx  — navPayload consumption (subject search pre-fill)
engine/guide.js            — journalContext param, buildJournalSection()
curriculum/SUBJECT_CATALOGUE.md — 11 new middle-tier articles
```

---

## Session 6 — 2026-04-18

### Features Built
- All 19 Uncommon Room subject articles written
- All 31 Void Room subject articles written
- ACT VII Opening Ceremony (`SessionCeremony.jsx`) — breath cycle + intention
- ACT VII Closing Ceremony — phase-specific closing lines, 3.5s delay before close
- Door Crossing Ritual in Settings — confirm → intention → sealed, permanent record
- Door Crossings codex in SpiralView (Journey tab)
- Guide Memory Manager in Settings (InsightManager component)
- Study History wiring: Guide prompt now includes recent subjects completed
- Guide conversation multi-session (sidebar, search, delete)
- TitleBar close → custom event → Shell ceremony → appBridge.close()

---

## Session 5 and Prior

See `memory/project_mystery_school.md` for prior session history.
