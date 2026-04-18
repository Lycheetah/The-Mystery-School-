import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useUserState } from '../../hooks/useUserState'
import { DEPTHS, TOKENS, GLYPHS } from '../../theme'
import { SUBJECTS, LAYER, DOMAINS, getSubjectsByDomain, getAvailableSubjects } from '../../data/subjects'
import { KEYS } from '../../data/schema'

const LAYER_COLOURS = {
  [LAYER.FOUNDATION]: '#C9A84C',  // gold
  [LAYER.MIDDLE]:     '#7CB5C4',  // silver
  [LAYER.EDGE]:       '#8888CC',  // violet
}

export default function Map() {
  const router = useRouter()
  const { state } = useUserState()
  const theme = DEPTHS[state.depthKey || 'NIGREDO']
  const [progress, setProgress] = useState({})
  const [selectedDomain, setSelectedDomain] = useState(null)
  const [viewMode, setViewMode] = useState('domain') // 'domain' | 'layer' | 'available'

  useEffect(() => {
    AsyncStorage.getItem(KEYS.PROGRESS).then(raw => {
      if (raw) setProgress(JSON.parse(raw))
    })
  }, [])

  const completedIds = Object.entries(progress)
    .filter(([, v]) => v?.status === 'complete')
    .map(([k]) => k)

  const available = getAvailableSubjects(completedIds)
  const domains = selectedDomain ? [selectedDomain] : DOMAINS

  function getSubjectStatus(id) {
    if (completedIds.includes(id)) return 'complete'
    if (available.find(s => s.id === id)) return 'available'
    return 'locked'
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textBright }]}>The Map</Text>
        <View style={styles.viewToggle}>
          {['domain', 'layer', 'available'].map(mode => (
            <TouchableOpacity
              key={mode}
              style={[styles.toggleBtn, viewMode === mode && { borderColor: theme.accent }]}
              onPress={() => { setViewMode(mode); setSelectedDomain(null) }}
            >
              <Text style={[styles.toggleText, { color: viewMode === mode ? theme.accent : theme.textDim }]}>
                {mode === 'domain' ? 'Domain' : mode === 'layer' ? 'Layer' : 'Ready'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={[styles.statChip, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.statNum, { color: LAYER_COLOURS.foundation }]}>{completedIds.length}</Text>
          <Text style={[styles.statLabel, { color: theme.textDim }]}>complete</Text>
        </View>
        <View style={[styles.statChip, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.statNum, { color: LAYER_COLOURS.middle }]}>{available.length}</Text>
          <Text style={[styles.statLabel, { color: theme.textDim }]}>available</Text>
        </View>
        <View style={[styles.statChip, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.statNum, { color: theme.textDim }]}>{SUBJECTS.length - completedIds.length - available.length}</Text>
          <Text style={[styles.statLabel, { color: theme.textDim }]}>locked</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {viewMode === 'available' ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textDim }]}>
              Ready to begin — {available.length} subjects
            </Text>
            {available.map(s => (
              <SubjectRow key={s.id} subject={s} status="available" theme={theme} onPress={() => router.push(`/subject/${s.id}`)} />
            ))}
          </View>
        ) : viewMode === 'layer' ? (
          [LAYER.FOUNDATION, LAYER.MIDDLE, LAYER.EDGE].map(layer => {
            const layerSubjects = SUBJECTS.filter(s => s.layer === layer)
            const label = { foundation: '● Foundation', middle: '◐ Middle', edge: '○ Edge' }[layer]
            return (
              <View key={layer} style={styles.section}>
                <Text style={[styles.sectionTitle, { color: LAYER_COLOURS[layer] }]}>{label}</Text>
                {layerSubjects.map(s => (
                  <SubjectRow key={s.id} subject={s} status={getSubjectStatus(s.id)} theme={theme} onPress={() => router.push(`/subject/${s.id}`)} />
                ))}
              </View>
            )
          })
        ) : (
          DOMAINS.map(domain => {
            const domainSubjects = getSubjectsByDomain(domain)
            const doneCount = domainSubjects.filter(s => completedIds.includes(s.id)).length
            return (
              <View key={domain} style={styles.section}>
                <TouchableOpacity
                  style={styles.domainHeader}
                  onPress={() => setSelectedDomain(selectedDomain === domain ? null : domain)}
                >
                  <Text style={[styles.domainTitle, { color: theme.text }]}>{domain}</Text>
                  <Text style={[styles.domainCount, { color: theme.textDim }]}>
                    {doneCount}/{domainSubjects.length}
                  </Text>
                </TouchableOpacity>
                {domainSubjects.map(s => (
                  <SubjectRow key={s.id} subject={s} status={getSubjectStatus(s.id)} theme={theme} onPress={() => router.push(`/subject/${s.id}`)} />
                ))}
              </View>
            )
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  )
}

function SubjectRow({ subject, status, theme, onPress }) {
  const layerColour = LAYER_COLOURS[subject.layer] || theme.textDim
  const isLocked = status === 'locked'
  const isComplete = status === 'complete'

  return (
    <TouchableOpacity
      style={[
        styles.subjectRow,
        { backgroundColor: theme.card, borderColor: isComplete ? layerColour : theme.border },
        isLocked && { opacity: 0.4 },
      ]}
      onPress={isLocked ? null : onPress}
      activeOpacity={isLocked ? 1 : 0.8}
    >
      <View style={styles.subjectLeft}>
        <Text style={[styles.layerDot, { color: layerColour }]}>
          {subject.layer === LAYER.FOUNDATION ? '●' : subject.layer === LAYER.MIDDLE ? '◐' : '○'}
        </Text>
        <View>
          <Text style={[styles.subjectName, { color: isLocked ? theme.textDim : theme.textBright }]}>
            {subject.name}
          </Text>
          <Text style={[styles.subjectMeta, { color: theme.textDim }]}>
            Π {subject.pi.toFixed(2)} · Phase {subject.phase}
          </Text>
        </View>
      </View>
      <View style={styles.subjectRight}>
        {isComplete && <Text style={{ color: layerColour, fontSize: 14 }}>✓</Text>}
        {isLocked && <Text style={{ color: theme.textDim, fontSize: 12, fontFamily: 'Courier New' }}>⊗</Text>}
        {status === 'available' && <Text style={{ color: theme.textDim, fontSize: 14 }}>→</Text>}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: TOKENS.space.lg, paddingTop: 60, paddingBottom: TOKENS.space.sm,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  title: { fontFamily: 'Georgia', fontSize: 24, letterSpacing: 1 },
  viewToggle: { flexDirection: 'row', gap: 6 },
  toggleBtn: { borderWidth: 1, borderColor: 'transparent', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  toggleText: { fontSize: 12, letterSpacing: 0.3 },
  statsRow: { flexDirection: 'row', paddingHorizontal: TOKENS.space.lg, gap: TOKENS.space.sm, paddingBottom: TOKENS.space.md },
  statChip: { flex: 1, borderWidth: 1, borderRadius: TOKENS.radius.md, padding: TOKENS.space.sm, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '700', fontFamily: 'Courier New' },
  statLabel: { fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  section: { paddingHorizontal: TOKENS.space.lg, paddingBottom: TOKENS.space.md },
  sectionTitle: { fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: TOKENS.space.sm, marginTop: TOKENS.space.sm },
  domainHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: TOKENS.space.sm },
  domainTitle: { fontSize: 14, fontWeight: '600' },
  domainCount: { fontSize: 12 },
  subjectRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: TOKENS.space.md, borderRadius: TOKENS.radius.md,
    borderWidth: 1, marginBottom: 6,
  },
  subjectLeft: { flexDirection: 'row', alignItems: 'center', gap: TOKENS.space.sm, flex: 1 },
  layerDot: { fontSize: 16, width: 18 },
  subjectName: { fontSize: 14, fontWeight: '500' },
  subjectMeta: { fontSize: 11, marginTop: 2 },
  subjectRight: { paddingLeft: TOKENS.space.sm },
})
