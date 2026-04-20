import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useUserState } from '../../hooks/useUserState'
import { DEPTHS, TOKENS, PHASE_COLOURS } from '../../theme'
import { PHASES, DEPTH_INFO } from '../../engine/assessment'
import { KEYS } from '../../data/schema'

export default function Spiral() {
  const router = useRouter()
  const { state } = useUserState()
  const theme = DEPTHS[state.depthKey || 'NIGREDO']
  const [assessments, setAssessments] = useState([])
  const [practiceLog, setPracticeLog] = useState([])
  const [streaks, setStreaks] = useState({ current: 0, longest: 0, totalSessions: 0, totalMinutes: 0 })

  useEffect(() => {
    async function load() {
      const aRaw = await AsyncStorage.getItem(KEYS.ASSESSMENT)
      if (aRaw) {
        // Current assessment
        const current = JSON.parse(aRaw)
        setAssessments([current]) // In v1 we only track current + history
      }
      const pRaw = await AsyncStorage.getItem(KEYS.PRACTICE_LOG)
      if (pRaw) setPracticeLog(JSON.parse(pRaw))
      const sRaw = await AsyncStorage.getItem(KEYS.STREAKS)
      if (sRaw) setStreaks(JSON.parse(sRaw))
    }
    load()
  }, [])

  const phaseColour = PHASE_COLOURS[state.phase || 1]?.colour || theme.accent
  const depthMeta = DEPTH_INFO[state.depth || 1]
  const phaseInfo = PHASES[state.phase || 1]

  // Build weekly practice summary
  const now = Date.now()
  const weekAgo = now - 7 * 86400000
  const thisWeek = practiceLog.filter(s => new Date(s.completedAt).getTime() > weekAgo)
  const weekMinutes = thisWeek.reduce((sum, s) => sum + Math.floor(s.duration / 60), 0)

  // Practice type breakdown
  const typeBreakdown = practiceLog.reduce((acc, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1
    return acc
  }, {})

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Text style={[styles.title, { color: theme.textBright }]}>Your Spiral</Text>
        <Text style={[styles.subtitle, { color: theme.textDim }]}>
          The journey is not a line. It spirals — deeper each time.
        </Text>

        {/* Current coordinates */}
        <View style={[styles.coordBlock, { backgroundColor: theme.card, borderColor: phaseColour }]}>
          <Text style={[styles.coordLabel, { color: theme.textDim }]}>Current coordinates</Text>
          <Text style={[styles.coordGlyph, { color: phaseColour }]}>{phaseInfo?.glyph}</Text>
          <Text style={[styles.coordPhase, { color: theme.textBright }]}>{phaseInfo?.name}</Text>
          <Text style={[styles.coordDepth, { color: theme.textDim }]}>
            {depthMeta?.symbol} {depthMeta?.name}
          </Text>
          <Text style={[styles.coordInterval, { color: theme.textDim }]}>{phaseInfo?.interval}</Text>
          {state.assessedAt && (
            <Text style={[styles.assessedDate, { color: theme.textDim }]}>
              Assessed {state.assessedAt.slice(0, 10)}
            </Text>
          )}
          <TouchableOpacity
            style={[styles.reassessBtn, { borderColor: theme.border }]}
            onPress={() => router.push('/assessment')}
          >
            <Text style={[styles.reassessBtnText, { color: theme.textDim }]}>Re-assess →</Text>
          </TouchableOpacity>
        </View>

        {/* Streak stats */}
        <View style={styles.statsGrid}>
          <StatCard label="Current streak" value={`${streaks.current}d`} colour={phaseColour} theme={theme} />
          <StatCard label="Longest streak" value={`${streaks.longest}d`} colour={theme.glyph} theme={theme} />
          <StatCard label="Total sessions" value={streaks.totalSessions} colour={phaseColour} theme={theme} />
          <StatCard label="Total minutes" value={streaks.totalMinutes} colour={theme.glyph} theme={theme} />
        </View>

        {/* This week */}
        <View style={[styles.weekBlock, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.weekLabel, { color: theme.textDim }]}>This week</Text>
          <Text style={[styles.weekMins, { color: phaseColour }]}>{weekMinutes}</Text>
          <Text style={[styles.weekUnit, { color: theme.textDim }]}>minutes of practice</Text>
          <Text style={[styles.weekSessions, { color: theme.textDim }]}>{thisWeek.length} sessions</Text>
        </View>

        {/* Practice breakdown */}
        {practiceLog.length > 0 && (
          <View style={[styles.breakdownBlock, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.breakdownLabel, { color: theme.textDim }]}>Practice types</Text>
            {Object.entries(typeBreakdown).map(([type, count]) => (
              <View key={type} style={styles.breakdownRow}>
                <Text style={[styles.breakdownType, { color: theme.text }]}>
                  {type.replace('_', ' ')}
                </Text>
                <View style={[styles.breakdownTrack, { backgroundColor: theme.border }]}>
                  <View style={[styles.breakdownFill, {
                    width: `${(count / practiceLog.length) * 100}%`,
                    backgroundColor: phaseColour,
                  }]} />
                </View>
                <Text style={[styles.breakdownCount, { color: theme.textDim }]}>{count}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Phase map — all 7 phases shown */}
        <View style={[styles.phaseMap, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.phaseMapLabel, { color: theme.textDim }]}>Seven phases</Text>
          <Text style={[styles.phaseMapSub, { color: theme.textDim }]}>
            You are not progressing through these. You are spiralling through them.
          </Text>
          {Object.entries(PHASES).map(([num, p]) => {
            const isCurrent = parseInt(num) === (state.phase || 1)
            const pColour = PHASE_COLOURS[parseInt(num)]?.colour || theme.glyph
            return (
              <View key={num} style={[styles.phaseRow, isCurrent && { opacity: 1 }, !isCurrent && { opacity: 0.4 }]}>
                <Text style={[styles.phaseGlyph, { color: pColour }]}>{p.glyph}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.phaseName, { color: isCurrent ? theme.textBright : theme.text }]}>
                    {p.name}
                    {isCurrent && <Text style={{ color: pColour }}> ◄ you are here</Text>}
                  </Text>
                  <Text style={[styles.phaseOp, { color: theme.textDim }]}>{p.operation}</Text>
                </View>
                <Text style={[styles.phaseInterval, { color: theme.textDim }]}>{p.interval.split(' ')[0]}</Text>
              </View>
            )
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  )
}

function StatCard({ label, value, colour, theme }) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.statValue, { color: colour, fontFamily: 'Courier New' }]}>{value}</Text>
      <Text style={[styles.statLabel2, { color: theme.textDim }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { padding: TOKENS.space.lg, paddingTop: 60 },
  title: { fontFamily: 'Georgia', fontSize: 24, letterSpacing: 1, marginBottom: 4 },
  subtitle: { fontSize: 13, lineHeight: 20, marginBottom: TOKENS.space.xl },
  coordBlock: { borderRadius: TOKENS.radius.xl, borderWidth: 1, padding: TOKENS.space.xl, alignItems: 'center', marginBottom: TOKENS.space.lg },
  coordLabel: { fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: TOKENS.space.md },
  coordGlyph: { fontFamily: 'Courier New', fontSize: 48, marginBottom: TOKENS.space.sm },
  coordPhase: { fontFamily: 'Georgia', fontSize: 24, letterSpacing: 1.5, marginBottom: 4 },
  coordDepth: { fontSize: 15, marginBottom: 4 },
  coordInterval: { fontSize: 13, marginBottom: TOKENS.space.sm },
  assessedDate: { fontSize: 11, marginBottom: TOKENS.space.md },
  reassessBtn: { borderWidth: 1, paddingHorizontal: TOKENS.space.lg, paddingVertical: TOKENS.space.xs, borderRadius: TOKENS.radius.full },
  reassessBtnText: { fontSize: 13 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: TOKENS.space.sm, marginBottom: TOKENS.space.lg },
  statCard: { width: '47%', borderWidth: 1, borderRadius: TOKENS.radius.lg, padding: TOKENS.space.md, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '700' },
  statLabel2: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginTop: 4, textAlign: 'center' },
  weekBlock: { borderWidth: 1, borderRadius: TOKENS.radius.lg, padding: TOKENS.space.lg, alignItems: 'center', marginBottom: TOKENS.space.lg },
  weekLabel: { fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: TOKENS.space.sm },
  weekMins: { fontFamily: 'Courier New', fontSize: 48, fontWeight: '700' },
  weekUnit: { fontSize: 13, marginTop: 4 },
  weekSessions: { fontSize: 13, marginTop: 2 },
  breakdownBlock: { borderWidth: 1, borderRadius: TOKENS.radius.lg, padding: TOKENS.space.lg, marginBottom: TOKENS.space.lg },
  breakdownLabel: { fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: TOKENS.space.md },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: TOKENS.space.sm, marginBottom: TOKENS.space.sm },
  breakdownType: { width: 90, fontSize: 13, textTransform: 'capitalize' },
  breakdownTrack: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  breakdownFill: { height: 4, borderRadius: 2 },
  breakdownCount: { fontSize: 13, width: 24, textAlign: 'right' },
  phaseMap: { borderWidth: 1, borderRadius: TOKENS.radius.lg, padding: TOKENS.space.lg, marginBottom: TOKENS.space.lg },
  phaseMapLabel: { fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
  phaseMapSub: { fontSize: 12, lineHeight: 18, marginBottom: TOKENS.space.lg },
  phaseRow: { flexDirection: 'row', alignItems: 'center', gap: TOKENS.space.md, marginBottom: TOKENS.space.md },
  phaseGlyph: { fontFamily: 'Courier New', fontSize: 20, width: 28 },
  phaseName: { fontSize: 14, fontWeight: '600' },
  phaseOp: { fontSize: 11, marginTop: 2 },
  phaseInterval: { fontSize: 11, fontFamily: 'Courier New' },
})
