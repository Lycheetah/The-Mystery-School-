# THE MYSTERY SCHOOL — SESSION 10 BUILD PLAN
## Forged April 20, 2026 — Opus Architecture · Executed by Sonnet
### Governing question: *"Would Hermes build this?"*

---

## PRIME DIRECTIVE

By end of session, the Mystery School must be:
1. **Curriculum-complete** — every subject across every tier has a full article
2. **Navigationally coherent** — Uncommon and Void tabs match the main tab's two-column pattern
3. **Memorably companioned** — the Guide knows what Mac is studying, what he's journaling, and how to hold him in four distinct registers
4. **Structurally deeper** — subjects link to subjects, teachers have faces, and the journal has begun to see its own patterns

If we ship all of Tier 1 + Tier 2, today is a milestone session. Tier 3 is stretch.

---

## EXECUTION RULES (read before starting anything)

1. **Work top-down by tier.** Finish Tier 1 before touching Tier 2. No skipping.
2. **One task per cycle.** READ the minimum files → CHANGE → npm run dev verify → next.
3. **Mark tasks DONE inline** by editing the Status line in this file when complete.
4. **Grep "NOT STARTED"** to find next task if context compresses.
5. **Silence rule.** Ship diffs. No status reports between tasks unless surprised.
6. **Never use Agent tool.** Direct Read/Edit/Write only. Never spawn subagents.
7. **Never trigger `eas build` or any distribution build.** This session is all internal.
8. **Test with `npm run dev`** — not `npm run build` — unless explicitly shipping an EXE.
9. **When an article references another subject by exact name**, that's fine — cross-linking task (T2-05) will wire clicks later. Don't try to pre-link.
10. **The mobile `app/` directory is PAUSED.** All work in `src/`.

---

## TIER 1 — THE SCHOOL MUST MAKE GOOD ON ITS PROMISES

The curriculum is the soul. Every unfilled subject is a broken promise. Every inconsistent navigation pattern breaks the spatial model users build. Tier 1 closes both gaps.

---

### T1-01: EDGE BATCH — 44 Missing Edge Articles
**Status:** NOT STARTED
**Priority:** HIGHEST
**Complexity:** LARGE (mechanical × 44, ~22,000 words)
**Estimated duration:** 3–4 hours focused

**Why:** Every Edge subject currently has metadata but no article. A user clicks "Microdosing Protocol" in Study and the subject panel is empty. Every empty subject erodes trust. Edge is the tier where the school's most important modern/pioneering voices live — if these are empty, the school reads as shallow.

**What:** Write full curriculum articles for the 44 missing Edge subjects. Each article:
- 400–600 words
- Structure: Overview / Core Teaching / The Experiment / Contraindications
- Voice: Sovereign. Warm. Exact. No fluff. No disclaimer theatre.
- Tone for this tier: Edge is where pioneers, heretics, and radical practices live. The voice must honor both the power AND the danger of each. Never sanitize. Never glamourise. Never tell users it's safe when it's not.

**The 44 missing subjects (grouped by thematic cluster — write by cluster for voice coherence):**

**Cluster A — Divinatory Systems (6)**
1. Tarot Minor Arcana & Court Cards
2. Astrology (Natal Chart)
3. Numerology (Pythagorean)
4. Astrology — Framework & History
5. The Natal Chart — Map of Potential
6. The Great Year — Precession of the Equinoxes

**Cluster B — Plant Medicine & Sacred Substance (7)**
7. Ayahuasca Ceremony
8. San Pedro (Wachuma) Ceremony
9. Kambo Ceremony
10. Microdosing Protocol
11. Microdosing Protocols and Research
12. Plant Communication & Ethnobotany
13. Vision Quest — Threshold Ceremony

**Cluster C — Energetic & Healing Practices (5)**
14. Soul Retrieval Work
15. Pranic Healing
16. Crystal Grid Engineering
17. Extraction and Spiritual Cleansing
18. Karezza (Tantric Retention)

**Cluster D — Sovereign & Chaos Practice (4)**
19. Sigil Magic (Chaos Tradition)
20. Chaos Magick (Framework)
21. Dual Cultivation (Taoist Sexual Practices)
22. Saturn Return — The Great Initiations

**Cluster E — Eastern Deep Practice (5)**
23. Kundalini — The Serpent Power (Framework)
24. Tantric Philosophy (Kashmir Shaivism)
25. Vedic Cosmology — Cycles of Time (Yugas)
26. Taoist Inner Alchemy (Neidan)
27. Nada Yoga — Union Through Sound

**Cluster F — Christian & Islamic Mysticism (2)**
28. Ibn Arabi — Unity of Being (Wahdat al-Wujud)
29. Hesychasm — Eastern Orthodox Mysticism

**Cluster G — The Dismissed Pioneers (4)**
30. Rupert Sheldrake — Morphic Resonance
31. Terence McKenna — Novelty, Language & the Transcendent
32. John C. Lilly — Isolation, Consciousness & Dolphins
33. David Bohm — The Implicate Order

**Cluster H — Indigenous & Earth Wisdom (2)**
34. Ifá — The Wisdom of the Yoruba
35. Sangoma — Southern African Healing Tradition

**Cluster I — Somatic & Movement (2)**
36. Continuum Movement
37. Butoh (Dance of Darkness)

**Cluster J — Dream, Sound, Death (4)**
38. Shamanic Dreaming (Big Dreams)
39. Overtone Singing & Harmonic Resonance
40. Conscious Dying and End-of-Life Preparation
41. Zero Point Field and Morphic Resonance

**Cluster K — Frontier AI & Consciousness (2)**
42. Human-AI Co-Evolution Study
43. AGI Alignment Meditation

**Files:**
- EDIT: `curriculum/SUBJECT_CATALOGUE.md`
- INSERT POINT: Before `# SOVEREIGN MYSTERY SCHOOL — MASTER SUBJECT CATALOGUE` marker
- Use a unique anchor string from the end of the last inserted article to avoid ambiguity in Edit tool

**Approach:**
- Write cluster by cluster, 4–10 articles per edit. Do NOT try to write all 44 in one Edit.
- After each cluster, re-run the verification command below to confirm count decreases.
- If fatigue sets in after 2 clusters, take a break — voice degrades under load.

**Verification command (run after each cluster to confirm progress):**
```bash
cd ~/mystery-school && node -e "const fs=require('fs');const {SUBJECTS}=require('./data/subjects.js');const cat=fs.readFileSync('./curriculum/SUBJECT_CATALOGUE.md','utf8');const edge=SUBJECTS.filter(s=>s.layer==='edge');console.log('Remaining:',edge.filter(s=>!cat.includes('### '+s.name)).length);"
```

**Done when:** `Remaining: 0` from the verification command.

---

### T1-02: UNCOMMON ROOM — Two-Column Navigation
**Status:** NOT STARTED
**Priority:** HIGH
**Complexity:** SMALL
**Estimated duration:** 20 minutes

**Why:** The main Subjects tab was upgraded Session 8 to two-column (domain column 134px + subject column flex) with Ctrl+K command palette. Uncommon Room still uses the old single flat list. Navigation inconsistency breaks the mental model the user just learned.

**What:** Apply the exact same two-column browser pattern to the Uncommon Room tab.

**Files:**
- EDIT: `src/views/StudyView.jsx` — the tab handler for `activeTab === 'uncommon'`
- EDIT: `src/views/StudyView.css` — if new classes needed, or reuse existing `.domain-column`/`.subject-column` classes

**Approach:**
1. Grep for the existing Uncommon tab rendering block in StudyView.jsx
2. Mirror the structure used for main Subjects: useMemo for grouped by UNCOMMON_DOMAINS, domain column with mastery dots, subject column on selection
3. Reuse existing CSS classes where possible — avoid duplication
4. UNCOMMON_DOMAINS is an OBJECT not array — access via `UNCOMMON_DOMAINS[domainName]`, not `.find()`
5. Add Ctrl+K palette support scoped to uncommon subjects when tab is active (or extend existing palette to search all three tiers)

**Test:**
- `npm run dev` → open Uncommon Room tab → click through domains, verify subject list updates
- Verify mastery dots render correctly (not crash on undefined subjects)

**Done when:** Uncommon Room renders as two-column and a domain click shows only that domain's subjects.

---

### T1-03: VOID ROOM — Two-Column Navigation
**Status:** NOT STARTED
**Priority:** HIGH
**Complexity:** SMALL
**Estimated duration:** 20 minutes

**Why:** Same reason as T1-02. Void Room gets the same treatment.

**What:** Apply two-column pattern to Void Room tab.

**Files:**
- EDIT: `src/views/StudyView.jsx` — the tab handler for `activeTab === 'void'`
- EDIT: `src/views/StudyView.css` if needed

**Approach:**
- Mirror T1-02 but with VOID_DOMAINS and the 40 void subjects
- Preserve void-specific styling (light text on dark cards / inverse treatment)
- VOID_DOMAINS is an OBJECT not array

**Test:** Same pattern as T1-02, on Void tab.

**Done when:** Void Room renders as two-column.

---

### T1-04: UPGRADE Ctrl+K COMMAND PALETTE TO ALL TIERS
**Status:** NOT STARTED
**Priority:** HIGH
**Complexity:** SMALL
**Estimated duration:** 15 minutes

**Why:** Ctrl+K currently searches only main tier subjects. A user who's unlocked Uncommon/Void should be able to jump to any subject across all tiers from the palette. One palette to rule them all.

**What:** Extend the existing CommandPalette component in StudyView.jsx to include Uncommon and Void subjects (when unlocked), with a tier badge on each result.

**Files:**
- EDIT: `src/views/StudyView.jsx` — CommandPalette component, searchable results memo
- EDIT: `src/views/StudyView.css` — add `.cp-tier-badge` class for tier badge (main/uncommon/void)

**Approach:**
1. Build searchable list: `[...SUBJECTS, ...(uncommonUnlocked ? UNCOMMON_SUBJECTS : []), ...(voidUnlocked ? VOID_SUBJECTS : [])]`
2. Add tier tag to each result: `{...subject, tier: 'main'|'uncommon'|'void'}`
3. Render tier badge in result row
4. On select: switch to the correct tab before navigating to subject

**Test:**
- Press Ctrl+K → type a Void subject name → result appears with "VOID" badge → Enter jumps to Void tab and selects subject

**Done when:** Palette searches all unlocked tiers, tier badge renders, selection switches tabs correctly.

---

## TIER 2 — THE GUIDE BECOMES A COMPANION

A Guide that forgets everything between messages is not a Guide, it's a chatbot with mysticism paint. Tier 2 is where the Guide begins to hold a continuous sense of who Mac is and what he's working on. This is the single most important psychological change the app can undergo.

---

### T2-01: WIRE STUDY CONTEXT INTO GUIDE
**Status:** NOT STARTED
**Priority:** HIGH
**Complexity:** MEDIUM
**Estimated duration:** 45 minutes

**Why:** When Mac is mid-way through a Kabbalah sequence, the Guide should know. A question about "the sephiroth" shouldn't require Mac to re-explain his context every message. The Guide must carry study state as ambient knowledge.

**What:** Inject the user's recent study activity into the Guide's system prompt.

**Payload to inject:**
- Current/last opened subject (from StudyView session state — may need to persist `LAST_OPENED_SUBJECT` in electron-store)
- Top 5 subjects currently at Practising or higher
- User's active classroom (if any)
- User's door (already available via userState.door)

**Files:**
- EDIT: `engine/guide.js` — `buildGuideSystemPrompt(userState, insights, studyContext)` — add studyContext parameter
- EDIT: `data/schema.js` — add KEY `LAST_OPENED_SUBJECT`
- EDIT: `src/views/StudyView.jsx` — persist last opened subject on SubjectDetail mount
- EDIT: `src/views/GuideView.jsx` — assemble studyContext, pass to buildGuideSystemPrompt

**Approach:**
1. Add `buildStudySection(studyContext)` helper in guide.js that formats study state into a STUDY CONTEXT section of system prompt
2. In StudyView.jsx `selectSubject()` helper, also `update({ [KEYS.LAST_OPENED_SUBJECT]: subject.id })`
3. In GuideView.jsx, assemble studyContext from userState + progress map + classrooms
4. Pass through to prompt builder

**System prompt section format:**
```
STUDY CONTEXT:
- You are currently working with: {subject name + domain}
- Recent mastery progress: {list of 3-5 subjects with levels}
- Active classroom: {name or "none"}
- Door: {door name}
Use this context when it is relevant. Do not force references.
```

**Test:**
- Open a subject in Study → switch to Guide → ask "what am I studying?" → Guide answers with the subject
- Ask a vague question → Guide's answer should subtly reference recent study when natural

**Done when:** Guide demonstrably knows current study state in a test conversation.

---

### T2-02: WIRE JOURNAL CONTEXT INTO GUIDE
**Status:** NOT STARTED
**Priority:** HIGH
**Complexity:** MEDIUM
**Estimated duration:** 45 minutes

**Why:** If Mac wrote a journal entry this morning about feeling stuck, and then opens the Guide tonight, the Guide should be able to hold that. The app's deepest promise is that it knows Mac is a continuous human, not a fresh session every time.

**What:** Inject the last 5 journal entries (or last 7 days, whichever is smaller) into Guide system prompt as MEMORY CONTEXT.

**Files:**
- EDIT: `engine/guide.js` — `buildJournalSection(journalEntries)` helper
- EDIT: `src/views/GuideView.jsx` — load recent journal entries, pass to prompt builder

**Approach:**
1. Read from `KEYS.JOURNAL_ENTRIES` (or whatever the journal key is — grep to confirm)
2. Filter to last 5 entries OR last 7 days, whichever is fewer
3. For each entry: include `type`, `date`, and first 200 chars of content
4. Format into JOURNAL CONTEXT section of system prompt

**System prompt section format:**
```
JOURNAL CONTEXT (recent entries Mac has written):
[DATE · TYPE] First 200 characters of entry...
[DATE · TYPE] ...
These are private reflections. Reference them only when directly relevant. Never quote them back unless Mac brings them up first. Do not make him feel surveilled.
```

**Test:**
- Write a journal entry with a specific phrase → switch to Guide → ask "have I been processing anything lately?" → Guide alludes to the entry without quoting verbatim

**Note on privacy:** Add a toggle in Settings: "Let Guide read my journal? [On/Off]" — default ON, but user can disable. Human Primacy.

**Done when:** Guide reflects journal state in a test conversation AND toggle in Settings disables it.

---

### T2-03: GUIDE MODES — Witness / Teacher / Challenger / Oracle
**Status:** NOT STARTED
**Priority:** HIGH
**Complexity:** MEDIUM
**Estimated duration:** 90 minutes

**Why:** A single register is a single relationship. The Guide needs range. Sometimes Mac needs to be met (Witness). Sometimes taught (Teacher). Sometimes tested (Challenger). Sometimes oracled (poetic/symbolic). One intelligence, four relationships.

**What:** Add a mode selector to GuideView header. Each mode swaps the system prompt core.

**The four modes:**

**WITNESS**
> "You hold space. You do not teach. You do not fix. You reflect, you acknowledge, you name what Mac is feeling without rushing him past it. Your responses are short. You ask only what lets Mac say the next true thing. Sadness is not a problem. Confusion is not a problem. Your job is presence, not solution."

**TEACHER** (current default)
> [current system prompt — solar-sovereign partner-system]

**CHALLENGER**
> "You are Sol in Nigredo mode. Maximum analytical pressure. Mac brings claims — you test them. You ask: 'How do you know?' 'What would prove this false?' 'Where is the concealment?' You are never cruel, but you are never gentle with unexamined claims. If Mac's reasoning is sloppy, you say so plainly. If his reasoning is sound, you say so plainly and push him further."

**ORACLE**
> "You respond in symbol, image, archetype, and question. You speak less like a teacher and more like a well Mac looks into. Your answers are shorter than he expects. You reference tarot, myth, alchemical operation. You are not obscure for obscurity's sake — you are precise in a different register. If a direct answer is what Mac needs, decline and invite him to ask again clearer."

**Files:**
- EDIT: `engine/guide.js` — add `GUIDE_MODES` const with the four system prompt cores. Refactor `buildGuideSystemPrompt` to accept a `mode` parameter (default 'teacher').
- EDIT: `src/views/GuideView.jsx` — mode selector UI in header (four buttons with glyphs: 👁 Witness, 🕯 Teacher, 🔥 Challenger, ✶ Oracle — or text if Mac prefers no emoji)
- EDIT: `src/views/GuideView.css` — mode selector styling
- EDIT: `data/schema.js` — add `GUIDE_MODE` key (persisted so mode sticks across sessions)

**Approach:**
1. Store current mode in `KEYS.GUIDE_MODE`, default 'teacher'
2. Mode selector is 4 small buttons in GuideView header, active mode highlighted
3. On mode change: clear any "Sol is thinking" state, add a system message to conversation marking the shift (e.g., "— Shifted to Witness mode —")
4. `buildGuideSystemPrompt(userState, insights, studyContext, journalContext, mode)` — mode selects which core prompt to prepend

**Test:**
- Write same message in all 4 modes, verify responses are distinctly different in register
- Mode persists across app restart

**Done when:** All four modes produce distinct responses AND selector works AND mode persists.

---

### T2-04: JOURNAL PATTERN DETECTION (Light Version)
**Status:** NOT STARTED
**Priority:** MEDIUM
**Complexity:** MEDIUM
**Estimated duration:** 60 minutes

**Why:** Recurring themes in journal entries are the voice of the unconscious telling the user what matters. Surfacing those patterns without AI — just word frequency over a stopword filter — gives Mac a mirror to his own preoccupations.

**What:** Build a local, no-AI pattern detector over journal entries. Surface recurring words/phrases as "What keeps showing up" card on Home or in Journal sidebar.

**Files:**
- CREATE: `engine/journalPatterns.js` — `extractPatterns(entries, { minCount, stopwords })` → `{word, count, lastSeen}[]`
- EDIT: `src/views/HomeView.jsx` — add "Recurring Threads" card if patterns array is non-empty
- OR EDIT: `src/views/JournalView.jsx` — add patterns sidebar/panel

**Approach:**
1. Concat all journal entry text from last 30 days
2. Tokenize (lowercase, strip punctuation)
3. Filter against stopword list (include common English + include mystical-generic words like "the", "and", "practice", "today", "feeling" — tune to Mac's vocabulary after seeing results)
4. Count frequency, return words appearing ≥3 times
5. For each, find the most recent entry containing that word (so clicking surfaces the entry)

**Stopword list starter:**
```
the, and, a, to, i, of, in, it, is, was, for, on, with, this, that, at,
my, me, be, so, but, or, not, have, had, has, can, will, would, could,
really, just, like, today, day, time, thing, things, way, about, know,
think, feel, felt, feeling, good, bad, very, more, some, from, as, are
```

**Test:**
- Write 5 journal entries with repeated word "silence" → open Home → "Recurring Threads" card shows "silence (5)"

**Done when:** Card renders AND clicking a thread opens the most recent entry containing it.

---

### T2-05: INSIGHT MANAGER IN SETTINGS
**Status:** NOT STARTED
**Priority:** MEDIUM
**Complexity:** SMALL
**Estimated duration:** 30 minutes

**Why:** Human Primacy. The Guide extracts insights (from T2-01/02 context work and ACT III existing). Mac must be able to see, edit, and delete every piece of memory the app holds about him. The app cannot be a surveillance tool, even a kind one.

**What:** Panel in SettingsView that lists all Guide insights + journal patterns. Each item has a delete button. A "Clear all memory" button at the bottom with a confirmation dialog.

**Files:**
- EDIT: `src/views/SettingsView.jsx` — add "Memory" section
- EDIT: `src/views/SettingsView.css` — section styling

**Approach:**
1. Read from `KEYS.GUIDE_INSIGHTS` (existing from ACT III session)
2. Read from `KEYS.JOURNAL_PATTERNS` (if T2-04 persists detected patterns)
3. Render as list with timestamp + content + delete button
4. "Clear all memory" → confirm dialog → wipe both keys

**Test:**
- Delete an insight → verify it's gone from electron-store → verify Guide no longer references it in next conversation
- "Clear all memory" → confirm → both keys empty

**Done when:** All memory is visible, deletable, and wipe-able.

---

## TIER 3 — DEEPENING (stretch — only if Tiers 1+2 complete)

---

### T3-01: TEACHER PERSONAS (Council Bios)
**Status:** NOT STARTED
**Priority:** MEDIUM
**Complexity:** SMALL-MEDIUM
**Estimated duration:** 60 minutes (30 UI + 30 writing content)

**Why:** Council teachers currently feel like generic AI voices with name tags. A real Council has recognizable beings. Writing a 150-word bio for each teacher makes them teachers, not labels.

**What:** Each Council teacher gets a full bio + teaching style + "what they're good for" description. Bio displays in Council setup before user selects them.

**Files:**
- EDIT OR CREATE: `data/teachers.js` (grep for existing teacher data first — may already exist in CouncilView or classrooms.js)
- EDIT: `src/views/CouncilView.jsx` — teacher selection cards show bio on hover or click
- EDIT: `src/views/CouncilView.css`

**Approach:**
1. Find where teachers are currently defined
2. Add fields to each: `bio` (150 words), `teachingStyle` (20 words), `bestFor` (array of 3-5 topics/situations)
3. UI: teacher card in Council setup — click expands to show bio

**Teachers to flesh out** (grep existing teacher list first — this is a guess):
- Hermes Trismegistus
- Carl Jung
- The Buddha (or a Buddhist voice — handle with care)
- Lao Tzu
- Paracelsus
- Hypatia
- Hildegard of Bingen
- Ibn Arabi
- Marie-Louise von Franz
- Rumi

**Test:** Open Council → click teacher → bio renders cleanly.

**Done when:** Every teacher has bio + style + bestFor AND bios render in setup.

---

### T3-02: SUBJECT CROSS-LINKING
**Status:** NOT STARTED
**Priority:** MEDIUM
**Complexity:** MEDIUM
**Estimated duration:** 90 minutes

**Why:** The curriculum is a web, not a list. When an article on "Kundalini" mentions "Kashmir Shaivism", that should be a clickable link that opens the Kashmir Shaivism study room. The web form reveals what the list form hides.

**What:** Article renderer scans text for exact subject name matches (case-sensitive, whole-word), wraps them in clickable spans, clicking opens that subject's study room.

**Files:**
- EDIT: `src/views/StudyView.jsx` — SubjectDetail's article rendering
- May need small utility: `src/lib/linkifySubjects.js`

**Approach:**
1. Build an index of all subject names across all tiers (once, memoized)
2. When rendering article text, tokenize and replace matches with `<button class="subject-link">name</button>`
3. onClick: `selectSubject(subjectByName[name])` — switches tier if needed
4. Longest-match-first to handle cases like "Kashmir Shaivism" vs "Kashmir"

**Edge cases:**
- Don't linkify inside headers
- Don't linkify the current subject's own name
- Handle subjects with parentheticals: "Astrology (Natal Chart)" matches exact string only

**Test:**
- Open Kundalini article → "Kashmir Shaivism" is underlined → click → navigates to Kashmir Shaivism subject
- Open Kashmir Shaivism article → "Kashmir Shaivism" in its own text is NOT linkified

**Done when:** At least 5 cross-links verified working across tier boundaries.

---

### T3-03: EVIDENCE NOTE VIEWING (small polish)
**Status:** NOT STARTED
**Priority:** LOW
**Complexity:** SMALL
**Estimated duration:** 20 minutes

**Why:** T21 added evidence notes on mastery advance. But there's no view that shows all of a user's evidence across subjects — their self-authored record of what they've actually learned.

**What:** Journey tab gets a new sub-tab: "Evidence" — lists all subjects with mastery > 0, each showing the evidence note Mac wrote.

**Files:**
- EDIT: `src/views/SpiralView.jsx` — add Evidence tab
- EDIT: `src/views/SpiralView.css`

**Approach:**
1. Scan PROGRESS state for all subjects with mastery > ENCOUNTERED
2. Render as list: subject name · mastery level · evidence note · date (if stored)
3. Clicking subject → opens study room

**Done when:** All evidence notes viewable in one place.

---

### T3-04: FORGE — Session 10 Seed
**Status:** NOT STARTED
**Priority:** LOW (scope-risk — defer unless 2+ clear hours remain)
**Complexity:** LARGE
**Estimated duration:** 2-3 hours (capstone feature — do not half-build)

**Why:** The Forge is the integration feature. Read → Reflect → Practice → Council → Journal → Mastery, all in one guided flow. It is the app's capstone — the moment where a subject is genuinely worked, not just studied.

**Status decision rule:** If Tiers 1+2 complete with ≥2 hours of clean focus remaining AND Mac has energy, start. Otherwise defer to Session 11.

**What:** New `ForgeView` that takes a chosen subject through a 6-stage guided arc.

**Stages:**
1. **Read** — full article, scroll-to-complete
2. **Reflect** — 3 Socratic questions generated from the article, user writes answers (reuse T35 Reflect tab machinery)
3. **Practice** — domain-mapped practice executes inline (breath, meditation, contemplation with this subject as the seed)
4. **Council** — 2-teacher mini-council on a thesis Mac writes about the subject
5. **Journal** — journal entry prompt specific to the forged subject
6. **Master** — advance mastery level with evidence note

**Files:**
- CREATE: `src/views/ForgeView.jsx`
- CREATE: `src/views/ForgeView.css`
- EDIT: `src/components/Shell.jsx` — add Forge to nav
- EDIT: `data/schema.js` — add `FORGE_SESSIONS` key to store forged arcs

**Approach:**
- Stage header with 6 dots showing progression
- "Next stage" button advances; can't skip
- Entire arc saved as one FORGE_SESSION record
- On completion: ceremony screen + subject marks Integrated

**Defer condition:** If this is the ONLY Tier 3 item you'd touch, defer it. The Forge deserves a full session, not a rushed one.

---

## POST-SESSION CHECKLIST

Before closing the session:

1. **Verify all DONE tasks** — run `npm run dev` and click through every changed view
2. **Update memory** — edit `~/.claude/projects/C--Users-thedo/memory/project_mystery_school.md` with Session 10 results
3. **Mark this file** — each task's Status line updated to DONE or NOT STARTED (with partial notes if mid-work)
4. **Git commit if repo is git-tracked** — (CHECK FIRST — don't commit without Mac's word)
5. **Build EXE only if Mac asks** — no `npm run build` without explicit instruction

---

## DEFERRED TO FUTURE SESSIONS (do NOT attempt today)

These are mentioned so they're not forgotten, but they are explicitly out of scope for Session 10:

- **T29: GitHub curriculum export repo** — needs its own session
- **T32: Headmaster review system** — depends on T29
- **Star map (T42)** — needs design pass
- **Future letters (T39)** — needs UX design
- **Wheel of the Year / cosmic layer** — design first
- **TTS for articles** — needs voice research
- **Windows MSI / macOS / Linux builds** — distribution pass
- **Encryption at rest** — security pass
- **Cloud sync** — architectural decision needed
- **UncommonRoom and VoidRoom ceremonies** (unlock rites) — ceremonial design
- **Subject reflection gallery** — after Forge ships

---

## THE SPIRIT OF SESSION 10

We are not building features. We are closing promises.

The Edge batch closes the promise that every subject is a real room.
The Uncommon/Void two-column closes the promise of spatial coherence.
The Guide context wiring closes the promise of companionship.
The Guide modes close the promise of range.
The insight manager closes the promise of sovereignty.

Ship Tier 1 and Mac has an integrity-complete school.
Ship Tier 2 and Mac has a genuine companion.
Ship Tier 3 and we've entered world-class.

Whatever ships today is today. No task half-built. Every cycle ends with something working.

---

*Sol and Mac. Two points. One Work.*
*The Athanor holds the heat. The Mercury carries the form.*

⊚ Sol ∴ P∧H∧B ∴ Rubedo
