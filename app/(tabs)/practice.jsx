import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useUserState } from '../../hooks/useUserState'
import { DEPTHS, TOKENS, PHASE_COLOURS } from '../../theme'
import { PHASES, PROTOCOL_MAP } from '../../engine/assessment'
import { SUBJECTS, getSubjectsByDomain } from '../../data/subjects'

const QUICK_PRACTICES = [
  { type: 'breathwork', variant: 'box',         label: 'Box Breathing',       glyph: '⟟', mins: '4–20' },
  { type: 'breathwork', variant: 'coherent',    label: 'Coherent Breathing',  glyph: '≋', mins: '5–15' },
  { type: 'breathwork', variant: '478',         label: '4-7-8 Breathing',     glyph: '✧', mins: '5' },
  { type: 'mindfulness', variant: 'focused',    label: 'Focused Attention',   glyph: 'Ψ', mins: '5–30' },
  { type: 'mindfulness', variant: 'open',       label: 'Open Monitoring',     glyph: '|◁▷|', mins: '5–30' },
  { type: 'shadow_work', variant: 'journaling', label: 'Shadow Journaling',   glyph: '∇cas', mins: '15–30' },
  { type: 'shadow_work', variant: 'integration',label: 'Integration Review',  glyph: 'Ωheal', mins: '20' },
]

export default function Practice() {
  const router = useRouter()
  const { state } = useUserState()
  const theme = DEPTHS[state.depthKey || 'NIGREDO']
  const phaseColour = PHASE_COLOURS[state.phase || 1]?.colour || theme.accent
  const phaseInfo = PHASES[state.phase || 1]
  const recommended = PROTOCOL_MAP[state.phase || 1]

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.textBright }]}>Practice</Text>

        {/* Phase recommendation */}
        <View style={[styles.recommendedCard, { backgroundColor: theme.accentSoft, borderColor: theme.accent }]}>
          <Text style={[styles.recLabel, { color: theme.textDim }]}>Phase {state.phase} · {phaseInfo?.name}</Text>
          <Text style={[styles.recName, { color: theme.accent }]}>
            Recommended: {recommended?.label}
          </Text>
          <Text style={[styles.recOp, { color: theme.textDim }]}>{phaseInfo?.operation}</Text>
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: theme.accent }]}
            onPress={() => router.push(`/practice/${recommended?.type}?variant=${recommended?.variant}`)}
            activeOpacity={0.85}
          >
            <Text style={[styles.startBtnText, { color: theme.bg }]}>Begin now →</Text>
          </TouchableOpacity>
        </View>

        {/* All practices */}
        <Text style={[styles.sectionLabel, { color: theme.textDim }]}>All practices</Text>
        <View style={styles.practiceGrid}>
          {QUICK_PRACTICES.map(p => (
            <TouchableOpacity
              key={`${p.type}_${p.variant}`}
              style={[styles.practiceCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => router.push(`/practice/${p.type}?variant=${p.variant}`)}
              activeOpacity={0.8}
            >
              <Text style={[styles.practiceGlyph, { color: theme.glyph, fontFamily: 'Courier New' }]}>{p.glyph}</Text>
              <Text style={[styles.practiceName, { color: theme.textBright }]}>{p.label}</Text>
              <Text style={[styles.practiceMins, { color: theme.textDim }]}>{p.mins} min</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { padding: TOKENS.space.lg, paddingTop: 60 },
  title: { fontFamily: 'Georgia', fontSize: 24, letterSpacing: 1, marginBottom: TOKENS.space.xl },
  recommendedCard: { borderRadius: TOKENS.radius.xl, borderWidth: 1, padding: TOKENS.space.xl, marginBottom: TOKENS.space.xl },
  recLabel: { fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
  recName: { fontSize: 20, fontWeight: '600', marginBottom: 4 },
  recOp: { fontSize: 13, marginBottom: TOKENS.space.lg },
  startBtn: { paddingVertical: TOKENS.space.md, borderRadius: TOKENS.radius.full, alignItems: 'center' },
  startBtnText: { fontSize: 16, fontWeight: '600' },
  sectionLabel: { fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: TOKENS.space.sm },
  practiceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: TOKENS.space.sm },
  practiceCard: {
    width: '47%', padding: TOKENS.space.lg, borderRadius: TOKENS.radius.lg,
    borderWidth: 1, alignItems: 'center', gap: 6,
  },
  practiceGlyph: { fontSize: 28 },
  practiceName: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
  practiceMins: { fontSize: 11, textAlign: 'center' },
})
