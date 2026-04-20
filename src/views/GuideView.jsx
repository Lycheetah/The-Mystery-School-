import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useStore, getStoreValue, setStoreValue } from '../hooks/useStore'
import { buildGuideSystemPrompt, extractConversationInsights } from '../../engine/guide'
import { callProvider } from '../../engine/api'
import { PHASE_COLOURS } from '../../theme/colours'
import { KEYS } from '../../data/schema'
import { SUBJECTS } from '../../data/subjects'
import { UNCOMMON_SUBJECTS } from '../../data/uncommon'
import { VOID_SUBJECTS } from '../../data/void'
import './GuideView.css'

const FREE_LIMIT = 10

function makeConvId() {
  return 'conv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
}

function convTitle(messages) {
  const first = messages.find(m => m.role === 'user')
  if (!first) return 'New Conversation'
  const text = first.content.trim()
  return text.length > 45 ? text.slice(0, 45) + '…' : text
}

function formatDate(iso) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 172800000) return 'Yesterday'
  return d.toLocaleDateString()
}

export default function GuideView({ navPayload }) {
  const { state } = useStore()
  const phase = state?.coordinates?.phase || 1
  const phaseColour = PHASE_COLOURS[phase]?.colour || '#C8A96E'
  const phaseGlyph = PHASE_COLOURS[phase]?.glyph || '⟟'

  const [conversations, setConversations] = useState([])  // [{ id, messages, createdAt, updatedAt }]
  const [activeConvId, setActiveConvId] = useState(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [msgCount, setMsgCount] = useState(FREE_LIMIT)
  const [sovereign, setSovereign] = useState(null)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [guideInsights, setGuideInsights] = useState([])
  const [studyHistory, setStudyHistory] = useState([])
  const [journalContext, setJournalContext] = useState(null)
  const [guideMode, setGuideMode] = useState('teacher')
  const [journalGuideEnabled, setJournalGuideEnabled] = useState(true)
  const bottomRef = useRef(null)

  // Active conversation messages
  const activeConv = conversations.find(c => c.id === activeConvId) || null
  const messages = activeConv?.messages || []

  async function processInsights(convId, messages) {
    const conv = { id: convId, messages, updatedAt: new Date().toISOString() }
    const insight = extractConversationInsights(conv)
    if (!insight) return
    const existing = (await getStoreValue('guide_insights')) || []
    const deduped = existing.filter(i => i.convId !== convId)
    const updated = [insight, ...deduped].slice(0, 30)
    setGuideInsights(updated)
    setStoreValue('guide_insights', updated)
  }

  useEffect(() => {
    Promise.all([
      getStoreValue('apiKey_deepseek'),
      getStoreValue('guide_msg_count'),
      getStoreValue(KEYS.GUIDE_CONVERSATIONS),
      getStoreValue('guide_messages'),
      getStoreValue(KEYS.GUIDE_INSIGHTS),
      getStoreValue(KEYS.PROGRESS),
      getStoreValue(KEYS.JOURNAL),
      getStoreValue(KEYS.SOVEREIGN_TIER),
      getStoreValue(KEYS.LAST_OPENED_SUBJECT),
      getStoreValue(KEYS.GUIDE_MODE),
      getStoreValue(KEYS.JOURNAL_GUIDE_ENABLED),
    ]).then(([key, count, convs, oldMsgs, insights, progress, journal, sov, lastOpened, savedMode, journalEnabled]) => {
      setSovereign(sov || null)
      setApiKey(key || '')
      if (savedMode) setGuideMode(savedMode)
      setJournalGuideEnabled(journalEnabled !== false) // default true

      // Daily reset
      const today = new Date().toDateString()
      const stored = count || { count: FREE_LIMIT, date: today }
      if (stored.date !== today) {
        setMsgCount(FREE_LIMIT)
        setStoreValue('guide_msg_count', { count: FREE_LIMIT, date: today })
      } else {
        setMsgCount(stored.count)
      }

      // Load conversations, migrating old format if needed
      let loadedConvs = convs || []
      if (loadedConvs.length === 0 && oldMsgs && oldMsgs.length > 0) {
        const migrated = {
          id: makeConvId(),
          messages: oldMsgs,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        loadedConvs = [migrated]
        setStoreValue(KEYS.GUIDE_CONVERSATIONS, loadedConvs)
      }
      setConversations(loadedConvs)
      if (loadedConvs.length > 0) setActiveConvId(loadedConvs[0].id)
      setGuideInsights(insights || [])

      // Build study history — last opened first, then recent completed
      const prog = progress || {}
      const allSubjects = [...SUBJECTS, ...UNCOMMON_SUBJECTS, ...VOID_SUBJECTS]
      const recentStudied = Object.entries(prog)
        .filter(([, v]) => v?.status === 'completed' || v?.mastery >= 2)
        .sort(([, a], [, b]) => {
          const dateA = a.completedAt || a.startedAt || ''
          const dateB = b.completedAt || b.startedAt || ''
          return dateB.localeCompare(dateA)
        })
        .slice(0, 8)
        .map(([id]) => allSubjects.find(s => s.id === id))
        .filter(Boolean)
        .map(s => ({ name: s.name, domain: s.domain }))

      // Prepend last opened subject if not already in list
      if (lastOpened) {
        const already = recentStudied.some(s => s.name === lastOpened.name)
        if (!already) recentStudied.unshift({ ...lastOpened, current: true })
        else {
          const idx = recentStudied.findIndex(s => s.name === lastOpened.name)
          if (idx > 0) {
            recentStudied.splice(idx, 1)
            recentStudied.unshift({ ...lastOpened, current: true })
          } else {
            recentStudied[0] = { ...recentStudied[0], current: true }
          }
        }
      }
      setStudyHistory(recentStudied.slice(0, 8))

      // Build journal context (metadata only)
      if (journalEnabled !== false) {
        const entries = journal || []
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
        const recent = entries.filter(e => e.createdAt > sevenDaysAgo)
        const typeBreakdown = {}
        for (const e of entries) typeBreakdown[e.type] = (typeBreakdown[e.type] || 0) + 1
        setJournalContext({
          totalEntries: entries.length,
          recentCount: recent.length,
          typeBreakdown,
          hasDreams: (typeBreakdown.dream || 0) > 0,
          hasShadow: (typeBreakdown.shadow || 0) > 0,
        })
      } else {
        setJournalContext(null)
      }
    })
  }, [])

  useEffect(() => {
    if (!navPayload?.prefill) return
    setInput(navPayload.prefill)
    if (!activeConvId) newConversation()
  }, [navPayload])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const systemPrompt = useMemo(() => {
    if (!state) return ''
    return buildGuideSystemPrompt({
      phase: state.coordinates?.phase || 1,
      depth: state.depth || 1,
      door: state.door || 'SEEKER',
      depthKey: state.depthKey || 'NIGREDO',
    }, guideInsights, studyHistory, journalContext, guideMode)
  }, [state, guideInsights, studyHistory, journalContext, guideMode])

  async function saveConversations(updated) {
    setConversations(updated)
    await setStoreValue(KEYS.GUIDE_CONVERSATIONS, updated)
  }

  function newConversation() {
    const conv = {
      id: makeConvId(),
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const updated = [conv, ...conversations]
    setConversations(updated)
    setStoreValue(KEYS.GUIDE_CONVERSATIONS, updated)
    setActiveConvId(conv.id)
    setInput('')
    setError('')
  }

  async function deleteConversation(id) {
    const updated = conversations.filter(c => c.id !== id)
    await saveConversations(updated)
    if (activeConvId === id) {
      setActiveConvId(updated[0]?.id || null)
    }
  }

  async function send() {
    if (!input.trim() || loading) return
    if (!apiKey) { setError('Add your DeepSeek API key in Settings to use the Guide.'); return }
    if (msgCount <= 0 && !sovereign?.unlocked) { setError('Daily message limit reached. Resets tomorrow.'); return }
    setError('')

    // Create conversation if none active
    let convId = activeConvId
    let currentConvs = conversations
    if (!convId) {
      const conv = {
        id: makeConvId(),
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      currentConvs = [conv, ...conversations]
      setConversations(currentConvs)
      convId = conv.id
      setActiveConvId(convId)
    }

    const userMsg = { role: 'user', content: input.trim(), id: Date.now() }
    const currentMsgs = (currentConvs.find(c => c.id === convId)?.messages || [])
    const updated = [...currentMsgs, userMsg]

    // Update conv in state
    const updatedConvs = currentConvs.map(c =>
      c.id === convId
        ? { ...c, messages: updated, updatedAt: new Date().toISOString() }
        : c
    )
    setConversations(updatedConvs)
    setInput('')
    setLoading(true)

    try {
      const apiMessages = updated.map(m => ({ role: m.role, content: m.content }))
      const reply = await callProvider('deepseek', {
        systemPrompt,
        messages: apiMessages,
        maxTokens: 800,
        temperature: 0.7,
        apiKey,
      })

      const assistantMsg = { role: 'assistant', content: reply, id: Date.now() + 1 }
      const final = [...updated, assistantMsg]
      const finalConvs = updatedConvs.map(c =>
        c.id === convId
          ? { ...c, messages: final.slice(-60), updatedAt: new Date().toISOString() }
          : c
      )
      await saveConversations(finalConvs)

      if (final.length >= 4) {
        processInsights(convId, final)
      }

      const newCount = Math.max(0, msgCount - 1)
      setMsgCount(newCount)
      await setStoreValue('guide_msg_count', { count: newCount, date: new Date().toDateString() })
    } catch (err) {
      setError(err.message || 'Connection failed. Check your API key in Settings.')
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  // Filtered conversations for search
  const filteredConvs = useMemo(() => {
    if (!searchQuery.trim()) return conversations
    const q = searchQuery.toLowerCase()
    return conversations.filter(c =>
      c.messages.some(m => m.content.toLowerCase().includes(q))
    )
  }, [conversations, searchQuery])

  return (
    <div className="guide-layout">
      {/* Header */}
      <div className="guide-header">
        <div className="guide-header-left">
          <span className="guide-header-glyph font-mono" style={{ color: phaseColour }}>⊚</span>
          <div>
            <h2 className="guide-header-title font-serif">Sol Guide</h2>
            <div className="guide-header-phase text-dim">
              {phaseGlyph} Phase {phase} · {state?.coordinates?.phaseName || ''}
            </div>
          </div>
        </div>
        <div className="guide-header-center">
          {[
            { key: 'teacher',    label: 'Teacher',    glyph: '🕯' },
            { key: 'witness',    label: 'Witness',    glyph: '👁' },
            { key: 'challenger', label: 'Challenger', glyph: '🔥' },
            { key: 'oracle',     label: 'Oracle',     glyph: '✶' },
          ].map(m => (
            <button
              key={m.key}
              className={`guide-mode-btn ${guideMode === m.key ? 'guide-mode-btn--active' : ''}`}
              onClick={() => {
                setGuideMode(m.key)
                setStoreValue(KEYS.GUIDE_MODE, m.key)
              }}
              title={m.label}
            >
              <span>{m.glyph}</span>
              <span className="guide-mode-label">{m.label}</span>
            </button>
          ))}
        </div>
        <div className="guide-header-right">
          {sovereign?.unlocked ? (
            <span className="guide-msg-counter font-mono" style={{ color: '#E8C040' }} title="Sovereign Tier — unlimited messages">
              ∞ sovereign
            </span>
          ) : (
            <span
              className="guide-msg-counter font-mono"
              style={{ color: msgCount <= 2 ? '#C9A84C' : undefined, opacity: msgCount <= 2 ? 1 : undefined }}
              title={`${msgCount} free messages remaining today. Resets at midnight.`}
            >
              {msgCount <= 0 ? <span className="text-dim">⚠ </span> : null}
              {msgCount}/{FREE_LIMIT} today
            </span>
          )}
        </div>
      </div>

      <div className="guide-body">
        {/* Conversation history sidebar */}
        <div className="guide-history">
          <div className="guide-history-top">
            <button className="guide-new-conv-btn" onClick={newConversation}>
              + New Conversation
            </button>
            <input
              className="guide-history-search"
              placeholder="Search…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="guide-conv-list">
            {filteredConvs.length === 0 && (
              <div className="guide-conv-empty text-dim">
                {searchQuery ? 'No matches' : 'No conversations yet'}
              </div>
            )}
            {filteredConvs.map(conv => (
              <div
                key={conv.id}
                className={`guide-conv-item ${conv.id === activeConvId ? 'guide-conv-item--active' : ''}`}
                onClick={() => { setActiveConvId(conv.id); setError('') }}
              >
                <div className="guide-conv-title">{convTitle(conv.messages)}</div>
                <div className="guide-conv-meta text-dim">
                  {conv.messages.length} msg · {formatDate(conv.updatedAt)}
                </div>
                <button
                  className="guide-conv-delete"
                  title="Delete conversation"
                  onClick={e => { e.stopPropagation(); deleteConversation(conv.id) }}
                >×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Chat panel */}
        <div className="guide-chat">
          {/* No API key state */}
          {!apiKey && (
            <div className="guide-no-key">
              <span className="font-mono" style={{ color: phaseColour, fontSize: 32 }}>⊚</span>
              <h3 className="font-serif">Add your DeepSeek API key</h3>
              <p className="text-dim">
                The Sol Guide uses DeepSeek — fast, deep, and free-tier generous.<br />
                Get a key at <strong>platform.deepseek.com</strong> → API Keys<br />
                Then add it in <strong>Settings → API Keys</strong>.
              </p>
            </div>
          )}

          {/* Messages */}
          {apiKey && (
            <div className="guide-messages">
              {messages.length === 0 && (
                <div className="guide-empty">
                  <span className="font-mono guide-empty-glyph" style={{ color: phaseColour }}>⊚</span>
                  <p className="guide-empty-text font-serif">
                    The Guide is present.<br />
                    <span className="text-dim">Ask what you are actually carrying.</span>
                  </p>
                  <div className="guide-starter-prompts">
                    {getStarterPrompts(phase).map((p, i) => (
                      <button key={i} className="guide-starter-btn" onClick={() => setInput(p)}>{p}</button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map(msg => (
                <div key={msg.id} className={`guide-msg guide-msg--${msg.role}`}>
                  {msg.role === 'assistant' && (
                    <span className="guide-msg-glyph font-mono" style={{ color: phaseColour }}>⊚</span>
                  )}
                  <div className="guide-msg-content">
                    {msg.content.split('\n').map((line, i) =>
                      line ? <p key={i}>{line}</p> : <br key={i} />
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="guide-msg guide-msg--assistant guide-msg--loading">
                  <span className="guide-msg-glyph font-mono" style={{ color: phaseColour }}>⊚</span>
                  <div className="guide-typing">
                    <span /><span /><span />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}

          {/* Error */}
          {error && <div className="guide-error">{error}</div>}

          {/* Limit reached banner */}
          {apiKey && msgCount <= 0 && !sovereign?.unlocked && !error && (
            <div className="guide-limit-banner">
              Daily limit reached (10/10). Resets tomorrow at midnight.
            </div>
          )}

          {/* Input */}
          {apiKey && (
            <div className="guide-input-row">
              <textarea
                className="guide-input"
                placeholder="Ask the Guide…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                disabled={loading || (msgCount <= 0 && !sovereign?.unlocked)}
                rows={1}
              />
              <button
                className="guide-send-btn"
                style={{ background: phaseColour, borderColor: phaseColour }}
                onClick={send}
                disabled={!input.trim() || loading || (msgCount <= 0 && !sovereign?.unlocked)}
              >
                {loading ? '…' : '↑'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getStarterPrompts(phase) {
  const prompts = {
    1: ['What does it mean to be in Nigredo?', "I feel stuck and don't know why.", 'How do I work with dissolution?'],
    2: ['Something is shifting but I can\'t name it.', 'What is the work of this phase?', 'How do I stay grounded while moving?'],
    3: ['I keep seeing the same pattern.', 'What do I do with an uncomfortable insight?', 'How do I work with what I\'m seeing?'],
    4: ['I feel energy returning but don\'t know where to direct it.', 'What is the Conjunction?', 'How do I act from this phase?'],
    5: ['I feel like I\'m understanding something I couldn\'t before.', 'What is the Fermentation stage?', 'How do I stabilise synthesis?'],
    6: ['Something is completing. What do I do with that?', 'How do I release without losing?', 'What is the Distillation?'],
    7: ['Something has settled. What now?', 'How do I honour a completion?', 'What is Coagulation?'],
  }
  return (prompts[phase] || prompts[1]).slice(0, 3)
}
