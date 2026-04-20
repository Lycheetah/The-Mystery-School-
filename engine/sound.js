// Sound Engine — Web Audio API synthesis only. No external files.
// Ambient phase drones + practice-specific audio (bells, whoosh, tones).
// All sounds are synthesized in real-time.

let ctx = null
let ambientNodes = []   // currently playing ambient nodes
let ambientGain = null
let masterGain = null

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

// ─── Settings ─────────────────────────────────────────────────────────────────

let ambientEnabled = false
let ambientVolume = 0.12   // 0-1

export function setAmbientEnabled(val) { ambientEnabled = val; if (!val) stopAmbient() }
export function setAmbientVolume(vol) {
  ambientVolume = vol
  if (ambientGain) ambientGain.gain.setTargetAtTime(vol * 0.15, getCtx().currentTime, 0.5)
}
export function getAmbientEnabled() { return ambientEnabled }
export function getAmbientVolume() { return ambientVolume }

// ─── Ambient Drone by Phase ────────────────────────────────────────────────────
// Each phase: a low sine drone + overtone(s). Gentle, non-intrusive.

const PHASE_DRONE = {
  1: { freq: 110,  overtones: [1, 2],      detune: 0,   label: 'CENTER — low steady hum' },
  2: { freq: 123.5, overtones: [1, 1.5],   detune: 3,   label: 'FLOW — two tones oscillating' },
  3: { freq: 138.6, overtones: [1, 3, 5],  detune: 0,   label: 'INSIGHT — crystalline series' },
  4: { freq: 155.6, overtones: [1, 2, 4],  detune: 0,   label: 'RISE — rising harmonic' },
  5: { freq: 174.6, overtones: [1],        detune: 0,   label: 'CLARITY — pure sine' },
  6: { freq: 185,   overtones: [1],        detune: 0,   label: 'WITNESS — near silence, rare ping' },
  7: { freq: 110,   overtones: [1, 2, 2.01], detune: 0, label: 'RETURN — beating tones' },
}

export function startAmbient(phase) {
  if (!ambientEnabled) return
  stopAmbient()

  const ac = getCtx()
  if (ac.state === 'suspended') ac.resume()

  masterGain = ac.createGain()
  masterGain.gain.value = 0
  masterGain.connect(ac.destination)

  ambientGain = masterGain

  const config = PHASE_DRONE[phase] || PHASE_DRONE[1]
  const nodes = []

  config.overtones.forEach((mult, i) => {
    const osc = ac.createOscillator()
    const gain = ac.createGain()

    osc.type = 'sine'
    osc.frequency.value = config.freq * mult
    if (config.detune && i === config.overtones.length - 1) {
      osc.detune.value = config.detune * 100 // cents
    }

    // Each overtone quieter than the fundamental
    gain.gain.value = i === 0 ? 1.0 : 0.3 / i

    osc.connect(gain)
    gain.connect(masterGain)
    osc.start()
    nodes.push({ osc, gain })
  })

  ambientNodes = nodes

  // Fade in
  masterGain.gain.setTargetAtTime(ambientVolume * 0.15, ac.currentTime, 3)
}

export function stopAmbient() {
  if (!masterGain) return
  const ac = getCtx()
  masterGain.gain.setTargetAtTime(0, ac.currentTime, 1.5)
  setTimeout(() => {
    ambientNodes.forEach(({ osc }) => { try { osc.stop() } catch(e) {} })
    ambientNodes = []
    masterGain = null
    ambientGain = null
  }, 2500)
}

// ─── Singing Bowl Strike ───────────────────────────────────────────────────────
// Harmonic partials of a real bowl, exponential decay

export function strikeBowl(volume = 0.6) {
  const ac = getCtx()
  if (ac.state === 'suspended') ac.resume()

  const partials = [
    { freq: 432, gain: 0.6, decay: 3.5 },
    { freq: 1210, gain: 0.25, decay: 2.8 },
    { freq: 2430, gain: 0.12, decay: 1.8 },
    { freq: 3645, gain: 0.06, decay: 1.2 },
  ]

  partials.forEach(({ freq, gain, decay }) => {
    const osc = ac.createOscillator()
    const gainNode = ac.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gainNode.gain.setValueAtTime(gain * volume, ac.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + decay)
    osc.connect(gainNode)
    gainNode.connect(ac.destination)
    osc.start()
    osc.stop(ac.currentTime + decay + 0.05)
  })
}

// ─── Interval Bell (for meditation) ──────────────────────────────────────────

export function ringIntervalBell(volume = 0.4) {
  const ac = getCtx()
  if (ac.state === 'suspended') ac.resume()

  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'sine'
  osc.frequency.value = 528   // healing frequency resonance
  gain.gain.setValueAtTime(volume, ac.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 2.5)
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start()
  osc.stop(ac.currentTime + 2.6)
}

// ─── Breath whoosh tones ──────────────────────────────────────────────────────
// Gentle filtered noise for inhale/exhale cues

export function playInhaleTone(duration = 4, volume = 0.15) {
  const ac = getCtx()
  if (ac.state === 'suspended') ac.resume()

  // Rising sine for inhale feel
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(220, ac.currentTime)
  osc.frequency.linearRampToValueAtTime(330, ac.currentTime + duration)
  gain.gain.setValueAtTime(0.001, ac.currentTime)
  gain.gain.linearRampToValueAtTime(volume, ac.currentTime + 0.3)
  gain.gain.linearRampToValueAtTime(0.001, ac.currentTime + duration)
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start()
  osc.stop(ac.currentTime + duration + 0.05)
}

export function playExhaleTone(duration = 4, volume = 0.12) {
  const ac = getCtx()
  if (ac.state === 'suspended') ac.resume()

  // Falling sine for exhale feel
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(330, ac.currentTime)
  osc.frequency.linearRampToValueAtTime(220, ac.currentTime + duration)
  gain.gain.setValueAtTime(0.001, ac.currentTime)
  gain.gain.linearRampToValueAtTime(volume, ac.currentTime + 0.3)
  gain.gain.linearRampToValueAtTime(0.001, ac.currentTime + duration)
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start()
  osc.stop(ac.currentTime + duration + 0.05)
}

export function playHoldTone(duration = 4, volume = 0.06) {
  const ac = getCtx()
  if (ac.state === 'suspended') ac.resume()

  // Steady low tone for holds
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'sine'
  osc.frequency.value = 256
  gain.gain.setValueAtTime(0.001, ac.currentTime)
  gain.gain.linearRampToValueAtTime(volume, ac.currentTime + 0.2)
  gain.gain.linearRampToValueAtTime(volume, ac.currentTime + duration - 0.2)
  gain.gain.linearRampToValueAtTime(0.001, ac.currentTime + duration)
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start()
  osc.stop(ac.currentTime + duration + 0.05)
}

// ─── Shadow work ambient drone ────────────────────────────────────────────────

export function startShadowDrone(volume = 0.08) {
  const ac = getCtx()
  if (ac.state === 'suspended') ac.resume()

  const gain = ac.createGain()
  gain.gain.value = 0
  gain.connect(ac.destination)

  const osc1 = ac.createOscillator()
  osc1.type = 'sine'
  osc1.frequency.value = 55   // sub-bass ground
  osc1.connect(gain)
  osc1.start()

  const osc2 = ac.createOscillator()
  osc2.type = 'sine'
  osc2.frequency.value = 55.3  // slight detune for beating
  osc2.connect(gain)
  osc2.start()

  gain.gain.setTargetAtTime(volume, ac.currentTime, 2)

  return {
    stop: () => {
      gain.gain.setTargetAtTime(0, ac.currentTime, 1.5)
      setTimeout(() => {
        try { osc1.stop(); osc2.stop() } catch(e) {}
      }, 2500)
    }
  }
}
