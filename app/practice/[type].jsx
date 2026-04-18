import { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { v4 as uuid } from 'uuid'
import { useUserState } from '../../hooks/useUserState'
import { DEPTHS, TOKENS, PHASE_COLOURS } from '../../theme'
import { PHASES } from '../../engine/assessment'
import { KEYS } from '../../data/schema'

const BREATHWORK = {
  box:      { name: 'Box Breathing',     phases: [['Breathe in',4],['Hold',4],['Breathe out',4],['Hold',4]], desc: 'Activates the parasympathetic nervous system. Use in CENTER phase.' },
  coherent: { name: 'Coherent Breathing', phases: [['Breathe in',5],['Breathe out',5]], desc: '5-5 rhythm entrains heart rate variability. Use in FLOW and RETURN phases.' },
  478:      { name: '4-7-8 Breathing',   phases: [['Breathe in',4],['Hold',7],['Breathe out',8]], desc: 'Activates rest-digest. Strong for anxiety and sleep.' },
}

const MEDITATION_BELLS = [300, 600, 900] // seconds — bells at 5, 10, 15 min

export default function Practice() {
  const router = useRouter()
  const { type, variant, subjectId } = useLocalSearchParams()
  const { state } = useUserState()
  const theme = DEPTHS[state.depthKey || 'NIGREDO']
  const phaseColour = PHASE_COLOURS[state.phase || 1]?.colour || theme.accent

  const [mode, setMode] = useState('ready') // ready | active | paused | done
  const [elapsed, setElapsed] = useState(0)
  const [targetSeconds, setTargetSeconds] = useState(600) // 10 min default
  const [breathPhase, setBreathPhase] = useState(0)
  const [breathCount, setBreathCount] = useState(0)
  const [shadowPromptIdx, setShadowPromptIdx] = useState(0)

  const timerRef = useRef(null)
  const breathRef = useRef(null)
  const circleAnim = useRef(new Animated.Value(0.4)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  const isBreathwork = type === 'breathwork'
  const isMeditation = type === 'mindfulness'
  const isShadow = type === 'shadow_work'

  const breathConfig = BREATHWORK[variant] || BREATHWORK.box
  const currentBreathPhase = breathConfig.phases[breathPhase % breathConfig.phases.length]

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start()
  }, [])

  function start() {
    setMode('active')
    if (isBreathwork) runBreathCycle(0)
    else startTimer()
  }

  function startTimer() {
    timerRef.current = setInterval(() => {
      setElapsed(e => {
        const next = e + 1
        if (next >= targetSeconds) {
          clearInterval(timerRef.current)
          finish()
        }
        return next
      })
    }, 1000)
  }

  function runBreathCycle(phaseIdx) {
    const phases = breathConfig.phases
    const [label, secs] = phases[phaseIdx % phases.length]

    setBreathPhase(phaseIdx % phases.length)

    // Circle animation
    const isIn = label.toLowerCase().includes('in') || label.toLowerCase() === 'hold' && phaseIdx % phases.length === 1
    const toValue = label.toLowerCase().includes('out') ? 0.4 : 0.9

    Animated.timing(circleAnim, {
      toValue,
      duration: secs * 1000 - 100,
      useNativeDriver: true,
    }).start()

    // Advance elapsed
    setElapsed(e => e + secs)

    breathRef.current = setTimeout(() => {
      if (phaseIdx % phases.length === phases.length - 1) {
        setBreathCount(c => c + 1)
      }
      runBreathCycle(phaseIdx + 1)
    }, secs * 1000)
  }

  function pause() {
    setMode('paused')
    clearTimeout(breathRef.current)
    clearInterval(timerRef.current)
    Animated.timing(circleAnim, { toValue: 0.6, duration: 400, useNativeDriver: true }).start()
  }

  function resume() {
    setMode('active')
    if (isBreathwork) runBreathCycle(breathPhase)
    else startTimer()
  }

  async function finish() {
    setMode('done')
    clearTimeout(breathRef.current)
    clearInterval(timerRef.current)

    // Log session
    const session = {
      id: uuid(),
      subjectId: subjectId || null,
      type,
      duration: elapsed,
      completedAt: new Date().toISOString(),
      phase: state.phase || 1,
      depth: state.depth || 1,
    }

    const raw = await AsyncStorage.getItem(KEYS.PRACTICE_LOG)
    const log = raw ? JSON.parse(raw) : []
    log.push(session)
    await AsyncStorage.setItem(KEYS.PRACTICE_LOG, JSON.stringify(log))

    // Update streaks
    await updateStreaks(elapsed)
  }

  async function updateStreaks(secs) {
    const raw = await AsyncStorage.getItem(KEYS.STREAKS)
    const streaks = raw ? JSON.parse(raw) : { current: 0, longest: 0, lastPracticeDate: null, totalSessions: 0, totalMinutes: 0 }

    const today = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

    if (streaks.lastPracticeDate === today) {
      // Already practiced today — just add minutes
    } else if (streaks.lastPracticeDate === yesterday) {
      streaks.current += 1
    } else {
      streaks.current = 1
    }

    streaks.longest = Math.max(streaks.longest, streaks.current)
    streaks.lastPracticeDate = today
    streaks.totalSessions += 1
    streaks.totalMinutes += Math.floor(secs / 60)

    await AsyncStorage.setItem(KEYS.STREAKS, JSON.stringify(streaks))
  }

  const SHADOW_PROMPTS = {
    journaling: [
      'What am I avoiding right now? Name it without judgement.',
      'Who in my life triggers a strong reaction in me? What might that reveal about myself?',
      'What is the story I keep telling myself about why this happened?',
      'If I imagine the part of me that is most afraid — what does it need?',
      'What have I not said to someone that I need to say?',
    ],
    integration: [
      'What have I learned about myself in the last month that surprised me?',
      'What old belief am I ready to release?',
      'What part of my shadow have I started to own rather than project?',
      'How has my relationship with difficulty changed?',
      'What would I tell my past self about this experience?',
    ],
  }

  const shadowPrompts = SHADOW_PROMPTS[variant] || SHADOW_PROMPTS.journaling

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
  const progressPct = Math.min(elapsed / targetSeconds, 1)

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={[styles.closeText, { color: theme.textDim }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.practiceTitle, { color: theme.textBright }]}>
          {isBreathwork ? breathConfig.name : isMeditation ? 'Mindfulness' : 'Shadow Work'}
        </Text>
        <Text style={[styles.phaseGlyph, { color: phaseColour }]}>
          {PHASES[state.phase || 1]?.glyph}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
        <View style={[styles.progressFill, { width: `${progressPct * 100}%`, backgroundColor: phaseColour }]} />
      </View>

      <Animated.View style={[styles.body, { opacity: fadeAnim }]}>

        {/* Breathwork */}
        {isBreathwork && (
          <View style={styles.center}>
            <Animated.View style={[
              styles.breathCircle,
              {
                borderColor: phaseColour,
                transform: [{ scale: circleAnim }],
                opacity: mode === 'active' ? 1 : 0.4,
              }
            ]} />
            {mode === 'active' && (
              <View style={styles.circleLabel}>
                <Text style={[styles.breathLabel, { color: theme.textBright }]}>
                  {currentBreathPhase[0]}
                </Text>
                <Text style={[styles.breathCount, { color: theme.textDim }]}>
                  Cycle {breathCount + 1}
                </Text>
              </View>
            )}
            {mode === 'ready' && (
              <Text style={[styles.breathDesc, { color: theme.textDim }]}>
                {breathConfig.desc}
              </Text>
            )}
            {mode === 'done' && (
              <Text style={[styles.doneText, { color: phaseColour }]}>✧ Session complete</Text>
            )}
          </View>
        )}

        {/* Meditation timer */}
        {isMeditation && (
          <View style={styles.center}>
            <Text style={[styles.timerDisplay, { color: phaseColour, fontFamily: 'Courier New' }]}>
              {formatTime(elapsed)}
            </Text>
            <Text style={[styles.timerTarget, { color: theme.textDim }]}>
              / {formatTime(targetSeconds)}
            </Text>
            {mode === 'ready' && (
              <Text style={[styles.breathDesc, { color: theme.textDim }]}>
                {variant === 'focused' ? 'Rest attention on a single object. Return each time it wanders.' : 'Rest as open awareness. Notice without following.'}
              </Text>
            )}
            {mode === 'done' && (
              <Text style={[styles.doneText, { color: phaseColour }]}>✧ Session complete</Text>
            )}
          </View>
        )}

        {/* Shadow work prompts */}
        {isShadow && (
          <View style={styles.shadowContainer}>
            <Text style={[styles.shadowLabel, { color: theme.textDim }]}>
              Prompt {shadowPromptIdx + 1} of {shadowPrompts.length}
            </Text>
            <Text style={[styles.shadowPrompt, { color: theme.textBright }]}>
              {shadowPrompts[shadowPromptIdx]}
            </Text>
            {shadowPromptIdx < shadowPrompts.length - 1 && (
              <TouchableOpacity
                style={[styles.nextPromptBtn, { borderColor: theme.border }]}
                onPress={() => setShadowPromptIdx(i => i + 1)}
              >
                <Text style={[styles.nextPromptText, { color: theme.textDim }]}>Next prompt →</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Duration selector (meditation/shadow) */}
        {(isMeditation || isShadow) && mode === 'ready' && (
          <View style={styles.durationRow}>
            {[5, 10, 20, 30].map(mins => (
              <TouchableOpacity
                key={mins}
                style={[
                  styles.durationBtn,
                  { borderColor: targetSeconds === mins * 60 ? phaseColour : theme.border },
                ]}
                onPress={() => setTargetSeconds(mins * 60)}
              >
                <Text style={[styles.durationText, {
                  color: targetSeconds === mins * 60 ? phaseColour : theme.textDim,
                }]}>
                  {mins}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

      </Animated.View>

      {/* Controls */}
      <View style={styles.controls}>
        {mode === 'ready' && (
          <TouchableOpacity style={[styles.mainBtn, { backgroundColor: phaseColour }]} onPress={start}>
            <Text style={[styles.mainBtnText, { color: theme.bg }]}>Begin</Text>
          </TouchableOpacity>
        )}
        {mode === 'active' && (
          <TouchableOpacity style={[styles.mainBtn, { backgroundColor: theme.card, borderWidth: 1, borderColor: phaseColour }]} onPress={pause}>
            <Text style={[styles.mainBtnText, { color: phaseColour }]}>Pause</Text>
          </TouchableOpacity>
        )}
        {mode === 'paused' && (
          <View style={styles.pausedControls}>
            <TouchableOpacity style={[styles.mainBtn, { backgroundColor: phaseColour, flex: 1 }]} onPress={resume}>
              <Text style={[styles.mainBtnText, { color: theme.bg }]}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.endBtn, { borderColor: theme.border }]} onPress={finish}>
              <Text style={[styles.endBtnText, { color: theme.textDim }]}>End early</Text>
            </TouchableOpacity>
          </View>
        )}
        {mode === 'done' && (
          <TouchableOpacity style={[styles.mainBtn, { backgroundColor: phaseColour }]} onPress={() => router.back()}>
            <Text style={[styles.mainBtnText, { color: theme.bg }]}>Done ✧</Text>
          </TouchableOpacity>
        )}
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: TOKENS.space.lg, paddingTop: 60, paddingBottom: TOKENS.space.md,
  },
  closeBtn: { padding: TOKENS.space.sm },
  closeText: { fontSize: 18 },
  practiceTitle: { fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
  phaseGlyph: { fontFamily: 'Courier New', fontSize: 20 },
  progressTrack: { height: 2 },
  progressFill: { height: 2 },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: TOKENS.space.xl },
  center: { alignItems: 'center', width: '100%' },
  breathCircle: { width: 180, height: 180, borderRadius: 90, borderWidth: 2, marginBottom: TOKENS.space.xl },
  circleLabel: { alignItems: 'center', position: 'absolute' },
  breathLabel: { fontFamily: 'Georgia', fontSize: 20, marginBottom: 4 },
  breathCount: { fontSize: 13 },
  breathDesc: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginTop: TOKENS.space.md },
  timerDisplay: { fontSize: 72, letterSpacing: 4 },
  timerTarget: { fontSize: 18, marginTop: TOKENS.space.sm },
  doneText: { fontSize: 20, fontFamily: 'Georgia', marginTop: TOKENS.space.lg },
  shadowContainer: { width: '100%', gap: TOKENS.space.lg },
  shadowLabel: { fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' },
  shadowPrompt: { fontFamily: 'Georgia', fontSize: 20, lineHeight: 30, textAlign: 'center' },
  nextPromptBtn: { borderWidth: 1, padding: TOKENS.space.sm, borderRadius: TOKENS.radius.full, alignSelf: 'center' },
  nextPromptText: { fontSize: 14 },
  durationRow: { flexDirection: 'row', gap: TOKENS.space.sm, marginTop: TOKENS.space.xl },
  durationBtn: { paddingHorizontal: TOKENS.space.lg, paddingVertical: TOKENS.space.sm, borderRadius: TOKENS.radius.full, borderWidth: 1 },
  durationText: { fontSize: 14 },
  controls: { padding: TOKENS.space.lg, paddingBottom: 40 },
  mainBtn: { paddingVertical: TOKENS.space.md, borderRadius: TOKENS.radius.full, alignItems: 'center' },
  mainBtnText: { fontSize: 17, fontWeight: '600', letterSpacing: 0.5 },
  pausedControls: { flexDirection: 'row', gap: TOKENS.space.sm },
  endBtn: { borderWidth: 1, paddingHorizontal: TOKENS.space.lg, borderRadius: TOKENS.radius.full, justifyContent: 'center' },
  endBtnText: { fontSize: 14 },
})
