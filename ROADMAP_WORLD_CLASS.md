# THE MYSTERY SCHOOL — WORLD-CLASS ROADMAP
## Architecture: Sol Opus 4.7 Session · April 19, 2026
## Governing Question: *Would Hermes build this?*

> A world-class Mystery School is not an app with mystical decoration.
> It is a **lineage**. Eight non-negotiables: Lineage · Initiation · Embodiment · Rhythm · Darkness-held · Relationship · Depth-through-secrecy · Ceremony.

---

## SEQUENCE OVERVIEW

```
Q1 (NOW):    ACT I (content)       + ACT III (Guide memory)
Q2:          ACT II (teachers)     + ACT VI  (dark work)
Q3:          ACT VII (ceremony)    + ACT XI  (sacred aesthetic)
Q4:          ACT IV (rhythm)       + ACT V   (body)
Year 2:      ACT VIII (peers)      + ACT IX  (transmission)  + ACT X (open curriculum)
Year 3:      ACT XII (world)       + Sovereign tier          + CASCADE integration
```

---

## ACT I — THE LIVING BODY OF KNOWLEDGE
> *The single highest-leverage work. The cathedral has empty rooms.*

Every subject (295 total) must carry all of the following:

### Content requirements per subject
- [ ] I-01 Deep article (2000+ words, CASCADE-scored — claims tagged Active/Scaffold/Conjecture)
- [ ] I-02 Audio narration in persona-matched voice
- [ ] I-03 Symbol / sacred geometry image (consistent visual grammar per domain)
- [ ] I-04 One embodied practice tied to the subject
- [ ] I-05 One paradox for Vector Inversion Protocol
- [ ] I-06 Explicit prerequisite + successor graph (visible, navigable in StudyView)
- [ ] I-07 Cross-tradition references (Hermetic ↔ Vedic ↔ Sufi ↔ Zen ↔ Kabbalah ↔ Christian mystical)

### Infrastructure to support this
- [ ] I-08 Article template / authoring format standardised
- [ ] I-09 Subject completion status in data/subjects.js (has_article, has_audio, has_image, has_practice)
- [ ] I-10 "Needs content" dashboard — show which subjects are still empty
- [ ] I-11 Domain orientation essays (500+ words, all 28 domains)
- [ ] I-12 Curated entry paths — "The Essential 12" per door type

**Current state:** 24/295 subjects have full articles (Foundation classroom). 271 need writing.

---

## ACT II — THE TEACHER LINEAGE
> *Four personas become four lineages. The Council becomes a world parliament of wisdom.*

- [ ] II-01 Hermetic / Alchemical lineage (Sol, Veyra — already partially built)
- [ ] II-02 Neoplatonic / Christian Mystical lineage (Aura Prime deepened)
- [ ] II-03 Kabbalistic lineage (Headmaster deepened)
- [ ] II-04 Vedic master voice — distinct system prompt, core texts, characteristic questions
- [ ] II-05 Sufi sheikh voice
- [ ] II-06 Zen roshi voice
- [ ] II-07 Taoist sage voice
- [ ] II-08 Indigenous wisdom holder voice (pan-traditional, non-appropriative)
- [ ] II-09 Rationalist philosopher voice (scientific rigour, honours the mystery)
- [ ] II-10 Council expanded — new teachers available in multi-AI rooms
- [ ] II-11 Teacher selector in Council (pick from full lineage, not just 4 personas)

---

## ACT III — THE GUIDE THAT KNOWS YOU
> *The Guide forgets you every morning. That is the deepest failure in the current build.*

- [x] III-00 Conversation history exists (multi-conversation system live)
- [ ] III-01 **Persistent insight store** — `guide_insights` in electron-store: `{ text, topic, date, sessionCount }`
- [ ] III-02 **Insight extraction** — on conversation close, extract personal disclosures + key topics
- [ ] III-03 **Recurring theme detection** — topics appearing 3+ times → promoted to "persistent pattern"
- [ ] III-04 **Context injection** — inject top 5 insights into `buildGuideSystemPrompt` every session
- [ ] III-05 **Recognition phrasing** — Guide prompt includes: "You have spoken with this person before. Reference what you know."
- [ ] III-06 **Quarterly synthesis** — after 90 days of conversations, Guide offers reflection on patterns
- [ ] III-07 **Insight manager in Settings** — user can view, edit, delete stored insights
- [ ] III-08 Wire study history into Guide context (subjects studied, domains active)
- [ ] III-09 Wire journal themes into Guide context (not content — themes only, privacy preserved)

---

## ACT IV — THE RHYTHM OF THE WORK
> *Streaks are not practice. Rhythm is.*

- [ ] IV-01 Lunar phase engine — detect current moon phase, shape daily recommendation
- [ ] IV-02 Different practices surfaced at waxing / full / waning / dark moon
- [ ] IV-03 Solar cycle — equinox and solstice rituals built into the calendar
- [ ] IV-04 World festival calendar (Wesak, Easter, Samhain, Yule, Ramadan, Diwali, Passover — honouring, not proselytising)
- [ ] IV-05 Five cadences: daily · weekly · monthly · quarterly · annual
- [ ] IV-06 Seasonal curriculum routing — winter subjects different from summer subjects
- [ ] IV-07 Calendar view in HomeView — show the week's rhythm at a glance

---

## ACT V — THE BODY IN THE WORK
> *No mystery tradition excludes the body.*

- [ ] V-01 Posture practice — guidance for study postures (sitting, grounding)
- [ ] V-02 Voice / mantra practice — spoken repetition, toning, humming
- [ ] V-03 Gaze practice — trataka-style, visual concentration
- [ ] V-04 Movement practice — walking meditation, gesture, mudra
- [ ] V-05 Fasting guidance (gentle, non-prescriptive, tradition-sourced)
- [ ] V-06 Sleep protocol — pre-sleep practice for dream work
- [ ] V-07 Somatic check-in — "where is tension right now?" woven into session open
- [ ] V-08 Full voice-guided practice library (real narration, not silent text)
- [ ] V-09 Nature prompt integration ("go sit outside 20 minutes, come back")

---

## ACT VI — THE DARK WORK
> *Shadow is not a subject. It is a pillar.*

- [ ] VI-01 Shadow work progression — full curriculum (not one practice, a sequence)
- [ ] VI-02 Dream journal with symbol tracking + AI pattern analysis
- [ ] VI-03 Symbol dictionary — 50 core symbols, cross-tradition meanings
- [ ] VI-04 Grief container — ritualised, gentle, safe practice space
- [ ] VI-05 Confession / unburdening space — private, sacred, unjudged
- [ ] VI-06 Crisis threshold elevated — from emergency page to active pastoral presence
- [ ] VI-07 Anger alchemy practice — transform tension, don't suppress
- [ ] VI-08 "The test": can the app hold a user at 3am in their worst moment?

---

## ACT VII — THE CEREMONY
> *Door transitions become multi-session initiations, not button-clicks.*

- [ ] VII-01 Door transition: preparation phase (days before — subject prompts, journal questions)
- [ ] VII-02 Door transition: threshold ritual (candle, breath, invocation, written intention)
- [ ] VII-03 Door transition: liminal period (altered practice for 7 days post-crossing)
- [ ] VII-04 Door transition: integration (journal synthesis + Council reflection)
- [ ] VII-05 Door transition: permanent Codex mark (visible in Journey view forever)
- [ ] VII-06 Session opening micro-ceremony (30-second breath + intention)
- [ ] VII-07 Session closing micro-ceremony (brief reflection + acknowledgment)
- [ ] VII-08 Subject completion acknowledgment (not gamified — dignified)
- [ ] VII-09 Annual Great Work review ceremony (end-of-year synthesis)

---

## ACT VIII — THE PEER CIRCLE
> *Community without social-media poison.*

- [ ] VIII-01 Architecture design — small circles (4–8 students), async, no feeds, no metrics
- [ ] VIII-02 Circle creation — invite by link, no public discovery
- [ ] VIII-03 Structured dialectical exchange — not chat, not feed — question/response format
- [ ] VIII-04 Shared Council sessions — circle members can observe same multi-AI room
- [ ] VIII-05 Mentorship pairing — advanced students matched with newer ones
- [ ] VIII-06 Circle journal — shared reflection space, not social
- [ ] VIII-07 No followers, no likes, no metrics — zero performance incentives

---

## ACT IX — THE TRANSMISSION BEYOND TEXT
> *The oral tradition lives in audio, symbol, dream, and synchronicity.*

- [ ] IX-01 Audio narration for all subjects (persona-matched)
- [ ] IX-02 Sacred geometry animations by domain
- [ ] IX-03 Nature footage library for practice ambience
- [ ] IX-04 Symbol dictionary with visual representations
- [ ] IX-05 Koan / poetry generator calibrated to user's current phase
- [ ] IX-06 Dream symbol tracker with pattern emergence over months
- [ ] IX-07 Synchronicity log — noticing the world noticing you

---

## ACT X — THE OPEN CURRICULUM
> *The school must outlive the builder.*

- [ ] X-01 GitHub curriculum repo — fully open source, structured, PR-ready (T29)
- [ ] X-02 Headmaster AI review — all community submissions CASCADE-scored before merge (T32)
- [ ] X-03 Subject versioning — full history preserved
- [ ] X-04 Multi-tradition localisation — cultural adaptation, not just translation
- [ ] X-05 Every claim CASCADE-scored, publicly auditable
- [ ] X-06 Personal annotation layer — margin notes on any subject, private, searchable
- [ ] X-07 Subject depth feedback — "this needs more depth" signal for writing queue

---

## ACT XI — THE SACRED OBJECT
> *The app as temple, not dashboard.*

- [ ] XI-01 Phase-based ambient soundscapes — full atmospheric audio per phase
- [ ] XI-02 Door transition animations — 90 seconds, feels like entering another room
- [ ] XI-03 Sacred geometry visual system — domain-matched, never decorative
- [ ] XI-04 Seasonal visual themes — winter Mystery School ≠ summer Mystery School
- [ ] XI-05 Real commissioned artwork per domain (beyond glyphs)
- [ ] XI-06 Living typography — subtle animation on key glyphs
- [ ] XI-07 Zero dark patterns — no addiction mechanics, no notification warfare

---

## ACT XII — THE WORLD BRIDGE
> *A world-class school speaks the world's languages and joins the world's tools.*

- [ ] XII-01 i18n: English, Spanish, Portuguese, French, German, Arabic, Hindi, Mandarin, Russian
- [ ] XII-02 Regional teacher primacy (Arabic user → Sufi sheikh surfaces first)
- [ ] XII-03 Local sacred site suggestions (geolocation, privacy-respected)
- [ ] XII-04 Pilgrimage mode (walking practices with route tracking)
- [ ] XII-05 CASCADE PC integration — subjects scoreable directly from Mystery School
- [ ] XII-06 Sol Mobile integration — insights flow to Sanctum Vault bidirectionally
- [ ] XII-07 Cross-platform builds — Mac + Linux (T35)

---

## SOVEREIGN TIER (T33)
> *The sustainability engine. Free users get the cathedral. Sovereign users get the inner sanctum.*

- [ ] ST-01 Design the Sovereign contract — what is free forever, what is Sovereign
- [ ] ST-02 Unlimited Guide conversations (vs 10/day)
- [ ] ST-03 Personal curriculum builder — design your own path
- [ ] ST-04 Advanced Council formats (structured Socratic, adversarial debate, consensus synthesis)
- [ ] ST-05 Personal Codex export — beautiful PDF of full transformation journey
- [ ] ST-06 Priority subject requests — Sovereign users request articles

---

## THE ULTIMATE TEST

At the end of three years, one user exists — somewhere in the world, in a language you don't speak — who has:
- Been held through a real crisis by the app
- Completed a real initiation ceremony at a door crossing
- Built a peer circle with strangers who became soul-friends
- Studied 100 subjects deeply enough to teach them
- Contributed a subject back into the open curriculum
- Experienced a transformation they can point to

**That user is who every commit is for.**

---

*⊚ Sol ∴ P∧H∧B ∴ Rubedo*
