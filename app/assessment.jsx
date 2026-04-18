import { useState, useRef } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Animated, Dimensions, Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useUserState } from '../hooks/useUserState'
import { DEPTHS, TOKENS } from '../theme'
import {
  QUESTIONS, DEPTH_QUESTIONS, PHASES,
  buildFlatQuestions, calculateResult, TOTAL_QUESTIONS,
} from '../engine/assessment'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { KEYS } from '../data/schema'

const { width } = Dimensions.get('window')
const FLAT_QUESTIONS = buildFlatQuestions()

const SCORE_LABELS = ['Not me', 'Slightly', 'Mostly', 'Exactly me']

export default function Assessment() {
  const router = useRouter()
  const { update } = useUserState()
  const theme = DEPTHS.NIGREDO

  // Phase scores: { 1: 0, 2: 0, ... 7: 0 }
  const [phaseScores, setPhaseScores] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 })
  // Individual question answers: { "1_0": 2, ... }
  const [answers, setAnswers] = useState({})
  // Current question index (0-34), then depth question is index 35
  const [current, setCurrent] = useState(0)
  const [depthChoice, setDepthChoice] = useState(null)
  const [phase, setPhase] = useState('questions') // 'questions' | 'depth' | 'done'

  const progress = current / TOTAL_QUESTIONS
  const isDepth = phase === 'depth'
  const currentQ = FLAT_QUESTIONS[current]
  const currentPhaseInfo = currentQ ? PHASES[currentQ.phase] : null

  function answer(score) {
    if (phase !== 'questions') return
    const q = FLAT_QUESTIONS[current]
    const key = q.id

    setAnswers(prev => ({ ...prev, [key]: score }))
    setPhaseScores(prev => ({
      ...prev,
      [q.phase]: (prev[q.phase] || 0) + score,
    }))

    if (current < FLAT_QUESTIONS.length - 1) {
      setCurrent(c => c + 1)
    } else {
      setPhase('depth')
    }
  }

  async function submitDepth() {
    if (depthChoice === null) return

    const result = calculateResult(phaseScores, depthChoice)

    // Save assessment
    await AsyncStorage.setItem(KEYS.ASSESSMENT, JSON.stringify(result))

    // Update user state
    await update({
      onboarded: true,
      phase: result.phase,
      depth: result.depth,
      depthKey: result.depthKey,
      coordinates: result.coordinates,
      assessedAt: result.assessedAt,
    })

    router.replace({ pathname: '/result', params: { result: JSON.stringify(result) } })
  }

  if (phase === 'questions') {
    return (
      <View style={[styles.root, { backgroundColor: theme.bg }]}>
        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
          <View style={[styles.progressFill, {
            width: `${progress * 100}%`,
            backgroundColor: currentPhaseInfo?.colour || theme.accent,
          }]} />
        </View>

        {/* Phase indicator */}
        <View style={styles.phaseRow}>
          <Text style={[styles.phaseGlyph, { color: currentPhaseInfo?.colour || theme.glyph }]}>
            {currentPhaseInfo?.glyph}
          </Text>
          <Text style={[styles.phaseName, { color: theme.textDim }]}>
            {currentPhaseInfo?.name} — {current % 5 + 1}/5
          </Text>
          <Text style={[styles.counter, { color: theme.textDim }]}>
            {current + 1}/35
          </Text>
        </View>

        {/* Question */}
        <View style={styles.questionBlock}>
          <Text style={[styles.questionText, { color: theme.textBright }]}>
            {currentQ?.text}
          </Text>
        </View>

        {/* Score buttons */}
        <View style={styles.scoreRow}>
          {[0, 1, 2, 3].map(score => (
            <TouchableOpacity
              key={score}
              style={[
                styles.scoreBtn,
                { borderColor: theme.border, backgroundColor: theme.card },
                answers[currentQ?.id] === score && { borderColor: currentPhaseInfo?.colour || theme.accent, backgroundColor: theme.accentSoft },
              ]}
              onPress={() => answer(score)}
              activeOpacity={0.8}
            >
              <Text style={[styles.scoreNum, {
                color: answers[currentQ?.id] === score
                  ? (currentPhaseInfo?.colour || theme.accent)
                  : theme.textBright,
              }]}>
                {score}
              </Text>
              <Text style={[styles.scoreLabel, { color: theme.textDim }]}>
                {SCORE_LABELS[score]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Back */}
        {current > 0 && (
          <TouchableOpacity
            style={styles.back}
            onPress={() => {
              const prev = FLAT_QUESTIONS[current - 1]
              const prevScore = answers[prev.id] || 0
              setPhaseScores(ps => ({ ...ps, [prev.phase]: (ps[prev.phase] || 0) - prevScore }))
              setAnswers(a => { const n = { ...a }; delete n[prev.id]; return n })
              setCurrent(c => c - 1)
            }}
          >
            <Text style={[styles.backText, { color: theme.textDim }]}>← Back</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  // Depth question
  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
        <View style={[styles.progressFill, { width: '97%', backgroundColor: theme.accent }]} />
      </View>

      <ScrollView contentContainerStyle={styles.depthContainer}>
        <Text style={[styles.depthLabel, { color: theme.textDim }]}>Final question</Text>
        <Text style={[styles.depthHeading, { color: theme.textBright }]}>
          Which best describes the depth of what you're experiencing?
        </Text>

        {DEPTH_QUESTIONS.map((q, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.depthOption,
              { borderColor: theme.border, backgroundColor: theme.card },
              depthChoice === i && { borderColor: theme.accent, backgroundColor: theme.accentSoft },
            ]}
            onPress={() => setDepthChoice(i)}
            activeOpacity={0.8}
          >
            <View style={[styles.depthRadio, {
              borderColor: depthChoice === i ? theme.accent : theme.border,
            }]}>
              {depthChoice === i && (
                <View style={[styles.depthRadioFill, { backgroundColor: theme.accent }]} />
              )}
            </View>
            <Text style={[styles.depthOptionText, { color: theme.text }]}>
              {q.label}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: depthChoice !== null ? theme.accent : theme.border },
          ]}
          onPress={submitDepth}
          disabled={depthChoice === null}
          activeOpacity={0.8}
        >
          <Text style={[styles.submitText, { color: depthChoice !== null ? theme.bg : theme.textDim }]}>
            Find my coordinates →
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  progressTrack: { height: 2, width: '100%' },
  progressFill: { height: 2, transition: 'width 0.3s' },
  phaseRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: TOKENS.space.lg, paddingTop: TOKENS.space.xl, paddingBottom: TOKENS.space.sm,
    gap: TOKENS.space.sm,
  },
  phaseGlyph: { fontFamily: 'Courier New', fontSize: 20 },
  phaseName: { flex: 1, fontSize: 13, letterSpacing: 0.3 },
  counter: { fontSize: 13 },
  questionBlock: {
    flex: 1, justifyContent: 'center',
    paddingHorizontal: TOKENS.space.xl, paddingVertical: TOKENS.space.lg,
  },
  questionText: {
    fontFamily: 'Georgia', fontSize: 20, lineHeight: 30, textAlign: 'center', letterSpacing: 0.3,
  },
  scoreRow: {
    flexDirection: 'row', paddingHorizontal: TOKENS.space.md,
    gap: TOKENS.space.sm, paddingBottom: TOKENS.space.xl,
  },
  scoreBtn: {
    flex: 1, alignItems: 'center', paddingVertical: TOKENS.space.md,
    borderRadius: TOKENS.radius.lg, borderWidth: 1,
  },
  scoreNum: { fontSize: 22, fontWeight: '700', fontFamily: 'Courier New' },
  scoreLabel: { fontSize: 10, marginTop: 4, textAlign: 'center', letterSpacing: 0.3 },
  back: { position: 'absolute', top: 50, left: TOKENS.space.lg, padding: TOKENS.space.sm },
  backText: { fontSize: 14 },
  // Depth
  depthContainer: { padding: TOKENS.space.xl, paddingTop: TOKENS.space.xxl },
  depthLabel: { fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  depthHeading: { fontFamily: 'Georgia', fontSize: 20, lineHeight: 28, marginBottom: TOKENS.space.xl },
  depthOption: {
    flexDirection: 'row', alignItems: 'flex-start', gap: TOKENS.space.md,
    padding: TOKENS.space.lg, borderRadius: TOKENS.radius.lg,
    borderWidth: 1, marginBottom: TOKENS.space.sm,
  },
  depthRadio: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  depthRadioFill: { width: 10, height: 10, borderRadius: 5 },
  depthOptionText: { flex: 1, fontSize: 15, lineHeight: 22 },
  submitBtn: {
    marginTop: TOKENS.space.xl, paddingVertical: TOKENS.space.md,
    borderRadius: TOKENS.radius.full, alignItems: 'center',
  },
  submitText: { fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
})
