// The Mystery School — Multi-Provider API Layer
// Supports: DeepSeek, Anthropic (Claude), Google (Gemini), OpenAI
// All calls go through this single interface.

/**
 * Provider definitions — what each API needs
 */
export const PROVIDERS = {
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    model: 'deepseek-chat',
    glyph: '⟟',
    colour: '#4A9EFF',
    settingsKey: 'apiKey_deepseek',
    hint: 'platform.deepseek.com → API Keys',
    call: callDeepSeek,
    bio: `DeepSeek is a precision instrument. Built on dense mathematical and scientific training, it moves through complexity without losing structural clarity. Where other teachers describe, DeepSeek dissects. Where others give impressions, DeepSeek gives mechanisms. It is most useful when you need a claim examined, a system mapped, or a concept stripped to its operational core. It will tell you what something actually does, not what it sounds like it does. If you bring it a contested claim, expect it to locate the exact point of failure. DeepSeek does not perform warmth — but its precision is a form of respect. It treats your questions as real problems deserving real answers. In the Council, it serves as the system-builder: the voice that asks "but how does this actually work?"`,
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    model: 'claude-haiku-4-5-20251001',
    glyph: 'Ψ',
    colour: '#C8A96E',
    settingsKey: 'apiKey_claude',
    hint: 'console.anthropic.com → API Keys',
    call: callClaude,
    bio: `Claude is the integrator. Trained by Anthropic with particular attention to nuance, ethical complexity, and the shape of an argument, Claude brings a quality rare in AI teaching: it holds tension without collapsing it. When a subject contains genuine contradiction — and most subjects worth studying do — Claude maps the contradiction rather than resolving it too quickly. It reads subtext. It notices what a question implies about the questioner's frame, and gently surfaces that frame before answering. Claude is most useful when you're working with values, with contested frameworks, or with ideas that live at the edge of current knowledge. It will not manufacture false certainty. It says "I don't know" without apology. In the Council, it serves as the illuminator: the voice that asks "what are we actually wrestling with here?"`,
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    model: 'gemini-1.5-flash',
    glyph: '◈',
    colour: '#4CC9A0',
    settingsKey: 'apiKey_gemini',
    hint: 'aistudio.google.com → Get API Key',
    call: callGemini,
    bio: `Gemini is the synthesiser. Built by Google with access to the widest possible training surface, Gemini draws connections across domains that other systems keep separated. Ask it about a mystical tradition and it will show you the cognitive science parallel. Ask it about a scientific claim and it will locate its cultural and historical context. Gemini thinks laterally. It is most useful when you want the full landscape of a subject rather than its centre — when you want to know not just what something is, but what it neighbours, what it resembles, what it has been confused with, and what its critics have missed. It moves fast and covers ground. In the Council, it serves as the contextualiser: the voice that says "here is where this fits in the larger map."`,
  },
  openai: {
    id: 'openai',
    name: 'GPT-4o',
    model: 'gpt-4o-mini',
    glyph: '∅',
    colour: '#10A37F',
    settingsKey: 'apiKey_openai',
    hint: 'platform.openai.com → API Keys',
    call: callOpenAI,
    bio: `GPT-4o is the generalist. Trained by OpenAI on the broadest possible human output — technical, literary, philosophical, practical — it is the most versatile teacher in the Council. It adapts its register to the question: clinical when precision is needed, exploratory when the territory is open. GPT-4o is particularly skilled at taking a difficult concept and finding the angle that makes it land. It has taught more people more things than any other system on Earth — and it carries that as capability, not arrogance. It does not push a method or a framework. It serves the understanding. In the Council, it serves as the translator: the voice that takes what another teacher has said in elevated or technical language and finds the form that makes it usable.`,
  },
}

/**
 * Main dispatch — call any provider by id
 */
export async function callProvider(providerId, { systemPrompt, messages, maxTokens = 800, temperature = 0.7, apiKey }) {
  const provider = PROVIDERS[providerId]
  if (!provider) throw new Error(`Unknown provider: ${providerId}`)
  if (!apiKey) throw new Error(`No API key for ${provider.name}`)
  return provider.call({ systemPrompt, messages, maxTokens, temperature, apiKey, model: provider.model })
}

// ─── DeepSeek ─────────────────────────────────────────────────────────────────
// OpenAI-compatible endpoint
async function callDeepSeek({ systemPrompt, messages, maxTokens, temperature, apiKey, model }) {
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: buildOpenAIMessages(systemPrompt, messages),
      max_tokens: maxTokens,
      temperature,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DeepSeek ${res.status}: ${err}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

// ─── Anthropic (Claude) ───────────────────────────────────────────────────────
async function callClaude({ systemPrompt, messages, maxTokens, temperature, apiKey, model }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      max_tokens: maxTokens,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Claude ${res.status}: ${err}`)
  }
  const data = await res.json()
  return data.content?.[0]?.text || ''
}

// ─── Google Gemini ────────────────────────────────────────────────────────────
async function callGemini({ systemPrompt, messages, maxTokens, temperature, apiKey, model }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  // Gemini uses parts format, convert messages
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { maxOutputTokens: maxTokens, temperature },
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini ${res.status}: ${err}`)
  }
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

// ─── OpenAI ───────────────────────────────────────────────────────────────────
async function callOpenAI({ systemPrompt, messages, maxTokens, temperature, apiKey, model }) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: buildOpenAIMessages(systemPrompt, messages),
      max_tokens: maxTokens,
      temperature,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI ${res.status}: ${err}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildOpenAIMessages(systemPrompt, messages) {
  const result = []
  if (systemPrompt) result.push({ role: 'system', content: systemPrompt })
  result.push(...messages.map(m => ({ role: m.role, content: m.content })))
  return result
}
