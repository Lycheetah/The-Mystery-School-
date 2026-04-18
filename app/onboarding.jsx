import { useState, useRef } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { useUserState } from '../hooks/useUserState'
import { DEPTHS, TOKENS } from '../theme'
import { DOORS } from '../engine/doors'

const { width } = Dimensions.get('window')

const STEPS = ['welcome', 'door', 'ready']

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [selectedDoor, setSelectedDoor] = useState(null)
  const { update } = useUserState()
  const router = useRouter()
  const theme = DEPTHS.NIGREDO

  async function handleEnter() {
    await update({
      door: selectedDoor || 'SEEKER',
      onboarded: false, // still need assessment
    })
    router.replace('/assessment')
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      {step === 0 && <WelcomeStep theme={theme} onNext={() => setStep(1)} />}
      {step === 1 && (
        <DoorStep
          theme={theme}
          selected={selectedDoor}
          onSelect={setSelectedDoor}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <ReadyStep
          theme={theme}
          door={selectedDoor}
          onEnter={handleEnter}
          onBack={() => setStep(1)}
        />
      )}
    </View>
  )
}

function WelcomeStep({ theme, onNext }) {
  return (
    <ScrollView contentContainerStyle={styles.center}>
      <Text style={[styles.glyph, { color: theme.glyph }]}>⟟</Text>
      <Text style={[styles.display, { color: theme.textBright }]}>
        The Mystery School
      </Text>
      <View style={styles.divider} />
      <Text style={[styles.body, { color: theme.text }]}>
        A living curriculum for human transformation.{'\n\n'}
        No mathematics required.{'\n'}
        No belief required.{'\n'}
        Just honesty.
      </Text>
      <Text style={[styles.body, { color: theme.textDim, marginTop: 32 }]}>
        You'll find where you are. You'll receive a practice. You'll begin.{'\n\n'}
        The school doesn't grade you. It illuminates you.
      </Text>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: theme.accent }]}
        onPress={onNext}
        activeOpacity={0.8}
      >
        <Text style={[styles.btnText, { color: theme.bg }]}>Enter the School</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.crisisLink}
        onPress={() => {/* navigate to threshold */}}
      >
        <Text style={[styles.caption, { color: theme.textDim }]}>
          In crisis right now? Touch here.
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

function DoorStep({ theme, selected, onSelect, onNext }) {
  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.doorContainer}>
        <Text style={[styles.label, { color: theme.accentSoft }]}>Choose your door</Text>
        <Text style={[styles.heading, { color: theme.textBright }]}>
          How do you enter the unknown?
        </Text>
        <Text style={[styles.caption2, { color: theme.textDim }]}>
          Your door shapes the language and order of what you find.{'\n'}
          All doors lead to the same truth.
        </Text>

        <View style={styles.doorGrid}>
          {Object.entries(DOORS).map(([key, door]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.doorCard,
                { backgroundColor: theme.card, borderColor: theme.border },
                selected === key && { borderColor: theme.accent, backgroundColor: theme.accentSoft },
              ]}
              onPress={() => onSelect(key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.doorGlyph, { color: selected === key ? theme.accent : theme.glyph }]}>
                {door.glyph}
              </Text>
              <Text style={[styles.doorName, { color: selected === key ? theme.accent : theme.textBright }]}>
                {door.name}
              </Text>
              <Text style={[styles.doorDesc, { color: theme.textDim }]}>
                {door.hook}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: theme.bg, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[
            styles.btn,
            { backgroundColor: selected ? theme.accent : theme.border },
          ]}
          onPress={selected ? onNext : null}
          activeOpacity={0.8}
        >
          <Text style={[styles.btnText, { color: selected ? theme.bg : theme.textDim }]}>
            {selected ? `Enter as ${DOORS[selected]?.name}` : 'Choose a door'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function ReadyStep({ theme, door, onEnter, onBack }) {
  const doorData = DOORS[door || 'SEEKER']

  return (
    <ScrollView contentContainerStyle={styles.center}>
      <Text style={[styles.glyph, { color: theme.glyph }]}>{doorData?.glyph || '⟟'}</Text>
      <Text style={[styles.heading, { color: theme.textBright }]}>
        {doorData?.name || 'Seeker'}
      </Text>
      <Text style={[styles.wisdom, { color: theme.text }]}>
        "{doorData?.opening || 'You are here because something brought you here.'}"
      </Text>
      <Text style={[styles.body, { color: theme.textDim, marginTop: 24 }]}>
        Now answer 35 honest questions.{'\n'}
        The system will locate you in the seven phases.{'\n'}
        This takes about 5 minutes.
      </Text>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: theme.accent, marginTop: 40 }]}
        onPress={onEnter}
        activeOpacity={0.8}
      >
        <Text style={[styles.btnText, { color: theme.bg }]}>Begin Assessment →</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onBack} style={{ marginTop: 16 }}>
        <Text style={[styles.caption, { color: theme.textDim }]}>← Change door</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: TOKENS.space.xl },
  glyph: { fontSize: 56, marginBottom: TOKENS.space.lg, fontFamily: 'Courier New' },
  display: { fontSize: TOKENS.fontSize.xxl, textAlign: 'center', fontFamily: 'Georgia', letterSpacing: 2 },
  heading: { fontSize: TOKENS.fontSize.xl, textAlign: 'center', fontFamily: 'Georgia', letterSpacing: 1, marginBottom: 8 },
  body: { fontSize: TOKENS.fontSize.base, textAlign: 'center', lineHeight: 24 },
  wisdom: { fontSize: TOKENS.fontSize.md, textAlign: 'center', lineHeight: 28, fontStyle: 'italic', fontFamily: 'Georgia', marginTop: 16 },
  caption: { fontSize: TOKENS.fontSize.sm, textAlign: 'center', letterSpacing: 0.3 },
  caption2: { fontSize: TOKENS.fontSize.sm, textAlign: 'center', letterSpacing: 0.3, marginBottom: TOKENS.space.lg },
  label: { fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8, textAlign: 'center' },
  divider: { width: 40, height: 1, backgroundColor: '#3A3050', marginVertical: TOKENS.space.lg },
  btn: { marginTop: 32, paddingHorizontal: TOKENS.space.xl, paddingVertical: TOKENS.space.md, borderRadius: TOKENS.radius.full },
  btnText: { fontSize: TOKENS.fontSize.base, fontWeight: '600', letterSpacing: 0.5 },
  crisisLink: { marginTop: 24, padding: TOKENS.space.sm },
  doorContainer: { padding: TOKENS.space.lg, paddingTop: 60, paddingBottom: 120 },
  doorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 24 },
  doorCard: { width: (width - TOKENS.space.lg * 2 - 12) / 2, padding: TOKENS.space.md, borderRadius: TOKENS.radius.lg, borderWidth: 1 },
  doorGlyph: { fontSize: 24, fontFamily: 'Courier New', marginBottom: 6 },
  doorName: { fontSize: TOKENS.fontSize.base, fontWeight: '600', marginBottom: 4 },
  doorDesc: { fontSize: TOKENS.fontSize.xs, lineHeight: 16 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: TOKENS.space.lg, borderTopWidth: 1 },
})
