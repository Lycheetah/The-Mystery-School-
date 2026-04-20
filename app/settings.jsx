import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useUserState } from '../hooks/useUserState'
import { DEPTHS, TOKENS, PHASE_COLOURS } from '../theme'
import { PHASES } from '../engine/assessment'
import { DOORS } from '../engine/doors'
import { KEYS } from '../data/schema'

export default function Settings() {
  const router = useRouter()
  const { state, update } = useUserState()
  const theme = DEPTHS[state.depthKey || 'NIGREDO']
  const phaseColour = PHASE_COLOURS[state.phase || 1]?.colour || theme.accent

  const currentDoor = DOORS[state.door || 'SEEKER']

  async function resetProgress() {
    Alert.alert(
      'Reset Subject Progress',
      'This clears your subject completion data. Your journal and practice log are preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset', style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem(KEYS.PROGRESS)
          },
        },
      ]
    )
  }

  async function clearAllData() {
    Alert.alert(
      'Clear All Data',
      'This resets the entire app — journal, practice log, assessments, progress. Cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything', style: 'destructive',
          onPress: async () => {
            await Promise.all(Object.values(KEYS).map(k => AsyncStorage.removeItem(k)))
            await update({ onboarded: false, phase: null, depth: null, door: null, depthKey: 'NIGREDO' })
            router.replace('/onboarding')
          },
        },
      ]
    )
  }

  async function setDoor(doorKey) {
    await update({ door: doorKey })
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={[styles.backText, { color: theme.textDim }]}>←</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: theme.textBright }]}>Settings</Text>

        {/* Current coordinates */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textDim }]}>Your coordinates</Text>
          <Text style={[styles.coords, { color: phaseColour, fontFamily: 'Courier New' }]}>
            {PHASES[state.phase || 1]?.glyph} {PHASES[state.phase || 1]?.name}
          </Text>
          <TouchableOpacity
            style={[styles.btn, { borderColor: theme.border }]}
            onPress={() => router.push('/assessment')}
          >
            <Text style={[styles.btnText, { color: theme.text }]}>Re-take assessment →</Text>
          </TouchableOpacity>
        </View>

        {/* Door selection */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textDim }]}>Your door</Text>
          <Text style={[styles.currentDoor, { color: theme.text }]}>
            {currentDoor?.glyph} {currentDoor?.name}
          </Text>
          <View style={styles.doorGrid}>
            {Object.entries(DOORS).map(([key, door]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.doorChip,
                  { borderColor: state.door === key ? theme.accent : theme.border },
                  state.door === key && { backgroundColor: theme.accentSoft },
                ]}
                onPress={() => setDoor(key)}
              >
                <Text style={[styles.doorChipGlyph, { color: state.door === key ? theme.accent : theme.glyph, fontFamily: 'Courier New' }]}>
                  {door.glyph}
                </Text>
                <Text style={[styles.doorChipName, { color: state.door === key ? theme.accent : theme.textDim }]}>
                  {door.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Data management */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textDim }]}>Data</Text>
          <Text style={[styles.dataNote, { color: theme.textDim }]}>
            All your data lives on this device. Nothing is sent to a server.
          </Text>
          <TouchableOpacity
            style={[styles.btn, { borderColor: theme.border }]}
            onPress={resetProgress}
          >
            <Text style={[styles.btnText, { color: theme.text }]}>Reset subject progress</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, { borderColor: '#601010', marginTop: 8 }]}
            onPress={clearAllData}
          >
            <Text style={[styles.btnText, { color: '#C04040' }]}>Clear all data</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textDim }]}>About</Text>
          <Text style={[styles.about, { color: theme.textDim }]}>
            The Mystery School v1.0{'\n'}
            A living curriculum for human transformation.{'\n'}
            Built on the Lycheetah Sovereign Framework.{'\n\n'}
            "No mathematics required. No belief required. Just honesty."
          </Text>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { padding: TOKENS.space.lg, paddingTop: 60 },
  back: { marginBottom: TOKENS.space.md },
  backText: { fontSize: 20 },
  title: { fontFamily: 'Georgia', fontSize: 24, letterSpacing: 1, marginBottom: TOKENS.space.xl },
  section: { borderRadius: TOKENS.radius.lg, borderWidth: 1, padding: TOKENS.space.lg, marginBottom: TOKENS.space.md },
  sectionTitle: { fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: TOKENS.space.md },
  coords: { fontSize: 20, marginBottom: TOKENS.space.md },
  currentDoor: { fontSize: 16, fontWeight: '500', marginBottom: TOKENS.space.md },
  doorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  doorChip: { borderWidth: 1, borderRadius: TOKENS.radius.md, padding: TOKENS.space.sm, alignItems: 'center', minWidth: 72 },
  doorChipGlyph: { fontSize: 16, marginBottom: 2 },
  doorChipName: { fontSize: 10, textAlign: 'center' },
  btn: { borderWidth: 1, borderRadius: TOKENS.radius.md, padding: TOKENS.space.md, alignItems: 'center', marginTop: 8 },
  btnText: { fontSize: 14 },
  dataNote: { fontSize: 13, lineHeight: 20, marginBottom: TOKENS.space.md },
  about: { fontSize: 13, lineHeight: 22, fontStyle: 'italic', fontFamily: 'Georgia' },
})
