import { useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { DEPTHS, TOKENS, PHASE_COLOURS } from '../theme'
import { PHASES, DEPTH_INFO, PROTOCOL_MAP } from '../engine/assessment'

export default function Result() {
  const router = useRouter()
  const { result: resultStr } = useLocalSearchParams()
  const result = resultStr ? JSON.parse(resultStr) : null

  const fadeAnim = useRef(new Animated.Value(0)).current
  const glyphScale = useRef(new Animated.Value(0.3)).current

  const theme = DEPTHS[result?.depthKey || 'NIGREDO']
  const phaseColour = PHASE_COLOURS[result?.phase || 1]?.colour || theme.accent

  useEffect(() => {
    Animated.sequence([
      Animated.timing(glyphScale, { toValue: 1.2, duration: 600, useNativeDriver: true }),
      Animated.timing(glyphScale, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start()
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, delay: 400, useNativeDriver: true }).start()
  }, [])

  if (!result) return null

  const practice = PROTOCOL_MAP[result.phase]
  const depth = DEPTH_INFO[result.depth]

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Coordinates header */}
        <View style={styles.coordBlock}>
          <Text style={[styles.coordLabel, { color: theme.textDim }]}>Your coordinates</Text>

          <Animated.Text style={[styles.glyph, { color: phaseColour, transform: [{ scale: glyphScale }] }]}>
            {result.phaseGlyph}
          </Animated.Text>

          <Text style={[styles.phaseName, { color: theme.textBright }]}>
            {result.phaseName}
          </Text>

          <Text style={[styles.depthTag, { color: depth?.symbol && theme.textDim }]}>
            {depth?.symbol} {depth?.name} — {depth?.desc}
          </Text>

          <Text style={[styles.interval, { color: theme.textDim }]}>
            {result.phaseInterval} · {result.phaseNote}
          </Text>
        </View>

        {/* Transition note */}
        {result.isTransitioning && (
          <View style={[styles.transitionNote, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.transitionText, { color: theme.textDim }]}>
              You scored equally on {result.tiedPhases?.map(p => PHASES[p]?.name).join(' and ')}.
              You may be moving between phases. Both are true.
            </Text>
          </View>
        )}

        <Animated.View style={{ opacity: fadeAnim }}>
          {/* What this phase feels like */}
          <Text style={[styles.descriptionText, { color: theme.text }]}>
            {result.phaseDescription}
          </Text>

          {/* Score bars */}
          <View style={[styles.scoreBlock, { backgroundColor: theme.card }]}>
            <Text style={[styles.scoreTitle, { color: theme.textDim }]}>Phase map</Text>
            {Object.entries(result.scores).map(([phase, score]) => {
              const p = PHASES[parseInt(phase)]
              const pColour = PHASE_COLOURS[parseInt(phase)]?.colour || theme.accent
              const isHighest = parseInt(phase) === result.phase
              return (
                <View key={phase} style={styles.scoreRow}>
                  <Text style={[styles.scoreGlyph, { color: pColour }]}>{p?.glyph}</Text>
                  <Text style={[styles.scorePhaseName, { color: isHighest ? theme.textBright : theme.textDim }]}>
                    {p?.name}
                  </Text>
                  <View style={[styles.scoreTrack, { backgroundColor: theme.border }]}>
                    <View style={[styles.scoreFill, {
                      width: `${(score / 15) * 100}%`,
                      backgroundColor: isHighest ? pColour : theme.border,
                    }]} />
                  </View>
                  <Text style={[styles.scoreNum, { color: isHighest ? pColour : theme.textDim }]}>
                    {score}
                  </Text>
                  {isHighest && <Text style={{ color: pColour, fontSize: 12 }}>◄</Text>}
                </View>
              )
            })}
          </View>

          {/* Recommended practice */}
          <View style={[styles.practiceBlock, { backgroundColor: theme.accentSoft, borderColor: theme.accent }]}>
            <Text style={[styles.practiceLabel, { color: theme.textDim }]}>Recommended practice</Text>
            <Text style={[styles.practiceName, { color: theme.accent }]}>
              → {practice?.label}
            </Text>
          </View>

          {/* Nigredo warning */}
          {result.isNigredo && (
            <View style={[styles.nigredoBlock, { backgroundColor: '#1A0A0A', borderColor: '#401818' }]}>
              <Text style={[styles.nigredoText, { color: '#C07070' }]}>
                ⚫ You are at Nigredo depth — the fire is total.{'\n'}
                If you are in crisis, touch below.
              </Text>
              <TouchableOpacity
                style={[styles.thresholdBtn, { borderColor: '#C07070' }]}
                onPress={() => router.push('/threshold')}
              >
                <Text style={{ color: '#C07070', fontSize: 14 }}>Open The Threshold →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Enter the school */}
          <TouchableOpacity
            style={[styles.enterBtn, { backgroundColor: phaseColour }]}
            onPress={() => router.replace('/(tabs)/home')}
            activeOpacity={0.85}
          >
            <Text style={[styles.enterText, { color: theme.bg }]}>
              Enter the school →
            </Text>
          </TouchableOpacity>

          <Text style={[styles.footnote, { color: theme.textDim }]}>
            Re-assess in 2–4 weeks. The school tracks your spiral.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { padding: TOKENS.space.xl, paddingTop: TOKENS.space.xxl, paddingBottom: 80 },
  coordBlock: { alignItems: 'center', marginBottom: TOKENS.space.xl },
  coordLabel: { fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: TOKENS.space.md },
  glyph: { fontFamily: 'Courier New', fontSize: 72, marginBottom: TOKENS.space.md },
  phaseName: { fontFamily: 'Georgia', fontSize: 32, letterSpacing: 2, marginBottom: TOKENS.space.sm },
  depthTag: { fontSize: 15, marginBottom: 4 },
  interval: { fontSize: 13, letterSpacing: 0.5 },
  transitionNote: {
    padding: TOKENS.space.md, borderRadius: TOKENS.radius.md,
    borderWidth: 1, marginBottom: TOKENS.space.lg,
  },
  transitionText: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  descriptionText: {
    fontFamily: 'Georgia', fontSize: 17, lineHeight: 28, textAlign: 'center',
    marginBottom: TOKENS.space.xl, fontStyle: 'italic',
  },
  scoreBlock: { borderRadius: TOKENS.radius.lg, padding: TOKENS.space.lg, marginBottom: TOKENS.space.md },
  scoreTitle: { fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: TOKENS.space.md },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  scoreGlyph: { fontFamily: 'Courier New', fontSize: 14, width: 28 },
  scorePhaseName: { fontSize: 12, width: 60 },
  scoreTrack: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  scoreFill: { height: 4, borderRadius: 2 },
  scoreNum: { fontSize: 12, width: 20, textAlign: 'right' },
  practiceBlock: {
    padding: TOKENS.space.md, borderRadius: TOKENS.radius.md,
    borderWidth: 1, marginBottom: TOKENS.space.md,
  },
  practiceLabel: { fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 },
  practiceName: { fontSize: 16, fontWeight: '600' },
  nigredoBlock: {
    padding: TOKENS.space.lg, borderRadius: TOKENS.radius.md,
    borderWidth: 1, marginBottom: TOKENS.space.lg,
  },
  nigredoText: { fontSize: 14, lineHeight: 22, marginBottom: TOKENS.space.md },
  thresholdBtn: { borderWidth: 1, padding: TOKENS.space.sm, borderRadius: TOKENS.radius.sm, alignSelf: 'flex-start' },
  enterBtn: {
    paddingVertical: TOKENS.space.md, borderRadius: TOKENS.radius.full,
    alignItems: 'center', marginTop: TOKENS.space.xl, marginBottom: TOKENS.space.md,
  },
  enterText: { fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
  footnote: { textAlign: 'center', fontSize: 13, lineHeight: 20 },
})
