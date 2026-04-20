import React, { useState, useEffect, useRef } from 'react'
import { generateSigil } from '../../engine/sigilGenerator'
import { INITIATION_ADDRESSES } from '../../data/initiationAddresses'
import { getStoreValue, setStoreValue } from '../hooks/useStore'
import { KEYS } from '../../data/schema'
import './InitiationRiteView.css'

export default function InitiationRiteView({ classroom, journeyData, onComplete }) {
  const [phase, setPhase] = useState('scroll')   // scroll | address | sigil | done
  const [sigil, setSigil] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const scrollRef = useRef(null)
  const address = INITIATION_ADDRESSES[classroom.id] || {
    title: classroom.name,
    address: `You have completed ${classroom.name}. The work you did here is real. Carry it forward.`,
  }

  // Generate and persist sigil
  useEffect(() => {
    const seed = `${classroom.id}:${journeyData?.completedAt || Date.now()}`
    const svg = generateSigil(seed, 140)
    setSigil(svg)

    async function persistSigil() {
      const existing = await getStoreValue(KEYS.INITIATION_SIGILS) || {}
      await setStoreValue(KEYS.INITIATION_SIGILS, {
        ...existing,
        [classroom.id]: { sigil: svg, date: new Date().toISOString() },
      })
      const initiated = await getStoreValue(KEYS.INITIATED_CLASSROOMS) || []
      if (!initiated.includes(classroom.id)) {
        await setStoreValue(KEYS.INITIATED_CLASSROOMS, [...initiated, classroom.id])
      }
    }
    persistSigil()
  }, [])

  function handleScroll(e) {
    const el = e.target
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 30) setScrolled(true)
  }

  return (
    <div className="rite-initiation-screen">
      <div className="rite-init-content">

        {phase === 'scroll' && (
          <>
            <div className="rite-init-header">
              <span className="rite-init-glyph font-mono">{classroom.glyph}</span>
              <h2 className="rite-init-title">Initiated</h2>
              <p className="rite-init-subtitle">{address.title}</p>
            </div>

            <p className="rite-init-label">Your journey through this classroom:</p>
            <div className="rite-init-scroll" ref={scrollRef} onScroll={handleScroll}>
              {journeyData?.subjects?.map((s, i) => (
                <div key={i} className="rite-journey-row">
                  <span className="rite-journey-glyph font-mono">⊕</span>
                  <div>
                    <div className="rite-journey-name">{s.name}</div>
                    {s.masteryNote && (
                      <div className="rite-journey-note text-dim">"{s.masteryNote}"</div>
                    )}
                  </div>
                </div>
              ))}
              {journeyData?.practiceCount > 0 && (
                <div className="rite-journey-row rite-journey-row--stat">
                  <span className="rite-journey-glyph font-mono">◎</span>
                  <div className="rite-journey-name text-dim">
                    {journeyData.practiceCount} practice sessions completed
                  </div>
                </div>
              )}
            </div>

            <button
              className="rite-init-btn"
              onClick={() => setPhase('address')}
              disabled={!scrolled && (journeyData?.subjects?.length || 0) > 3}
            >
              Continue →
            </button>
            {!scrolled && (journeyData?.subjects?.length || 0) > 3 && (
              <p className="rite-init-scroll-hint text-dim">Scroll to the end of your journey</p>
            )}
          </>
        )}

        {phase === 'address' && (
          <>
            <div className="rite-init-header">
              <span className="rite-init-glyph font-mono">⊚</span>
            </div>
            <p className="rite-init-address">{address.address}</p>
            <button className="rite-init-btn" onClick={() => setPhase('sigil')}>
              Receive your sigil →
            </button>
          </>
        )}

        {phase === 'sigil' && (
          <>
            <div className="rite-init-header">
              <h2 className="rite-init-title">Your Sigil</h2>
              <p className="rite-init-subtitle text-dim">
                Forged from your specific journey through {address.title}
              </p>
            </div>
            <div
              className="rite-init-sigil"
              dangerouslySetInnerHTML={{ __html: sigil }}
            />
            <p className="rite-init-sigil-note text-dim">
              This sigil is yours alone — deterministically generated from your path.
              No two are identical.
            </p>
            <button className="rite-init-btn" onClick={onComplete}>
              Enter the school
            </button>
          </>
        )}

      </div>
    </div>
  )
}
