import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useUserState } from '../../hooks/useUserState'
import { DEPTHS, TOKENS, PHASE_COLOURS } from '../../theme'
import { PHASES, DEPTH_INFO, PROTOCOL_MAP } from '../../engine/assessment'
import { getDoorGreeting } from '../../engine/doors'
import { getDailyWisdom } from '../../engine/wisdom'
import { KEYS } from '../../data/schema'

export default function Home() {
  const router = useRouter()
  const { state } = useUserState()
  const [streaks, setStreaks] = useState({ current: 0, totalSessions: 0 })
  const [wisdom, setWisdom] = useState(null)

  const theme = DEPTHS[state.depthKey || 'NIGREDO']
  const phaseInfo = PHASES[state.phase || 1]
  const depthMeta = DEPTH_INFO[state.depth || 1]
  const phaseColour = PHASE_COLOURS[state.phase || 1]?.colour || theme.accent
  const practice = PROTOCOL_MAP[state.phase || 1]
  const greeting = getDoorGreeting(state.door || 'SEEKER')

  useEffect(() => {
    async function load() {
      const raw = await AsyncStorage.getItem(KEYS.STREAKS)
      if (raw) setStreaks(JSON.parse(raw))

      const w = getDailyWisdom(state.phase || 1, state.door || 'SEEKER')
      setWisdom(w)
    }
    load()
  }, [state.phase, state.door])

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Door greeting */}
        <Text style={[styles.greeting, { color: theme.textDim }]}>{greeting}</Text>

        {/* Phase coordinates */}
        <View style={styles.coordRow}>
          <Text style={[styles.phaseGlyph, { color: phaseColour }]}>
            {phaseInfo?.glyph}
          </Text>
          <View>
            <Text style={[styles.phaseName, { color: theme.textBright }]}>
              {phaseInfo?.name}
            </Text>
            <Text style={[styles.depthName, { color: theme.textDim }]}>
              {depthMeta?.symbol} {depthMeta?.name}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.reassessBtn, { borderColor: theme.border }]}
            onPress={() => router.push('/assessment')}
          >
            <Text style={[styles.reassessBtnText, { color: theme.textDim }]}>Re-assess</Text>
          </TouchableOpacity>
        </View>

        {/* Daily wisdom card */}
        {wisdom && (
          <View style={[styles.wisdomCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.wisdomLabel, { color: theme.textDim }]}>Today's transmission</Text>
            <Text style={[styles.wisdomText, { color: theme.text }]}>
              "{wisdom.text}"
            </Text>
            {wisdom.source && (
              <Text style={[styles.wisdomSource, { color: theme.textDim }]}>
                — {wisdom.source}
              </Text>
            )}
          </View>
        )}

        {/* Quick action — today's practice */}
        <Text style={[styles.sectionLabel, { color: theme.textDim }]}>Your practice</Text>
        <TouchableOpacity
          style={[styles.practiceCard, { backgroundColor: theme.accentSoft, borderColor: theme.accent }]}
          onPress={() => router.push(`/practice/${practice?.type}?variant=${practice?.variant}`)}
          activeOpacity={0.85}
        >
          <View style={styles.practiceCardInner}>
            <Text style={[styles.practiceCardGlyph, { color: theme.accent }]}>
              {phaseInfo?.glyph}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.practiceCardName, { color: theme.accent }]}>
                {practice?.label}
              </Text>
              <Text style={[styles.practiceCardSub, { color: theme.textDim }]}>
                Phase {state.phase} · {phaseInfo?.operation}
              </Text>
            </View>
            <Text style={{ color: theme.accent, fontSize: 20 }}>→</Text>
          </View>
        </TouchableOpacity>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatBlock label="Streak" value={`${streaks.current}d`} theme={theme} />
          <StatBlock label="Sessions" value={streaks.totalSessions} theme={theme} />
          <StatBlock label="Phase" value={state.phase || '—'} theme={theme} colour={phaseColour} />
        </View>

        {/* Quick links */}
        <Text style={[styles.sectionLabel, { color: theme.textDim }]}>Explore</Text>
        <View style={styles.quickGrid}>
          <QuickLink label="The Map" glyph="✧" theme={theme} onPress={() => router.push('/(tabs)/map')} />
          <QuickLink label="Journal" glyph="≋" theme={theme} onPress={() => router.push('/(tabs)/journal')} />
          <QuickLink label="The Guide" glyph="Ψ" theme={theme} onPress={() => router.push('/guide')} />
          <QuickLink label="Threshold" glyph="⟟" theme={theme} onPress={() => router.push('/threshold')} colour="#7060A0" />
        </View>

      </ScrollView>
    </View>
  )
}

function StatBlock({ label, value, theme, colour }) {
  return (
    <View style={[styles.statBlock, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.statValue, { color: colour || theme.accent }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textDim }]}>{label}</Text>
    </View>
  )
}

function QuickLink({ label, glyph, theme, onPress, colour }) {
  return (
    <TouchableOpacity
      style={[styles.quickCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.quickGlyph, { color: colour || theme.glyph }]}>{glyph}</Text>
      <Text style={[styles.quickLabel, { color: theme.text }]}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { padding: TOKENS.space.lg, paddingTop: 60, paddingBottom: 100 },
  greeting: { fontSize: 13, letterSpacing: 0.5, marginBottom: TOKENS.space.sm },
  coordRow: {
    flexDirection: 'row', alignItems: 'center', gap: TOKENS.space.md,
    marginBottom: TOKENS.space.xl,
  },
  phaseGlyph: { fontFamily: 'Courier New', fontSize: 40 },
  phaseName: { fontFamily: 'Georgia', fontSize: 22, letterSpacing: 1 },
  depthName: { fontSize: 13, marginTop: 2 },
  reassessBtn: {
    marginLeft: 'auto', borderWidth: 1, borderRadius: TOKENS.radius.full,
    paddingHorizontal: TOKENS.space.md, paddingVertical: TOKENS.space.xs,
  },
  reassessBtnText: { fontSize: 12, letterSpacing: 0.3 },
  wisdomCard: {
    borderRadius: TOKENS.radius.lg, borderWidth: 1,
    padding: TOKENS.space.lg, marginBottom: TOKENS.space.xl,
  },
  wisdomLabel: { fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: TOKENS.space.sm },
  wisdomText: { fontFamily: 'Georgia', fontSize: 17, lineHeight: 26, fontStyle: 'italic' },
  wisdomSource: { fontSize: 12, marginTop: TOKENS.space.sm, textAlign: 'right' },
  sectionLabel: { fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: TOKENS.space.sm },
  practiceCard: {
    borderRadius: TOKENS.radius.lg, borderWidth: 1,
    padding: TOKENS.space.lg, marginBottom: TOKENS.space.xl,
  },
  practiceCardInner: { flexDirection: 'row', alignItems: 'center', gap: TOKENS.space.md },
  practiceCardGlyph: { fontFamily: 'Courier New', fontSize: 28 },
  practiceCardName: { fontSize: 17, fontWeight: '600' },
  practiceCardSub: { fontSize: 13, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: TOKENS.space.sm, marginBottom: TOKENS.space.xl },
  statBlock: {
    flex: 1, alignItems: 'center', padding: TOKENS.space.md,
    borderRadius: TOKENS.radius.lg, borderWidth: 1,
  },
  statValue: { fontFamily: 'Courier New', fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: TOKENS.space.sm },
  quickCard: {
    width: '47%', padding: TOKENS.space.lg, borderRadius: TOKENS.radius.lg,
    borderWidth: 1, alignItems: 'center', gap: TOKENS.space.sm,
  },
  quickGlyph: { fontFamily: 'Courier New', fontSize: 28 },
  quickLabel: { fontSize: 13, fontWeight: '500' },
})
