import React, { useState, useEffect } from 'react'
import { getStoreValue, setStoreValue } from '../hooks/useStore'
import { KEYS } from '../../data/schema'
import './CovenantView.css'

const GLYPH_PRESETS = ['⊚', '✦', '◎', '⊕', '∴', '⊗', '☽', '☿', '♄', '∞']

export default function CovenantView({ onComplete, isRevisit = false }) {
  const [text, setText] = useState('')
  const [glyph, setGlyph] = useState('⊚')
  const [customGlyph, setCustomGlyph] = useState('')
  const [previous, setPrevious] = useState(null)
  const [sealed, setSealed] = useState(false)

  useEffect(() => {
    getStoreValue(KEYS.COVENANT).then(c => {
      if (c) {
        setPrevious(c)
        if (isRevisit) setGlyph(c.glyph || '⊚')
      }
    })
  }, [])

  const activeGlyph = customGlyph.trim().slice(0, 3) || glyph
  const canSeal = text.trim().length >= 50

  async function handleSeal() {
    const covenant = { text: text.trim(), glyph: activeGlyph, date: new Date().toISOString() }
    // Archive previous if exists
    if (previous) {
      const history = await getStoreValue(KEYS.COVENANT_HISTORY) || []
      await setStoreValue(KEYS.COVENANT_HISTORY, [...history, previous])
    }
    await setStoreValue(KEYS.COVENANT, covenant)
    setSealed(true)
    setTimeout(() => onComplete(covenant), 1800)
  }

  if (sealed) {
    return (
      <div className="covenant-screen covenant-screen--sealed">
        <div className="covenant-sealed-glyph">{activeGlyph}</div>
        <p className="covenant-sealed-text">Sealed.</p>
      </div>
    )
  }

  return (
    <div className="covenant-screen">
      <div className="covenant-content">
        <div className="covenant-glyph-display">{activeGlyph}</div>

        <h2 className="covenant-title">
          {isRevisit ? 'Your Covenant' : 'Before you enter'}
        </h2>

        <p className="covenant-intro">
          {isRevisit
            ? 'This is what you sealed. Does it still hold?'
            : 'The Mystery School asks one thing before you enter: that you write, in your own words, what you are here for.'}
        </p>

        {previous && !isRevisit && (
          <div className="covenant-previous">
            <p className="covenant-previous-label">Your last covenant:</p>
            <p className="covenant-previous-text">{previous.text}</p>
          </div>
        )}

        <textarea
          className="covenant-input"
          placeholder="What are you here to study? What will you do with what you learn? What do you promise to yourself? (Write freely — at least a few sentences.)"
          value={text}
          onChange={e => setText(e.target.value)}
          autoFocus
        />

        <div className="covenant-glyph-section">
          <p className="covenant-glyph-label">Your personal glyph</p>
          <div className="covenant-glyph-presets">
            {GLYPH_PRESETS.map(g => (
              <button
                key={g}
                className={`covenant-glyph-preset ${glyph === g && !customGlyph ? 'active' : ''}`}
                onClick={() => { setGlyph(g); setCustomGlyph('') }}
              >
                {g}
              </button>
            ))}
          </div>
          <input
            className="covenant-glyph-custom"
            placeholder="or type your own (1–3 chars)"
            value={customGlyph}
            onChange={e => setCustomGlyph(e.target.value.slice(0, 3))}
            maxLength={3}
          />
        </div>

        <button
          className="covenant-seal-btn"
          onClick={handleSeal}
          disabled={!canSeal}
        >
          {activeGlyph} Seal the Covenant
        </button>

        {isRevisit && (
          <button className="covenant-skip-btn" onClick={() => onComplete(null)}>
            It still holds — continue
          </button>
        )}

        {!isRevisit && (
          <button className="covenant-skip-btn" onClick={() => onComplete(null)}>
            Skip for now
          </button>
        )}
      </div>
    </div>
  )
}
