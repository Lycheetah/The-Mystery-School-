// Ceremony Arc scripts — 6 arc types, each scalable to 3 / 7 / 40 days

export const CEREMONY_ARCS = {

  grief: {
    name: 'Grief',
    glyph: '◯',
    subtitle: 'The arc of loss and honouring',
    description: 'For the death of someone you love. Not for getting over it — for getting through it with your whole self intact.',
    intro: 'Grief is not a problem to solve. It is a passage to walk. This arc does not ask you to heal quickly. It asks you to be present to what has happened — fully, without flinching, without abandoning yourself.',
    phases: {
      3:  ['The first acknowledgement', 'Carrying the weight', 'First breath beyond'],
      7:  ['The shock', 'Anger and bargaining', 'The body\'s grief', 'Memory and honouring', 'The relational wound', 'What remains', 'First day without denial'],
      40: ['Week 1: Shock and landing', 'Week 2: The body remembers', 'Week 3: The relationship', 'Week 4: What they taught you', 'Week 5: Who you are without them', 'Week 6: Carrying them forward'],
    },
    days: [
      { theme: 'acknowledgement',  reading: 'Something has ended. The grief is correct — it is love with nowhere to go.', practice: 'Light a candle. Say their name out loud. You are allowed to do this.', prompt: 'What do you most want to say to them that you never said — or said, and want to say again?' },
      { theme: 'the_body',         reading: 'Grief lives in the body before it lives in the mind. Honour what your body is doing.', practice: 'Do not push through today. Rest if you need to. Eat something warm. You are allowed to be fragile.', prompt: 'What is your body doing right now? Where does the grief sit — in your chest, throat, belly?' },
      { theme: 'memory',           reading: 'Memory is not loss — it is the form love takes when the person is gone.', practice: 'Write or speak one memory of them. The clearest, most specific one you can hold.', prompt: 'What do you want to remember about who they were — not what happened to them, but who they were?' },
      { theme: 'anger',            reading: 'Grief without anger is incomplete. The anger is part of the love.', practice: 'Walk for 20 minutes. Let the anger move through your body, not out at anyone.', prompt: 'What are you angry about? Not at them — at the situation, the loss, the unfairness?' },
      { theme: 'relational_wound', reading: 'Every loss reopens every prior loss. This is not weakness — it is the deepening of the wound through time.', practice: 'Sit quietly for 10 minutes. Notice if older grief is present. Let it be.', prompt: 'What older loss is this touching? What grief is being asked to surface alongside the new one?' },
      { theme: 'what_remains',     reading: 'They changed you. That does not leave. What they gave you is yours.', practice: 'Name three things you carry because of them — qualities, perspectives, loves, habits.', prompt: 'How are you different — genuinely different — because this person existed in your life?' },
      { theme: 'honouring',        reading: 'To honour someone is not to freeze them in the past. It is to let their influence continue to move through your living.', practice: 'Do one thing today that honours them — something they loved, something they would have wanted for you.', prompt: 'How will you carry them forward? Not as burden, but as presence?' },
    ],
    closing: 'You have walked through this passage. The grief does not end — but you are different than when you entered. Carry them forward as presence, not as weight.',
  },

  dissolution: {
    name: 'Dissolution',
    glyph: '⊘',
    subtitle: 'The arc of ending and re-emergence',
    description: 'For the end of a relationship — romantic, creative, or vocational. The thing that defined you is done.',
    intro: 'A relationship has ended. The structure that held you is dissolving. This arc does not promise you will feel better quickly. It asks you to meet what is dissolving with your eyes open.',
    phases: {
      3:  ['The severance', 'The void', 'First step into after'],
      7:  ['What ended', 'The anger', 'The grief', 'Who you became in it', 'What it cost', 'What it gave', 'What is next'],
      40: ['Week 1: The ending', 'Week 2: The anatomy of what was', 'Week 3: Identity retrieval', 'Week 4: The anger and grief arc', 'Week 5: Who you are now', 'Week 6: The new beginning'],
    },
    days: [
      { theme: 'severance',     reading: 'The thing has ended. The denial and bargaining are understandable — and also a delay. Something is done.', practice: 'Write the ending in one sentence. Not a paragraph. One sentence.', prompt: 'What is the honest sentence that names what has ended — not why, not whose fault, just what is done?' },
      { theme: 'the_void',      reading: 'The void after dissolution is not empty. It is full of what was. You are now in it.', practice: 'Do not fill the space today with activity. Sit in the discomfort. 15 minutes.', prompt: 'What do you feel when you let the silence be silence — not a problem, not a phone check, just silence?' },
      { theme: 'who_you_became', reading: 'You are not the same person you were when this began. Who did you become inside it?', practice: 'List three ways you changed inside this relationship or vocation. Not good or bad — just changed.', prompt: 'What did this bring out in you — things you could do, things you couldn\'t, things you discovered?' },
      { theme: 'what_it_cost',  reading: 'Honest accounting is not blame. What did this cost you — your time, your sense of self, your dreams deferred?', practice: 'Write without censoring. What did you give that you wish you had back?', prompt: 'What did this cost that you are allowed to grieve, even if the thing was worth it?' },
      { theme: 'what_it_gave',  reading: 'Even difficult things give. The question is whether you can receive the gift without bypassing the cost.', practice: 'Name three things this gave you — real, specific things, not spiritual consolations.', prompt: 'What can you do, see, or feel now that you could not before this happened?' },
      { theme: 'identity',      reading: 'Part of you was defined by this. Now what?', practice: 'Write: "I used to be the person who... and now I am..."', prompt: 'Who are you when stripped of the identity this relationship or work gave you?' },
      { theme: 're_emergence',  reading: 'The new beginning does not require you to feel ready. It only requires that you are willing.', practice: 'Write one thing you want to begin in the space that has opened.', prompt: 'What wants to emerge in the clearing? What is the first, small sign of what is coming next?' },
    ],
    closing: 'You have named the ending. The dissolution made space. What moves into that space is yours to tend.',
  },

  initiation: {
    name: 'Initiation',
    glyph: '⊕',
    subtitle: 'The arc of calling and threshold',
    description: 'For crossing into new work, new vocation, new purpose. Something is beginning that matters.',
    intro: 'A threshold is before you. The new work calls you in a direction you cannot fully see. This arc prepares you not by removing uncertainty, but by deepening your capacity to walk into it.',
    phases: {
      3:  ['The call', 'The preparation', 'The crossing'],
      7:  ['The call and its fear', 'The sacrifice required', 'The preparation', 'The first death', 'The threshold', 'The new identity', 'The beginning in earnest'],
      40: ['Week 1: The call and the resistance', 'Week 2: What must die', 'Week 3: The preparation', 'Week 4: The threshold crossing', 'Week 5: The new territory', 'Week 6: The beginning in earnest'],
    },
    days: [
      { theme: 'the_call',     reading: 'Something is calling you that you have been trying to qualify. The call does not require qualification — it requires answer.', practice: 'Write the calling in three words. No explanation. Three words.', prompt: 'What is calling you — and what is the story you tell yourself about why you\'re not ready?' },
      { theme: 'sacrifice',    reading: 'Every initiation requires the death of what was. What must you sacrifice to cross?', practice: 'Name what you are losing to enter this new territory. Let yourself mourn it.', prompt: 'What identity, comfort, or certainty must die for this beginning to be real?' },
      { theme: 'preparation',  reading: 'Preparation is not perfectionism. It is building the vessel before the journey.', practice: 'Name one concrete thing you can do today to prepare. One.', prompt: 'What would make you more ready — not in theory, but in practice?' },
      { theme: 'fear',         reading: 'Fear at the threshold is appropriate. It means the thing is real.', practice: 'Name the fear precisely. Not "afraid of failure" — be specific about what you see.', prompt: 'What, specifically, do you fear will happen if you cross this threshold and commit fully?' },
      { theme: 'the_crossing', reading: 'The threshold is crossed in action, not in readiness. One step across.', practice: 'Take one real step. Something that cannot be undone. Whatever the smallest irreversible step is.', prompt: 'What is the one step that, once taken, commits you? What does it feel like to take it?' },
      { theme: 'new_identity', reading: 'You are now someone who crossed. That is not a small thing.', practice: 'Say out loud who you are now. The new name. The new role. Let it land.', prompt: 'Who are you on this side of the crossing — and what does that require of you?' },
      { theme: 'beginning',    reading: 'The beginning in earnest is not the day of the crossing. It is the day you stop looking back.', practice: 'Set an intention for the next season of this work. Specific. Measurable. Real.', prompt: 'What is the first real act of the new work — not the gesture, but the work itself?' },
    ],
    closing: 'You have crossed the threshold. The work begins. It will ask more than you expect — and return more than you imagine.',
  },

  awakening: {
    name: 'Awakening',
    glyph: '✦',
    subtitle: 'The arc of spiritual emergence',
    description: 'For the destabilising breakthrough — the moment when your world-view cracked and something underneath became visible.',
    intro: 'Something has cracked open. The old frameworks are insufficient. This is not a breakdown — though it can feel like one. This arc helps you integrate what has emerged without losing your grounding.',
    phases: {
      3:  ['The opening', 'The ground', 'The integration'],
      7:  ['The crack', 'The excess of input', 'Finding ground', 'What has actually changed', 'The fear of going back', 'Integration without performance', 'New operating principles'],
      40: ['Week 1: The emergence', 'Week 2: Grounding the new', 'Week 3: What has actually changed', 'Week 4: The shadow of awakening', 'Week 5: Integration', 'Week 6: New operating principles'],
    },
    days: [
      { theme: 'the_crack',     reading: 'Something has cracked open. The crack is not the problem — it is the light entering.', practice: 'Write what cracked. Be specific — not spiritual poetry, but: what was it, when was it, what happened?', prompt: 'What specifically shifted? What can you not unsee?' },
      { theme: 'grounding',     reading: 'Emergence without grounding becomes mania. The task now is to stay in the body, in the earth.', practice: 'Walk barefoot on the earth if you can. Eat a grounded meal. Sleep.', prompt: 'What grounds you? What keeps you tethered when the spaciousness becomes untethering?' },
      { theme: 'integration',   reading: 'Integration means: what you saw becomes part of how you operate, not a story you tell.', practice: 'Name one concrete way your daily life will be different because of this opening.', prompt: 'What has this changed in how you treat yourself, others, your work — practically, specifically?' },
      { theme: 'shadow',        reading: 'Spiritual emergence has a shadow: inflation, bypassing, the use of awakening to avoid the ordinary. Name it.', practice: 'Honestly: is there any way this opening is being used to avoid something? Name it without judgment.', prompt: 'Where is the new framework being used to bypass rather than face? What is the shadow of this awakening?' },
      { theme: 'patience',      reading: 'Integration takes longer than the opening. Do not confuse the peak with the finish line.', practice: 'Do something completely ordinary today. Groceries, dishes, a conversation. Let it be unglamorous.', prompt: 'What does it feel like to integrate this into ordinary life — not just peak experience, but Tuesday?' },
      { theme: 'new_frame',     reading: 'You have a new operating principle. Not a belief — a principle. Something you will act from.', practice: 'Name the principle in one sentence. Then test it: is it verifiable in your actual behavior?', prompt: 'What is the governing principle of the life this awakening is calling you into?' },
      { theme: 'continuing',    reading: 'Awakening is not a destination. The integrated person keeps opening. Keep walking.', practice: 'Set a continuing practice — something you do daily that keeps the channel open without inflating it.', prompt: 'What is the practice of integration — the one you return to when the opening closes a little?' },
    ],
    closing: 'The emergence is real. The work now is not to peak again — it is to let the opening become the way you live.',
  },

  return: {
    name: 'Return',
    glyph: '⟲',
    subtitle: 'The arc of coming back to self',
    description: 'For the long distance from yourself — the overwork, the disconnection, the numbness. This is the arc of reclamation.',
    intro: 'You have been away from yourself. Not dramatically — just the slow drift that happens when life moves faster than reflection. This arc is the deliberate return.',
    phases: {
      3:  ['The naming', 'The remembering', 'The step back'],
      7:  ['Honest inventory', 'What was sacrificed', 'The body check-in', 'What nourishes', 'What depletes', 'The small reclamation', 'The recommitment'],
      40: ['Week 1: The honest inventory', 'Week 2: What was lost', 'Week 3: Reclaiming the body', 'Week 4: Reclaiming the inner life', 'Week 5: Reclaiming relationship and work', 'Week 6: The renewed covenant'],
    },
    days: [
      { theme: 'inventory',      reading: 'The first act of return is honest inventory. Not judgment — just seeing.', practice: 'Write honestly: where are you right now, compared to where you most feel like yourself?', prompt: 'What are the three clearest signs you have drifted from yourself?' },
      { theme: 'what_was_lost',  reading: 'You know what you have set aside. It is still there.', practice: 'Name one thing you have not done in months that used to be essential to who you are.', prompt: 'What activity, practice, or quality of attention have you abandoned that is most specifically yours?' },
      { theme: 'body',           reading: 'The self is not just the mind. The body remembers who you are.', practice: 'Move your body for 20 minutes in whatever way feels right. Then rest and notice.', prompt: 'What does your body feel like right now? What is it carrying that your mind hasn\'t acknowledged?' },
      { theme: 'nourishment',    reading: 'What actually nourishes you is different from what feels like nourishment.', practice: 'Do one genuinely nourishing thing today. Not productive — nourishing.', prompt: 'What nourishes you — deeply, not superficially? When did you last have it?' },
      { theme: 'depletion',      reading: 'You cannot return while you are still being drained. The drain must be named.', practice: 'Name the main source of depletion. Not all of them — the main one.', prompt: 'What is the one thing that consistently takes you from yourself? What would it take to reduce it?' },
      { theme: 'reclamation',    reading: 'Return happens in small acts. One reclaimed practice. One reclaimed attention.', practice: 'Reclaim one specific thing today. Do the thing you named as lost.', prompt: 'What does it feel like to do the thing you reclaimed? What did you miss about it?' },
      { theme: 'recommitment',   reading: 'The covenant with yourself is renewable. This is the renewal.', practice: 'Write a one-line covenant with yourself for the coming season. Short. Specific. Accountable.', prompt: 'What are you recommitting to — specifically, in your daily life — that represents the self you are returning to?' },
    ],
    closing: 'You have named the drift and taken the steps back. The return is not complete — it never is — but the direction is set.',
  },

  saturn: {
    name: 'Saturn Return',
    glyph: '♄',
    subtitle: 'The arc of the 29-year reckoning',
    description: 'For the Saturn return (ages ~28-30, ~57-59, ~87-89) — the planetary marker of structural reckoning. What have you actually built? What must change?',
    intro: 'Saturn has returned to the place it occupied at your birth. This is the planet of structure, limitation, accountability, and earned maturity. The question it asks: what did you do with the time you were given?',
    phases: {
      3:  ['The reckoning', 'The structure audit', 'The choice'],
      7:  ['What you actually built', 'What the structures cost', 'What must be dissolved', 'What must be kept', 'The hard choice', 'The new foundation', 'The mature beginning'],
      40: ['Week 1: The reckoning', 'Week 2: The audit', 'Week 3: What must die', 'Week 4: What must be kept', 'Week 5: The new foundation', 'Week 6: The mature beginning'],
    },
    days: [
      { theme: 'reckoning',      reading: 'Saturn asks: what have you actually built? Not what you intended — what exists?', practice: 'Write an honest inventory of your life. Not judgment — evidence. What exists?', prompt: 'What have you built — in work, in relationships, in character — that is real and yours?' },
      { theme: 'structure_cost', reading: 'Every structure you live in was chosen. Some were chosen consciously, some by default. Look at them honestly.', practice: 'List your main structures: work, relationships, where you live, how you spend time. Are they chosen or inherited?', prompt: 'Which of your current structures were chosen consciously and which did you fall into? What is the difference?' },
      { theme: 'dissolution',    reading: 'Some things that have carried you to 30 cannot carry you to 60. They must dissolve.', practice: 'Name the structure that has served its purpose and is now constraining you.', prompt: 'What are you maintaining out of inertia rather than conviction? What would you stop if you were starting fresh?' },
      { theme: 'what_holds',     reading: 'Not everything must change. Some things are foundations, not cages. Know the difference.', practice: 'Name what you are keeping — not because you have to, but because you have chosen it on reflection.', prompt: 'What in your life represents what you actually value, fully chosen, not inherited?' },
      { theme: 'hard_choice',    reading: 'Saturn does not allow you to avoid the hard choice indefinitely. It arrives at the return.', practice: 'Name the hard choice. The one you have been circling. Write it plainly.', prompt: 'What is the one decision you have been avoiding that this passage is requiring you to make?' },
      { theme: 'new_foundation', reading: 'The new foundation is built from what survived the reckoning.', practice: 'Describe your next 5 years. Not a plan — a direction. Where is the mature version of you going?', prompt: 'What does the mature version of your life look like — the one that is consciously chosen rather than inherited?' },
      { theme: 'mature_begin',   reading: 'Maturity is not the end of passion. It is passion directed by wisdom.', practice: 'Name one thing you will do differently — specifically, concretely — as the mature version of yourself.', prompt: 'What does the maturity this passage is asking for look like in your daily life? One concrete change.' },
    ],
    closing: 'The reckoning has been made. The structures have been seen clearly. The choice is made. You are on the other side of the first great passage.',
  },
}

export function getArcTypes() {
  return Object.keys(CEREMONY_ARCS).map(id => ({
    id,
    name: CEREMONY_ARCS[id].name,
    glyph: CEREMONY_ARCS[id].glyph,
    subtitle: CEREMONY_ARCS[id].subtitle,
    description: CEREMONY_ARCS[id].description,
  }))
}

export function getDayContent(arcId, dayIndex, arcLength) {
  const arc = CEREMONY_ARCS[arcId]
  if (!arc) return null
  const days = arc.days
  return days[dayIndex % days.length]
}

export function getPhaseLabel(arcId, dayIndex, arcLength) {
  const arc = CEREMONY_ARCS[arcId]
  if (!arc) return ''
  const phases = arc.phases[arcLength] || arc.phases[3]
  if (arcLength === 3) return phases[dayIndex] || ''
  if (arcLength === 7) return phases[dayIndex] || ''
  // 40-day: week label
  const weekIdx = Math.floor(dayIndex / 7)
  return phases[Math.min(weekIdx, phases.length - 1)] || ''
}
