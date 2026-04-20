import { useState, useEffect, useRef } from 'react'
import {
  View, Text, TouchableOpacity, TextInput, StyleSheet,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { v4 as uuid } from 'uuid'
import { useUserState } from '../hooks/useUserState'
import { DEPTHS, TOKENS, PHASE_COLOURS } from '../theme'
import { PHASES } from '../engine/assessment'
import { buildGuideSystemPrompt, buildUserContext, getMessageStatus } from '../engine/guide'
import { KEYS, DEFAULT_FREE_MESSAGES } from '../data/schema'

const DEEPSEEK_API = 'https://api.deepseek.com/v1/chat/completions'
// API key stored in app config / env — placeholder for now
const API_KEY = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY || ''

export default function Guide() {
  const router = useRouter()
  const { state } = useUserState()
  const theme = DEPTHS[state.depthKey || 'NIGREDO']
  const phaseColour = PHASE_COLOURS[state.phase || 1]?.colour || theme.accent
  const phaseInfo = PHASES[state.phase || 1]

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [freeMessages, setFreeMessages] = useState(DEFAULT_FREE_MESSAGES)
  const [practiceLog, setPracticeLog] = useState([])
  const [assessment, setAssessment] = useState(null)

  const listRef = useRef(null)
  const systemPrompt = buildGuideSystemPrompt(state)

  useEffect(() => {
    async function load() {
      const fmRaw = await AsyncStorage.getItem(KEYS.FREE_MESSAGES)
      if (fmRaw) {
        const fm = JSON.parse(fmRaw)
        // Reset daily count if needed
        const today = new Date().toISOString().slice(0, 10)
        if (fm.lastResetDate !== today) {
          fm.count = 10
          fm.lastResetDate = today
          await AsyncStorage.setItem(KEYS.FREE_MESSAGES, JSON.stringify(fm))
        }
        setFreeMessages(fm)
      } else {
        const initial = { ...DEFAULT_FREE_MESSAGES, lastResetDate: new Date().toISOString().slice(0, 10) }
        await AsyncStorage.setItem(KEYS.FREE_MESSAGES, JSON.stringify(initial))
        setFreeMessages(initial)
      }

      const pRaw = await AsyncStorage.getItem(KEYS.PRACTICE_LOG)
      if (pRaw) setPracticeLog(JSON.parse(pRaw))

      const aRaw = await AsyncStorage.getItem(KEYS.ASSESSMENT)
      if (aRaw) setAssessment(JSON.parse(aRaw))
    }
    load()

    // Opening message
    setMessages([{
      id: uuid(),
      role: 'assistant',
      content: getOpeningMessage(state),
    }])
  }, [])

  function getOpeningMessage(userState) {
    const phase = userState.phase || 1
    const door = userState.door || 'SEEKER'
    const phaseInfo = PHASES[phase]
    const openings = {
      SEEKER:    `You're in ${phaseInfo?.name}. The seeking brought you here. What do you need to understand?`,
      BUILDER:   `${phaseInfo?.glyph} ${phaseInfo?.name}. What are you building, and what's in the way?`,
      WOUNDED:   `You found the Guide. You're in ${phaseInfo?.name}. There's no rush. What's alive right now?`,
      SCIENTIST: `Phase ${phase}: ${phaseInfo?.name}. Operation: ${phaseInfo?.operation}. What are you investigating?`,
      MYSTIC:    `${phaseInfo?.glyph} The field is open. You're in ${phaseInfo?.name}. What wants to be named?`,
      REBEL:     `You're in ${phaseInfo?.name}. The school they didn't want you to find is here. What do you want to know?`,
      ARTIST:    `${phaseInfo?.name}. The work is listening. What is it trying to say through you right now?`,
      PARENT:    `You're in ${phaseInfo?.name}. The quality of your inner life reaches further than you know. What's present?`,
      ELDER:     `${phaseInfo?.name}. The years have been building toward something. What are you understanding now?`,
      STUDENT:   `Welcome. You're in ${phaseInfo?.name}. The real curriculum begins here. What were you never taught?`,
    }
    return openings[door] || openings.SEEKER
  }

  async function send() {
    const text = input.trim()
    if (!text || loading) return

    const msgStatus = getMessageStatus(freeMessages)
    if (!msgStatus.canSend) {
      setMessages(prev => [...prev, {
        id: uuid(), role: 'assistant',
        content: "You've used today's free messages. Watch a short ad to continue, or upgrade to Sovereign Tier for unlimited access.\n\n(Ad integration coming — for now the limit resets tomorrow.)",
      }])
      return
    }

    // Decrement message count
    const updated = {
      ...freeMessages,
      count: Math.max(0, freeMessages.count - (freeMessages.count > 0 ? 1 : 0)),
      adCredits: freeMessages.count <= 0 ? Math.max(0, freeMessages.adCredits - 1) : freeMessages.adCredits,
    }
    setFreeMessages(updated)
    await AsyncStorage.setItem(KEYS.FREE_MESSAGES, JSON.stringify(updated))

    const userMsg = { id: uuid(), role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const userContext = buildUserContext(practiceLog, [], assessment)
      const contextMsg = userContext ? `[Context: ${userContext}]\n\n` : ''

      const response = await fetch(DEEPSEEK_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            ...newMessages.slice(1).map(m => ({
              role: m.role,
              content: m.role === 'user' && m === userMsg ? contextMsg + m.content : m.content,
            })),
          ],
          max_tokens: 800,
          temperature: 0.7,
        }),
      })

      const data = await response.json()
      const reply = data?.choices?.[0]?.message?.content

      if (reply) {
        setMessages(prev => [...prev, { id: uuid(), role: 'assistant', content: reply }])
      } else {
        throw new Error('No response')
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: uuid(), role: 'assistant',
        content: 'The Guide is temporarily unreachable. Check your connection and try again.\n\n⊚ Guide ∴ ' + phaseInfo?.glyph,
      }])
    } finally {
      setLoading(false)
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }

  const msgStatus = getMessageStatus(freeMessages)

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.back, { color: theme.textDim }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.guideGlyph, { color: phaseColour, fontFamily: 'Courier New' }]}>
            {phaseInfo?.glyph}
          </Text>
          <Text style={[styles.guideTitle, { color: theme.textBright }]}>The Guide</Text>
        </View>
        <View style={[styles.msgCount, { borderColor: msgStatus.nearLimit ? '#C04040' : theme.border }]}>
          <Text style={[styles.msgCountText, { color: msgStatus.nearLimit ? '#C04040' : theme.textDim }]}>
            {msgStatus.total}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        style={{ flex: 1 }}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.role === 'user'
              ? { alignSelf: 'flex-end', backgroundColor: theme.accentSoft, borderColor: theme.accent }
              : { alignSelf: 'flex-start', backgroundColor: theme.card, borderColor: theme.border },
          ]}>
            <Text style={[
              styles.messageText,
              { color: item.role === 'user' ? theme.accent : theme.text },
              item.role === 'assistant' && { fontFamily: 'Georgia' },
            ]}>
              {item.content}
            </Text>
          </View>
        )}
        ListFooterComponent={
          loading ? (
            <View style={[styles.loadingBubble, { backgroundColor: theme.card }]}>
              <ActivityIndicator size="small" color={phaseColour} />
            </View>
          ) : null
        }
      />

      {/* Input */}
      <View style={[styles.inputRow, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <TextInput
          style={[styles.input, { color: theme.textBright, backgroundColor: theme.card, borderColor: theme.border }]}
          placeholder="Ask the Guide..."
          placeholderTextColor={theme.textDim}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={1000}
          returnKeyType="send"
          onSubmitEditing={send}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: input.trim() && !loading ? phaseColour : theme.border }]}
          onPress={send}
          disabled={!input.trim() || loading}
          activeOpacity={0.8}
        >
          <Text style={[styles.sendText, { color: theme.bg }]}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Message limit warning */}
      {msgStatus.nearLimit && (
        <View style={[styles.limitBanner, { backgroundColor: '#1A0808', borderTopColor: '#401010' }]}>
          <Text style={{ color: '#C07070', fontSize: 12 }}>
            {msgStatus.total} message{msgStatus.total !== 1 ? 's' : ''} remaining today
          </Text>
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
    borderBottomWidth: 1,
  },
  back: { fontSize: 22, padding: TOKENS.space.sm },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: TOKENS.space.sm },
  guideGlyph: { fontSize: 20 },
  guideTitle: { fontSize: 17, fontWeight: '600', letterSpacing: 0.5 },
  msgCount: { borderWidth: 1, borderRadius: TOKENS.radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  msgCountText: { fontSize: 12, fontFamily: 'Courier New' },
  messageList: { padding: TOKENS.space.lg, gap: TOKENS.space.sm, paddingBottom: TOKENS.space.md },
  messageBubble: {
    maxWidth: '85%', borderRadius: TOKENS.radius.lg, borderWidth: 1,
    padding: TOKENS.space.md, marginBottom: TOKENS.space.sm,
  },
  messageText: { fontSize: 15, lineHeight: 24 },
  loadingBubble: { alignSelf: 'flex-start', borderRadius: TOKENS.radius.lg, padding: TOKENS.space.md, marginBottom: TOKENS.space.sm },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    padding: TOKENS.space.md, gap: TOKENS.space.sm, borderTopWidth: 1,
  },
  input: {
    flex: 1, borderWidth: 1, borderRadius: TOKENS.radius.lg,
    paddingHorizontal: TOKENS.space.md, paddingVertical: TOKENS.space.sm,
    fontSize: 15, maxHeight: 120,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sendText: { fontSize: 18, fontWeight: '700' },
  limitBanner: { paddingVertical: 6, paddingHorizontal: TOKENS.space.lg, borderTopWidth: 1, alignItems: 'center' },
})
