import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useUserState } from '../../hooks/useUserState'
import { DEPTHS, TOKENS, PHASE_COLOURS } from '../../theme'
import { PHASES } from '../../engine/assessment'
import { getSubjectById, getSubjectById as getS, LAYER, getPrerequisiteChain } from '../../data/subjects'
import { KEYS } from '../../data/schema'

const LAYER_COLOURS = { foundation: '#C9A84C', middle: '#7CB5C4', edge: '#8888CC' }
const LAYER_SYMBOLS = { foundation: '●', middle: '◐', edge: '○' }

export default function SubjectDetail() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const { state } = useUserState()
  const theme = DEPTHS[state.depthKey || 'NIGREDO']
  const [progress, setProgress] = useState({})
  const [started, setStarted] = useState(false)

  const subject = getSubjectById(id)

  useEffect(() => {
    AsyncStorage.getItem(KEYS.PROGRESS).then(raw => {
      if (raw) {
        const p = JSON.parse(raw)
        setProgress(p)
        if (p[id]) setStarted(true)
      }
    })
  }, [id])

  if (!subject) {
    return (
      <View style={[styles.root, { backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: theme.textDim }}>Subject not found</Text>
      </View>
    )
  }

  const layerColour = LAYER_COLOURS[subject.layer] || theme.accent
  const phaseInfo = PHASES[subject.phase]
  const phaseColour = PHASE_COLOURS[subject.phase]?.colour || theme.accent
  const isComplete = progress[id]?.status === 'complete'
  const prereqChain = getPrerequisiteChain(id)
  const completedIds = Object.entries(progress).filter(([, v]) => v?.status === 'complete').map(([k]) => k)
  const prereqsMet = subject.prerequisites.every(p => completedIds.includes(p))

  const hasWarning = subject.contraindications && (
    subject.contraindications.includes('⚠️') ||
    subject.contraindications.toLowerCase().includes('crisis') ||
    subject.contraindications.toLowerCase().includes('life-threatening')
  )

  async function markStarted() {
    const updated = {
      ...progress,
      [id]: { status: 'in_progress', startedAt: new Date().toISOString(), practiceCount: 0 },
    }
    setProgress(updated)
    setStarted(true)
    await AsyncStorage.setItem(KEYS.PROGRESS, JSON.stringify(updated))
  }

  async function markComplete() {
    const current = progress[id] || {}
    const updated = {
      ...progress,
      [id]: { ...current, status: 'complete', completedAt: new Date().toISOString() },
    }
    setProgress(updated)
    await AsyncStorage.setItem(KEYS.PROGRESS, JSON.stringify(updated))
  }

  function startPractice() {
    if (!subject.practiceType || subject.practiceType === 'study') return
    router.push(`/practice/${subject.practiceType}?subjectId=${id}`)
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={[styles.backText, { color: theme.textDim }]}>← Map</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.headerBlock}>
          <View style={styles.layerRow}>
            <Text style={[styles.layerSymbol, { color: layerColour }]}>
              {LAYER_SYMBOLS[subject.layer]}
            </Text>
            <Text style={[styles.layerName, { color: layerColour }]}>
              {subject.layer.charAt(0).toUpperCase() + subject.layer.slice(1)} Layer
            </Text>
            <Text style={[styles.pi, { color: theme.textDim, fontFamily: 'Courier New' }]}>
              Π {subject.pi.toFixed(2)}
            </Text>
          </View>

          <Text style={[styles.subjectName, { color: theme.textBright }]}>
            {subject.name}
          </Text>

          <Text style={[styles.domain, { color: theme.textDim }]}>{subject.domain}</Text>

          <View style={styles.metaRow}>
            <Text style={[styles.metaChip, { borderColor: phaseColour, color: phaseColour }]}>
              {phaseInfo?.glyph} Phase {subject.phase} · {phaseInfo?.name}
            </Text>
            <Text style={[styles.metaChip, { borderColor: theme.border, color: theme.textDim }]}>
              {subject.lamague}
            </Text>
          </View>
        </View>

        {/* Warning block */}
        {hasWarning && (
          <View style={[styles.warningBlock, { backgroundColor: '#1A0808', borderColor: '#601010' }]}>
            <Text style={{ color: '#C07070', fontSize: 14, lineHeight: 22 }}>
              ⚠️ {subject.contraindications}
            </Text>
          </View>
        )}

        {/* Main content */}
        <InfoBlock label="About" content={subject.notes} theme={theme} />
        <InfoBlock label="Experiment protocol" content={subject.experiment} theme={theme} />

        {!hasWarning && subject.contraindications && (
          <InfoBlock label="Contraindications" content={subject.contraindications} theme={theme} />
        )}

        {/* Prerequisites */}
        {subject.prerequisites.length > 0 && (
          <View style={[styles.infoBlock, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.infoLabel, { color: theme.textDim }]}>Prerequisites</Text>
            {subject.prerequisites.map(prereqId => {
              const p = getSubjectById(prereqId)
              const isDone = completedIds.includes(prereqId)
              return (
                <TouchableOpacity
                  key={prereqId}
                  style={styles.prereqRow}
                  onPress={() => router.push(`/subject/${prereqId}`)}
                >
                  <Text style={[styles.prereqStatus, { color: isDone ? '#88CC88' : theme.textDim }]}>
                    {isDone ? '✓' : '○'}
                  </Text>
                  <Text style={[styles.prereqName, { color: isDone ? theme.text : theme.textDim }]}>
                    {p?.name || prereqId}
                  </Text>
                  <Text style={[styles.prereqArrow, { color: theme.textDim }]}>→</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsBlock}>
          {!prereqsMet && (
            <Text style={[styles.lockedNote, { color: theme.textDim }]}>
              Complete prerequisites to unlock this subject.
            </Text>
          )}

          {prereqsMet && !started && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: layerColour }]}
              onPress={markStarted}
            >
              <Text style={[styles.actionBtnText, { color: theme.bg }]}>Begin this subject</Text>
            </TouchableOpacity>
          )}

          {started && subject.practiceType && subject.practiceType !== 'study' && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: phaseColour }]}
              onPress={startPractice}
            >
              <Text style={[styles.actionBtnText, { color: theme.bg }]}>
                Start practice →
              </Text>
            </TouchableOpacity>
          )}

          {started && !isComplete && (
            <TouchableOpacity
              style={[styles.actionBtnOutline, { borderColor: theme.border }]}
              onPress={markComplete}
            >
              <Text style={[styles.actionBtnOutlineText, { color: theme.textDim }]}>
                Mark complete
              </Text>
            </TouchableOpacity>
          )}

          {isComplete && (
            <View style={[styles.completeBlock, { borderColor: layerColour }]}>
              <Text style={[styles.completeText, { color: layerColour }]}>
                ✓ Complete — {progress[id]?.completedAt?.slice(0, 10)}
              </Text>
            </View>
          )}
        </View>

        {subject.externalRequired && (
          <Text style={[styles.externalNote, { color: theme.textDim }]}>
            ◦ This subject requires an external practitioner, teacher, or group.
          </Text>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  )
}

function InfoBlock({ label, content, theme }) {
  if (!content) return null
  return (
    <View style={[styles.infoBlock, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.infoLabel, { color: theme.textDim }]}>{label}</Text>
      <Text style={[styles.infoContent, { color: theme.text }]}>{content}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { padding: TOKENS.space.lg, paddingTop: 60 },
  back: { marginBottom: TOKENS.space.lg },
  backText: { fontSize: 15 },
  headerBlock: { marginBottom: TOKENS.space.xl },
  layerRow: { flexDirection: 'row', alignItems: 'center', gap: TOKENS.space.sm, marginBottom: TOKENS.space.sm },
  layerSymbol: { fontSize: 18 },
  layerName: { fontSize: 12, letterSpacing: 0.5, flex: 1 },
  pi: { fontSize: 13 },
  subjectName: { fontFamily: 'Georgia', fontSize: 26, lineHeight: 34, marginBottom: 4 },
  domain: { fontSize: 13, marginBottom: TOKENS.space.md },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaChip: { fontSize: 11, borderWidth: 1, borderRadius: TOKENS.radius.full, paddingHorizontal: 10, paddingVertical: 4, fontFamily: 'Courier New' },
  warningBlock: { borderWidth: 1, borderRadius: TOKENS.radius.md, padding: TOKENS.space.lg, marginBottom: TOKENS.space.lg },
  infoBlock: { borderWidth: 1, borderRadius: TOKENS.radius.lg, padding: TOKENS.space.lg, marginBottom: TOKENS.space.sm },
  infoLabel: { fontSize: 11, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: TOKENS.space.sm },
  infoContent: { fontSize: 14, lineHeight: 22 },
  prereqRow: { flexDirection: 'row', alignItems: 'center', gap: TOKENS.space.sm, paddingVertical: 6 },
  prereqStatus: { fontSize: 14, width: 20 },
  prereqName: { flex: 1, fontSize: 14 },
  prereqArrow: { fontSize: 14 },
  actionsBlock: { marginTop: TOKENS.space.lg, gap: TOKENS.space.sm },
  lockedNote: { fontSize: 13, textAlign: 'center', padding: TOKENS.space.md },
  actionBtn: { paddingVertical: TOKENS.space.md, borderRadius: TOKENS.radius.full, alignItems: 'center' },
  actionBtnText: { fontSize: 16, fontWeight: '600', letterSpacing: 0.3 },
  actionBtnOutline: { borderWidth: 1, paddingVertical: TOKENS.space.md, borderRadius: TOKENS.radius.full, alignItems: 'center' },
  actionBtnOutlineText: { fontSize: 15 },
  completeBlock: { borderWidth: 1, borderRadius: TOKENS.radius.full, paddingVertical: TOKENS.space.sm, alignItems: 'center' },
  completeText: { fontSize: 14 },
  externalNote: { fontSize: 12, textAlign: 'center', marginTop: TOKENS.space.md, fontStyle: 'italic' },
})
