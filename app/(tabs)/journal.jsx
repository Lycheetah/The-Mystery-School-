import { useState, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, TextInput, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { v4 as uuid } from 'uuid'
import { useUserState } from '../../hooks/useUserState'
import { DEPTHS, TOKENS } from '../../theme'
import { PHASES } from '../../engine/assessment'
import { KEYS } from '../../data/schema'

const JOURNAL_TYPES = [
  { key: 'phase_prompt', label: 'Phase Prompt' },
  { key: 'dream',        label: 'Dream' },
  { key: 'insight',      label: 'Insight' },
  { key: 'shadow',       label: 'Shadow' },
  { key: 'free',         label: 'Free Write' },
]

const PHASE_PROMPTS = {
  1: ['What am I waiting for?', 'Describe what stillness feels like right now.', 'What is the last thing that felt complete?'],
  2: ['What is moving in me that I can\'t name?', 'What was certain a month ago that no longer is?', 'Where in my body do I feel the change?'],
  3: ['What pattern have I just seen clearly?', 'What did I used to believe that I no longer do?', 'What uncomfortable truth am I sitting with?'],
  4: ['What am I building? Be specific.', 'What changed when I stopped waiting and started?', 'What did it feel like when direction returned?'],
  5: ['What is clear right now that was confused before?', 'Describe the felt sense of clarity without explaining it.', 'What can I see all the way through?'],
  6: ['What am I letting go of with gratitude?', 'What do I understand now that I had to suffer to understand?', 'Describe your relationship with what\'s ending.'],
  7: ['What has settled?', 'What do I have now that I didn\'t have at the beginning?', 'Where do I feel the completion in my body?'],
}

export default function Journal() {
  const { state } = useUserState()
  const theme = DEPTHS[state.depthKey || 'NIGREDO']
  const [mode, setMode] = useState('list') // 'list' | 'write'
  const [entries, setEntries] = useState([])
  const [selectedType, setSelectedType] = useState('phase_prompt')
  const [content, setContent] = useState('')
  const [selectedPrompt, setSelectedPrompt] = useState(null)

  const phasePrompts = PHASE_PROMPTS[state.phase || 1] || PHASE_PROMPTS[1]
  const phaseInfo = PHASES[state.phase || 1]

  useEffect(() => {
    AsyncStorage.getItem(KEYS.JOURNAL).then(raw => {
      if (raw) setEntries(JSON.parse(raw))
    })
  }, [])

  async function saveEntry() {
    if (!content.trim()) return

    const entry = {
      id: uuid(),
      type: selectedType,
      prompt: selectedPrompt || '',
      content: content.trim(),
      phase: state.phase || 1,
      depth: state.depth || 1,
      createdAt: new Date().toISOString(),
      tags: [],
    }

    const updated = [entry, ...entries]
    setEntries(updated)
    await AsyncStorage.setItem(KEYS.JOURNAL, JSON.stringify(updated))
    setContent('')
    setSelectedPrompt(null)
    setMode('list')
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {mode === 'list' ? (
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.textBright }]}>Journal</Text>
            <TouchableOpacity
              style={[styles.newBtn, { backgroundColor: theme.accent }]}
              onPress={() => setMode('write')}
            >
              <Text style={[styles.newBtnText, { color: theme.bg }]}>+ Entry</Text>
            </TouchableOpacity>
          </View>

          {/* Phase prompts */}
          <View style={[styles.promptsBlock, { backgroundColor: theme.card }]}>
            <Text style={[styles.promptsLabel, { color: theme.textDim }]}>
              {phaseInfo?.glyph} Phase prompts
            </Text>
            {phasePrompts.map((p, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.promptChip, { borderColor: theme.border }]}
                onPress={() => { setSelectedPrompt(p); setSelectedType('phase_prompt'); setMode('write') }}
              >
                <Text style={[styles.promptText, { color: theme.text }]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.entriesList}>
            <Text style={[styles.sectionLabel, { color: theme.textDim }]}>
              {entries.length} entries
            </Text>
            {entries.map(entry => (
              <View key={entry.id} style={[styles.entryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.entryHeader}>
                  <Text style={[styles.entryType, { color: theme.textDim }]}>
                    {JOURNAL_TYPES.find(t => t.key === entry.type)?.label || entry.type}
                  </Text>
                  <Text style={[styles.entryDate, { color: theme.textDim }]}>
                    {entry.createdAt.slice(0, 10)}
                  </Text>
                </View>
                {entry.prompt ? (
                  <Text style={[styles.entryPrompt, { color: theme.textDim }]}>{entry.prompt}</Text>
                ) : null}
                <Text style={[styles.entryContent, { color: theme.text }]} numberOfLines={4}>
                  {entry.content}
                </Text>
              </View>
            ))}
            <View style={{ height: 100 }} />
          </ScrollView>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => { setMode('list'); setContent(''); setSelectedPrompt(null) }}>
              <Text style={[styles.backBtn, { color: theme.textDim }]}>← Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: content.trim() ? theme.accent : theme.border }]}
              onPress={saveEntry}
              disabled={!content.trim()}
            >
              <Text style={[styles.saveBtnText, { color: content.trim() ? theme.bg : theme.textDim }]}>Save</Text>
            </TouchableOpacity>
          </View>

          {/* Type selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll} contentContainerStyle={styles.typeRow}>
            {JOURNAL_TYPES.map(t => (
              <TouchableOpacity
                key={t.key}
                style={[styles.typeChip, {
                  borderColor: selectedType === t.key ? theme.accent : theme.border,
                  backgroundColor: selectedType === t.key ? theme.accentSoft : theme.card,
                }]}
                onPress={() => setSelectedType(t.key)}
              >
                <Text style={[styles.typeChipText, { color: selectedType === t.key ? theme.accent : theme.textDim }]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Prompt display */}
          {selectedPrompt && (
            <View style={[styles.activePrompt, { backgroundColor: theme.accentSoft, borderColor: theme.accent }]}>
              <Text style={[styles.activePromptText, { color: theme.text }]}>{selectedPrompt}</Text>
            </View>
          )}
          {selectedType === 'phase_prompt' && !selectedPrompt && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll} contentContainerStyle={styles.typeRow}>
              {phasePrompts.map((p, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.promptSelectChip, {
                    borderColor: selectedPrompt === p ? theme.accent : theme.border,
                    backgroundColor: theme.card,
                    maxWidth: 220,
                  }]}
                  onPress={() => setSelectedPrompt(p)}
                >
                  <Text style={[styles.typeChipText, { color: theme.text }]} numberOfLines={2}>{p}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Text input */}
          <TextInput
            style={[styles.textInput, { color: theme.textBright, borderColor: theme.border }]}
            placeholder="Write here..."
            placeholderTextColor={theme.textDim}
            multiline
            value={content}
            onChangeText={setContent}
            autoFocus
            textAlignVertical="top"
          />
        </View>
      )}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: TOKENS.space.lg, paddingTop: 60, paddingBottom: TOKENS.space.md,
  },
  title: { fontFamily: 'Georgia', fontSize: 24, letterSpacing: 1 },
  newBtn: { paddingHorizontal: TOKENS.space.md, paddingVertical: TOKENS.space.xs, borderRadius: TOKENS.radius.full },
  newBtnText: { fontSize: 14, fontWeight: '600' },
  backBtn: { fontSize: 15 },
  saveBtn: { paddingHorizontal: TOKENS.space.lg, paddingVertical: TOKENS.space.xs, borderRadius: TOKENS.radius.full },
  saveBtnText: { fontSize: 14, fontWeight: '600' },
  promptsBlock: { marginHorizontal: TOKENS.space.lg, borderRadius: TOKENS.radius.lg, padding: TOKENS.space.md, marginBottom: TOKENS.space.md },
  promptsLabel: { fontSize: 11, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: TOKENS.space.sm },
  promptChip: { borderWidth: 1, borderRadius: TOKENS.radius.sm, padding: TOKENS.space.sm, marginBottom: 6 },
  promptText: { fontSize: 13, lineHeight: 18 },
  entriesList: { paddingHorizontal: TOKENS.space.lg, paddingBottom: 100 },
  sectionLabel: { fontSize: 11, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: TOKENS.space.sm },
  entryCard: { borderRadius: TOKENS.radius.lg, borderWidth: 1, padding: TOKENS.space.md, marginBottom: TOKENS.space.sm },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  entryType: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  entryDate: { fontSize: 11 },
  entryPrompt: { fontSize: 12, fontStyle: 'italic', marginBottom: 6 },
  entryContent: { fontSize: 14, lineHeight: 20 },
  typeScroll: { maxHeight: 50 },
  typeRow: { paddingHorizontal: TOKENS.space.lg, gap: 8, paddingBottom: 4 },
  typeChip: { borderWidth: 1, paddingHorizontal: TOKENS.space.md, paddingVertical: 6, borderRadius: TOKENS.radius.full },
  typeChipText: { fontSize: 13 },
  promptSelectChip: { borderWidth: 1, paddingHorizontal: TOKENS.space.md, paddingVertical: TOKENS.space.sm, borderRadius: TOKENS.radius.md },
  activePrompt: { marginHorizontal: TOKENS.space.lg, padding: TOKENS.space.md, borderRadius: TOKENS.radius.md, borderWidth: 1, marginBottom: TOKENS.space.sm },
  activePromptText: { fontSize: 15, lineHeight: 22, fontStyle: 'italic', fontFamily: 'Georgia' },
  textInput: {
    flex: 1, marginHorizontal: TOKENS.space.lg, marginTop: TOKENS.space.md,
    fontSize: 16, lineHeight: 26, borderWidth: 0, padding: 0,
    fontFamily: 'Georgia',
  },
})
