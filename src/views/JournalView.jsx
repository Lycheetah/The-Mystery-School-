import React, { useState, useEffect, useMemo } from 'react'
import { useStore, getStoreValue, setStoreValue } from '../hooks/useStore'
import { KEYS } from '../../data/schema'
import { PHASE_COLOURS } from '../../theme/colours'
import { getPhasePrompt, getTypedPrompt } from '../../engine/journalPrompts'
import { extractDreamSymbols, buildSymbolFrequency } from '../../engine/dreamSymbols'
import './JournalView.css'

const ENTRY_TYPES = [
  { id: 'free',         label: 'Free Write',     glyph: '≋' },
  { id: 'phase_prompt', label: 'Phase Prompt',   glyph: '⟟' },
  { id: 'dream',        label: 'Dream',          glyph: '◈' },
  { id: 'insight',      label: 'Insight',        glyph: 'Φ↑' },
  { id: 'shadow',       label: 'Shadow Work',    glyph: '⊗' },
]

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' })
}

export default function JournalView({ onNavigateTo }) {
  const { state } = useStore()
  const phase = state?.coordinates?.phase || 1
  const phaseColour = PHASE_COLOURS[phase]?.colour || '#888'
  const phaseGlyph = PHASE_COLOURS[phase]?.glyph || '⟟'

  const [entries, setEntries] = useState([])
  const [view, setView] = useState('list')   // 'list' | 'write' | 'entry'
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  // New entry state
  const [newType, setNewType] = useState('phase_prompt')
  const [newPrompt, setNewPrompt] = useState('')
  const [newContent, setNewContent] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getStoreValue(KEYS.JOURNAL).then(j => setEntries(j || []))
  }, [])

  function openWrite(type = 'phase_prompt') {
    setNewType(type)
    let prompt = ''
    if (type === 'phase_prompt') {
      prompt = getPhasePrompt(phase).text
    } else if (type === 'dream' || type === 'shadow' || type === 'insight') {
      prompt = getTypedPrompt(type) || ''
    }
    setNewPrompt(prompt)
    setNewContent('')
    setView('write')
  }

  function refreshPrompt() {
    if (newType === 'phase_prompt') {
      setNewPrompt(getPhasePrompt(phase).text)
    } else if (newType === 'dream' || newType === 'shadow' || newType === 'insight') {
      setNewPrompt(getTypedPrompt(newType) || '')
    }
  }

  async function saveEntry() {
    if (!newContent.trim()) return
    setSaving(true)
    const symbols = newType === 'dream' ? extractDreamSymbols(newContent) : []
    const entry = {
      id: `j_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: newType,
      prompt: newPrompt,
      content: newContent.trim(),
      phase,
      depth: state?.depth || 1,
      createdAt: new Date().toISOString(),
      tags: [],
      symbols,
    }
    const updated = [entry, ...entries]
    setEntries(updated)
    await setStoreValue(KEYS.JOURNAL, updated)
    setSaving(false)
    setSelected(entry)
    setView('entry')
  }

  async function deleteEntry(id) {
    const updated = entries.filter(e => e.id !== id)
    setEntries(updated)
    await setStoreValue(KEYS.JOURNAL, updated)
    setView('list')
    setSelected(null)
  }

  const filtered = useMemo(() => {
    let list = entries
    if (typeFilter !== 'all') list = list.filter(e => e.type === typeFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(e =>
        e.content.toLowerCase().includes(q) ||
        (e.prompt && e.prompt.toLowerCase().includes(q))
      )
    }
    return list
  }, [entries, typeFilter, search])

  // ── List view ───────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="journal-layout">
        {/* Sidebar */}
        <div className="journal-sidebar">
          <div className="journal-sidebar-header">
            <span className="journal-glyph font-mono" style={{ color: phaseColour }}>≋</span>
            <div>
              <h2 className="font-serif journal-title">Journal</h2>
              <div className="text-dim journal-subtitle">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</div>
            </div>
          </div>

          <button
            className="btn-primary journal-new-btn"
            style={{ background: phaseColour, borderColor: phaseColour }}
            onClick={() => openWrite('phase_prompt')}
          >
            + New Entry
          </button>

          <input
            className="journal-search"
            placeholder="Search entries…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <div className="journal-type-filters">
            <button
              className={`filter-chip ${typeFilter === 'all' ? 'filter-chip--active' : ''}`}
              onClick={() => setTypeFilter('all')}
            >all</button>
            {ENTRY_TYPES.map(t => (
              <button
                key={t.id}
                className={`filter-chip ${typeFilter === t.id ? 'filter-chip--active' : ''}`}
                onClick={() => setTypeFilter(t.id)}
              >{t.label}</button>
            ))}
          </div>

          <div className="journal-entry-list">
            {filtered.length === 0 && (
              <div className="journal-empty-list text-dim">
                {entries.length === 0 ? 'No entries yet.' : 'No matches.'}
              </div>
            )}
            {filtered.map(entry => {
              const et = ENTRY_TYPES.find(t => t.id === entry.type)
              const pc = PHASE_COLOURS[entry.phase]?.colour || '#888'
              return (
                <button
                  key={entry.id}
                  className={`journal-entry-row ${selected?.id === entry.id ? 'journal-entry-row--active' : ''}`}
                  onClick={() => { setSelected(entry); setView('entry') }}
                >
                  <div className="journal-entry-row-top">
                    <span className="journal-entry-type font-mono" style={{ color: pc }}>{et?.glyph || '≋'}</span>
                    <span className="journal-entry-date text-dim">{formatDate(entry.createdAt)}</span>
                  </div>
                  <div className="journal-entry-preview">
                    {entry.prompt || entry.content.slice(0, 80)}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Main — empty state or dream symbol panel */}
        <div className="journal-main">
          {typeFilter === 'dream' && (() => {
            const dreamEntries = entries.filter(e => e.type === 'dream')
            const freq = buildSymbolFrequency(dreamEntries)
            return freq.length > 0 ? (
              <div className="dream-freq-panel">
                <div className="dream-freq-title font-mono text-dim">◈ Dream Symbol Map</div>
                <div className="dream-freq-subtitle text-dim">{dreamEntries.length} dream{dreamEntries.length !== 1 ? 's' : ''} recorded</div>
                <div className="dream-freq-list">
                  {freq.slice(0, 10).map(({ symbol, count }) => (
                    <div key={symbol} className="dream-freq-row">
                      <span className="dream-freq-symbol">{symbol}</span>
                      <div className="dream-freq-bar-wrap">
                        <div
                          className="dream-freq-bar"
                          style={{ width: `${(count / freq[0].count) * 100}%`, background: phaseColour }}
                        />
                      </div>
                      <span className="dream-freq-count text-dim font-mono">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="journal-empty-state">
                <span className="font-mono" style={{ color: phaseColour, fontSize: 32 }}>◈</span>
                <h3 className="font-serif">Dream Journal</h3>
                <p className="text-dim">Record your dreams and the app will map recurring symbols across all your entries.</p>
                <button className="btn-ghost" onClick={() => openWrite('dream')}>Record a Dream</button>
              </div>
            )
          })()}

          {typeFilter !== 'dream' && (
            <div className="journal-empty-state">
              <span className="journal-empty-glyph font-mono" style={{ color: phaseColour }}>≋</span>
              <h2 className="font-serif">The Record</h2>
              <p className="text-dim">What you write here is yours alone.<br />
              Phase-prompted reflection. Dreams. Insights. Shadow work.<br />
              The journal tracks the path you are actually walking.</p>
              <div className="journal-quick-actions">
                {ENTRY_TYPES.map(t => (
                  <button
                    key={t.id}
                    className="btn-ghost journal-quick-btn"
                    onClick={() => openWrite(t.id)}
                  >
                    <span className="font-mono">{t.glyph}</span> {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Write view ──────────────────────────────────────────────────────
  if (view === 'write') {
    const typeInfo = ENTRY_TYPES.find(t => t.id === newType) || ENTRY_TYPES[0]
    return (
      <div className="journal-layout">
        <div className="journal-sidebar">
          <button className="journal-back-btn text-dim" onClick={() => setView('list')}>← Back</button>
          <div className="journal-write-types">
            {ENTRY_TYPES.map(t => (
              <button
                key={t.id}
                className={`journal-type-btn ${newType === t.id ? 'journal-type-btn--active' : ''}`}
                onClick={() => {
                  setNewType(t.id)
                  if (t.id === 'phase_prompt') setNewPrompt(getPhasePrompt(phase).text)
                  else if (t.id === 'dream' || t.id === 'shadow' || t.id === 'insight') setNewPrompt(getTypedPrompt(t.id) || '')
                  else setNewPrompt('')
                }}
              >
                <span className="font-mono">{t.glyph}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="journal-main">
          <div className="journal-write-area">
            <div className="journal-write-header">
              <span className="font-mono" style={{ color: phaseColour }}>{typeInfo.glyph}</span>
              <span className="journal-write-type">{typeInfo.label}</span>
              <span className="text-dim" style={{ fontSize: 12 }}>
                {phaseGlyph} Phase {phase}
              </span>
            </div>

            {newPrompt && (newType === 'phase_prompt' || newType === 'dream' || newType === 'shadow' || newType === 'insight') && (
              <div className="journal-prompt-block" style={{ borderLeftColor: phaseColour }}>
                <div className="journal-prompt-text">{newPrompt}</div>
                <button className="journal-prompt-refresh text-dim" onClick={refreshPrompt}>
                  ↻ Different prompt
                </button>
              </div>
            )}

            <textarea
              className="journal-textarea"
              placeholder={
                newType === 'dream' ? 'Record your dream in as much detail as you can remember…' :
                newType === 'insight' ? 'What arrived?' :
                newType === 'shadow' ? 'What are you meeting?' :
                'Write freely…'
              }
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              autoFocus
            />

            <div className="journal-write-actions">
              <span className="text-dim journal-word-count">
                {newContent.trim().split(/\s+/).filter(Boolean).length} words
              </span>
              <button className="btn-ghost" onClick={() => setView('list')}>Discard</button>
              <button
                className="btn-primary"
                style={{ background: phaseColour, borderColor: phaseColour }}
                disabled={!newContent.trim() || saving}
                onClick={saveEntry}
              >
                {saving ? 'Saving…' : 'Save Entry'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Entry view ──────────────────────────────────────────────────────
  if (view === 'entry' && selected) {
    const et = ENTRY_TYPES.find(t => t.id === selected.type)
    const pc = PHASE_COLOURS[selected.phase]?.colour || '#888'
    return (
      <div className="journal-layout">
        <div className="journal-sidebar">
          <button className="journal-back-btn text-dim" onClick={() => setView('list')}>← All entries</button>
          <div className="journal-entry-list journal-entry-list--small">
            {entries.slice(0, 20).map(e => {
              const etc = ENTRY_TYPES.find(t => t.id === e.type)
              const epc = PHASE_COLOURS[e.phase]?.colour || '#888'
              return (
                <button
                  key={e.id}
                  className={`journal-entry-row ${selected?.id === e.id ? 'journal-entry-row--active' : ''}`}
                  onClick={() => setSelected(e)}
                >
                  <div className="journal-entry-row-top">
                    <span className="journal-entry-type font-mono" style={{ color: epc }}>{etc?.glyph || '≋'}</span>
                    <span className="journal-entry-date text-dim">{formatDate(e.createdAt)}</span>
                  </div>
                  <div className="journal-entry-preview">
                    {e.prompt || e.content.slice(0, 60)}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="journal-main">
          <div className="journal-entry-detail">
            <div className="journal-entry-detail-header">
              <div className="journal-entry-detail-meta text-dim">
                <span style={{ color: pc }}>{et?.glyph || '≋'} {et?.label}</span>
                <span>·</span>
                <span>{formatDate(selected.createdAt)} at {formatTime(selected.createdAt)}</span>
                <span>·</span>
                <span style={{ color: pc }}>{PHASE_COLOURS[selected.phase]?.glyph || ''} Phase {selected.phase}</span>
              </div>
            </div>

            {selected.prompt && (
              <div className="journal-entry-prompt" style={{ borderLeftColor: pc }}>
                {selected.prompt}
              </div>
            )}

            <div className="journal-entry-body">
              {selected.content.split('\n').map((line, i) => (
                line ? <p key={i}>{line}</p> : <br key={i} />
              ))}
            </div>

            {/* Dream symbols */}
            {selected.type === 'dream' && selected.symbols?.length > 0 && (
              <div className="dream-symbols-block">
                <div className="dream-symbols-label text-dim font-mono">Symbols detected</div>
                <div className="dream-symbols-list">
                  {selected.symbols.map(({ symbol, meaning }) => (
                    <div key={symbol} className="dream-symbol-row">
                      <span className="dream-symbol-name">◈ {symbol}</span>
                      <span className="dream-symbol-meaning text-dim">{meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="journal-entry-actions">
              {onNavigateTo && (
                <button
                  className="btn-ghost"
                  onClick={() => onNavigateTo('guide', { prefill: `I want to reflect on a recent ${selected.type === 'dream' ? 'dream' : 'journal entry'}. ` })}
                >
                  ⊚ Reflect with Guide
                </button>
              )}
              <button className="btn-ghost" onClick={() => {
                setNewType(selected.type)
                setNewPrompt(selected.prompt || '')
                setNewContent(selected.content)
                setView('write')
              }}>Edit</button>
              <button
                className="btn-ghost journal-delete-btn"
                onClick={() => deleteEntry(selected.id)}
              >Delete</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
