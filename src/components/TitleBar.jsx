import React, { useState, useEffect } from 'react'
import './TitleBar.css'

export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)
  const isMac = window.appBridge?.platform === 'darwin'

  function minimize()  { window.appBridge?.minimize() }
  function maximize()  {
    window.appBridge?.maximize().then(m => setIsMaximized(!!m))
  }
  function close()     { window.dispatchEvent(new CustomEvent('app:close-requested')) }

  // Mac gets native traffic lights — show nothing
  if (isMac) return <div className="titlebar titlebar--mac" />

  return (
    <div className="titlebar">
      <div className="titlebar-drag">
        <span className="titlebar-glyph font-mono">⊚</span>
        <span className="titlebar-name font-serif">The Mystery School</span>
      </div>
      <div className="titlebar-controls">
        <button className="titlebar-btn titlebar-btn--min" onClick={minimize} title="Minimize">
          <svg width="10" height="1" viewBox="0 0 10 1"><rect width="10" height="1" fill="currentColor"/></svg>
        </button>
        <button className="titlebar-btn titlebar-btn--max" onClick={maximize} title={isMaximized ? 'Restore' : 'Maximize'}>
          {isMaximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <rect x="2" y="0" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1"/>
              <rect x="0" y="2" width="8" height="8" fill="var(--surface)" stroke="currentColor" strokeWidth="1"/>
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <rect x="0" y="0" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1"/>
            </svg>
          )}
        </button>
        <button className="titlebar-btn titlebar-btn--close" onClick={close} title="Close">
          <svg width="10" height="10" viewBox="0 0 10 10">
            <line x1="0" y1="0" x2="10" y2="10" stroke="currentColor" strokeWidth="1.2"/>
            <line x1="10" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
