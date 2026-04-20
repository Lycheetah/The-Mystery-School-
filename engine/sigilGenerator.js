// Deterministic SVG sigil generator — same seed always produces same sigil
// No randomness, no DOM, no side effects. Input: string. Output: SVG string.

function hashSeed(str) {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = (h * 0x01000193) >>> 0
  }
  return h
}

function seededFloat(seed, index) {
  const h = hashSeed(seed + ':' + index)
  return (h % 10000) / 10000
}

export function generateSigil(seed, size = 120) {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.38

  // Derive parameters from seed
  const petals = 3 + (hashSeed(seed + ':p') % 5)          // 3–7 petals
  const rings = 1 + (hashSeed(seed + ':r') % 3)            // 1–3 rings
  const rotation = seededFloat(seed, 0) * Math.PI * 2
  const innerScale = 0.4 + seededFloat(seed, 1) * 0.35     // 0.4–0.75
  const hasHex = seededFloat(seed, 2) > 0.5
  const hasDots = seededFloat(seed, 3) > 0.4
  const strokeW = 1 + seededFloat(seed, 4) * 1.5

  const paths = []

  // Outer ring
  paths.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-width="${strokeW.toFixed(2)}" opacity="0.6"/>`)

  // Petal lines from centre
  for (let i = 0; i < petals; i++) {
    const angle = rotation + (i / petals) * Math.PI * 2
    const x1 = cx + Math.cos(angle) * r * 0.2
    const y1 = cy + Math.sin(angle) * r * 0.2
    const x2 = cx + Math.cos(angle) * r
    const y2 = cy + Math.sin(angle) * r
    paths.push(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="currentColor" stroke-width="${strokeW.toFixed(2)}" opacity="0.7"/>`)
  }

  // Inner polygon
  const iPoints = []
  for (let i = 0; i < petals; i++) {
    const angle = rotation + (i / petals) * Math.PI * 2
    iPoints.push(`${(cx + Math.cos(angle) * r * innerScale).toFixed(1)},${(cy + Math.sin(angle) * r * innerScale).toFixed(1)}`)
  }
  paths.push(`<polygon points="${iPoints.join(' ')}" fill="none" stroke="currentColor" stroke-width="${strokeW.toFixed(2)}" opacity="0.5"/>`)

  // Optional extra rings
  for (let ri = 1; ri <= rings - 1; ri++) {
    const rr = r * (0.55 + ri * 0.1)
    paths.push(`<circle cx="${cx}" cy="${cy}" r="${rr.toFixed(1)}" fill="none" stroke="currentColor" stroke-width="${(strokeW * 0.6).toFixed(2)}" opacity="0.3"/>`)
  }

  // Optional hexagram
  if (hasHex) {
    const hPoints1 = [], hPoints2 = []
    for (let i = 0; i < 3; i++) {
      const a1 = rotation + (i / 3) * Math.PI * 2
      const a2 = rotation + Math.PI / 3 + (i / 3) * Math.PI * 2
      hPoints1.push(`${(cx + Math.cos(a1) * r * 0.62).toFixed(1)},${(cy + Math.sin(a1) * r * 0.62).toFixed(1)}`)
      hPoints2.push(`${(cx + Math.cos(a2) * r * 0.62).toFixed(1)},${(cy + Math.sin(a2) * r * 0.62).toFixed(1)}`)
    }
    paths.push(`<polygon points="${hPoints1.join(' ')}" fill="none" stroke="currentColor" stroke-width="${(strokeW * 0.7).toFixed(2)}" opacity="0.4"/>`)
    paths.push(`<polygon points="${hPoints2.join(' ')}" fill="none" stroke="currentColor" stroke-width="${(strokeW * 0.7).toFixed(2)}" opacity="0.4"/>`)
  }

  // Centre dot
  paths.push(`<circle cx="${cx}" cy="${cy}" r="${(size * 0.025).toFixed(1)}" fill="currentColor" opacity="0.8"/>`)

  // Optional accent dots at petal tips
  if (hasDots) {
    for (let i = 0; i < petals; i++) {
      const angle = rotation + (i / petals) * Math.PI * 2
      const dx = cx + Math.cos(angle) * r
      const dy = cy + Math.sin(angle) * r
      paths.push(`<circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="${(size * 0.018).toFixed(1)}" fill="currentColor" opacity="0.6"/>`)
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${paths.join('')}</svg>`
}
