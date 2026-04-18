import { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Linking } from 'react-native'
import { useRouter } from 'expo-router'
import { TOKENS } from '../theme'

// Threshold uses its own palette — always dark, always grounded
// Never changes with depth. This is the floor, not the framework.
const T = {
  bg: '#080810',
  surface: '#0F0F1C',
  card: '#141428',
  border: '#1E1E38',
  text: '#B8B4C8',
  textBright: '#E0DCF0',
  textDim: '#5A5870',
  accent: '#7060A0',    // soft violet — not alarm, not urgency, grounded
  breathIn: '#4A4070',
  breathHold: '#6A5A90',
  breathOut: '#3A3060',
}

const CRISIS_LINES = [
  { country: 'NZ',   name: '1737',          number: '1737',              desc: 'Free to call or text, 24/7' },
  { country: 'NZ',   name: 'Lifeline NZ',   number: '0800-543-354',      desc: 'Free 24/7 crisis support' },
  { country: 'AU',   name: 'Lifeline AU',   number: '13-11-14',          desc: '24/7 crisis support' },
  { country: 'AU',   name: 'Beyond Blue',   number: '1300-22-4636',      desc: '24/7, anxiety, depression' },
  { country: 'UK',   name: 'Samaritans',    number: '116-123',           desc: 'Free 24/7' },
  { country: 'US',   name: '988 Lifeline',  number: '988',               desc: 'Mental health crisis, 24/7' },
  { country: 'INTL', name: 'Find A Line',   url: 'https://findahelpline.com', desc: 'International directory' },
]

const BOX_PHASES = [
  { label: 'Breathe in',  duration: 4000, colour: T.breathIn },
  { label: 'Hold',        duration: 4000, colour: T.breathHold },
  { label: 'Breathe out', duration: 4000, colour: T.breathOut },
  { label: 'Hold',        duration: 4000, colour: T.accent },
]

export default function Threshold() {
  const router = useRouter()
  const [breathActive, setBreathActive] = useState(false)
  const [breathPhaseIdx, setBreathPhaseIdx] = useState(0)
  const [countdown, setCountdown] = useState(4)
  const breathAnim = useRef(new Animated.Value(0.3)).current
  const timerRef = useRef(null)
  const countRef = useRef(null)

  function startBreath() {
    setBreathActive(true)
    runBreathPhase(0)
  }

  function stopBreath() {
    setBreathActive(false)
    clearTimeout(timerRef.current)
    clearInterval(countRef.current)
    Animated.timing(breathAnim, { toValue: 0.3, duration: 400, useNativeDriver: true }).start()
  }

  function runBreathPhase(idx) {
    const phase = BOX_PHASES[idx % BOX_PHASES.length]
    setBreathPhaseIdx(idx % BOX_PHASES.length)
    setCountdown(4)

    // Circle animation
    const toValue = (idx % 4 === 0 || idx % 4 === 1) ? 1 : 0.3
    Animated.timing(breathAnim, {
      toValue,
      duration: phase.duration - 100,
      useNativeDriver: true,
    }).start()

    // Countdown
    let c = 4
    countRef.current = setInterval(() => {
      c -= 1
      setCountdown(c)
      if (c <= 0) clearInterval(countRef.current)
    }, 1000)

    timerRef.current = setTimeout(() => {
      runBreathPhase(idx + 1)
    }, phase.duration)
  }

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current)
      clearInterval(countRef.current)
    }
  }, [])

  const currentBreathPhase = BOX_PHASES[breathPhaseIdx]

  function call(line) {
    if (line.url) {
      Linking.openURL(line.url)
    } else {
      Linking.openURL(`tel:${line.number.replace(/-/g, '')}`)
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: T.bg }]}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Header */}
        <Text style={[styles.heading, { color: T.textBright }]}>
          You found this page.
        </Text>
        <Text style={[styles.subheading, { color: T.text }]}>
          That means something is happening.
        </Text>
        <Text style={[styles.body, { color: T.textDim }]}>
          You don't have to explain it. You don't have to figure it out right now.
          Just stay here for a moment.
        </Text>

        {/* Box breathing */}
        <View style={[styles.breathBlock, { backgroundColor: T.surface, borderColor: T.border }]}>
          <Text style={[styles.breathTitle, { color: T.text }]}>
            Box breathing — 4 · 4 · 4 · 4
          </Text>
          <Text style={[styles.breathDesc, { color: T.textDim }]}>
            In for 4. Hold 4. Out for 4. Hold 4.{'\n'}This activates your parasympathetic nervous system.
          </Text>

          {/* Breathing circle */}
          <View style={styles.circleContainer}>
            <Animated.View style={[
              styles.circle,
              {
                borderColor: breathActive ? (currentBreathPhase?.colour || T.accent) : T.border,
                transform: [{ scale: breathAnim }],
                opacity: breathActive ? 1 : 0.3,
              },
            ]} />
            {breathActive && (
              <View style={styles.circleLabel}>
                <Text style={[styles.breathPhaseLabel, { color: T.textBright }]}>
                  {currentBreathPhase?.label}
                </Text>
                <Text style={[styles.countdownText, { color: T.accent }]}>
                  {countdown}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.breathBtn, { backgroundColor: breathActive ? T.card : T.accent }]}
            onPress={breathActive ? stopBreath : startBreath}
            activeOpacity={0.8}
          >
            <Text style={[styles.breathBtnText, { color: breathActive ? T.textDim : T.bg }]}>
              {breathActive ? 'Stop' : 'Start breathing'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Three things */}
        <View style={[styles.threeBlock, { backgroundColor: T.surface, borderColor: T.border }]}>
          <Text style={[styles.threeTitle, { color: T.text }]}>Three things to do right now</Text>
          {[
            'Name where you are physically. The room. The chair. The floor.',
            'Take one breath — just one. In through the nose, out through the mouth.',
            'You do not need to solve anything in the next five minutes.',
          ].map((step, i) => (
            <View key={i} style={styles.threeRow}>
              <Text style={[styles.threeNum, { color: T.accent }]}>{i + 1}</Text>
              <Text style={[styles.threeText, { color: T.text }]}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Crisis lines */}
        <Text style={[styles.crisisTitle, { color: T.textDim }]}>
          If you need a human voice
        </Text>
        {CRISIS_LINES.map((line, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.crisisLine, { backgroundColor: T.surface, borderColor: T.border }]}
            onPress={() => call(line)}
            activeOpacity={0.8}
          >
            <View>
              <Text style={[styles.crisisName, { color: T.textBright }]}>{line.name}</Text>
              <Text style={[styles.crisisDesc, { color: T.textDim }]}>{line.desc}</Text>
            </View>
            <Text style={[styles.crisisNumber, { color: T.accent }]}>
              {line.url ? 'Open →' : line.number}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Footnote */}
        <Text style={[styles.footnote, { color: T.textDim }]}>
          You are not alone in this. The mathematics of the framework guarantees
          that transformation is possible from every phase. Even this one.
          Especially this one.
        </Text>

        {/* Back */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Text style={[styles.backText, { color: T.textDim }]}>← Return</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { padding: TOKENS.space.xl, paddingTop: TOKENS.space.xxl, paddingBottom: 80 },
  heading: { fontFamily: 'Georgia', fontSize: 28, lineHeight: 36, marginBottom: 8 },
  subheading: { fontSize: 18, lineHeight: 26, marginBottom: TOKENS.space.lg },
  body: { fontSize: 15, lineHeight: 24, marginBottom: TOKENS.space.xl },

  breathBlock: { borderRadius: TOKENS.radius.lg, borderWidth: 1, padding: TOKENS.space.lg, marginBottom: TOKENS.space.xl },
  breathTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  breathDesc: { fontSize: 13, lineHeight: 20, marginBottom: TOKENS.space.lg },
  circleContainer: { alignItems: 'center', justifyContent: 'center', height: 160, marginBottom: TOKENS.space.lg },
  circle: {
    width: 100, height: 100, borderRadius: 50, borderWidth: 2,
    position: 'absolute',
  },
  circleLabel: { alignItems: 'center' },
  breathPhaseLabel: { fontSize: 14, letterSpacing: 0.5 },
  countdownText: { fontSize: 32, fontWeight: '700', fontFamily: 'Courier New' },
  breathBtn: {
    paddingVertical: TOKENS.space.md, borderRadius: TOKENS.radius.full,
    alignItems: 'center',
  },
  breathBtnText: { fontSize: 15, fontWeight: '600' },

  threeBlock: { borderRadius: TOKENS.radius.lg, borderWidth: 1, padding: TOKENS.space.lg, marginBottom: TOKENS.space.xl },
  threeTitle: { fontSize: 15, fontWeight: '600', marginBottom: TOKENS.space.md },
  threeRow: { flexDirection: 'row', gap: TOKENS.space.md, marginBottom: TOKENS.space.md },
  threeNum: { fontSize: 18, fontWeight: '700', fontFamily: 'Courier New', width: 24 },
  threeText: { flex: 1, fontSize: 15, lineHeight: 22 },

  crisisTitle: { fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: TOKENS.space.sm },
  crisisLine: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: TOKENS.space.md, borderRadius: TOKENS.radius.md,
    borderWidth: 1, marginBottom: TOKENS.space.sm,
  },
  crisisName: { fontSize: 15, fontWeight: '600' },
  crisisDesc: { fontSize: 12, marginTop: 2 },
  crisisNumber: { fontSize: 15, fontFamily: 'Courier New' },

  footnote: { fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: TOKENS.space.xl, fontStyle: 'italic', fontFamily: 'Georgia' },
  backBtn: { marginTop: TOKENS.space.xl, padding: TOKENS.space.sm, alignSelf: 'flex-start' },
  backText: { fontSize: 14 },
})
