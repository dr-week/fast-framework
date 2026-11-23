/**
 * @fileoverview Tiered Multi-Provider LLM Cascade with Cooldown Gating & JSON Extraction.
 * Supports BYOK (Gemini, OpenAI-compatible: Groq/OpenRouter/local), zero-key Pollinations
 * fallback with automatic cooldown protection, and deterministic local fallback.
 */

export type LlmProviderMode = 'gemini' | 'openai-compat' | 'pollinations' | 'local';

export interface LlmCascadeConfig {
  mode: LlmProviderMode;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  timeoutMs?: number;
  cooldownMs?: number;
  fetchImpl?: typeof fetch;
}

export interface LlmPromptInput {
  system: string;
  user: string;
  temperature?: number;
  expectJson?: boolean;
}

export interface LlmCascadeResult {
  text: string;
  provider: LlmProviderMode;
  fallbackUsed: boolean;
}

/**
 * Strips markdown code fences and extracts the outermost JSON object or array.
 */
export function extractJsonBlock(raw: string): string {
  const s = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  const start = s.search(/[\[{]/);
  if (start === -1) return s;
  const end = s[start] === '{' ? s.lastIndexOf('}') : s.lastIndexOf(']');
  return end > start ? s.slice(start, end + 1) : s;
}

export function createLlmCascade(
  config: LlmCascadeConfig,
  options: { localFallback?: (input: LlmPromptInput) => string | Promise<string> } = {}
) {
  const fetchFn = config.fetchImpl ?? globalThis.fetch;
  const timeoutMs = config.timeoutMs ?? 20_000;
  const cooldownMs = config.cooldownMs ?? 45_000;
  let lastFreeCallTs = 0;

  async function timedFetch(url: string, init: RequestInit): Promise<Response> {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      return await fetchFn(url, { ...init, signal: ctrl.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  async function callGemini(input: LlmPromptInput): Promise<string> {
    if (!config.apiKey?.trim()) throw new Error('Gemini API key is required.');
    const model = config.model?.trim() || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(config.apiKey.trim())}`;
    const resp = await timedFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: input.system }] },
        contents: [{ role: 'user', parts: [{ text: input.user }] }],
        generationConfig: {
          temperature: input.temperature ?? 0.7,
          ...(input.expectJson ? { responseMimeType: 'application/json' } : {}),
        },
      }),
    });
    if (!resp.ok) throw new Error(`Gemini HTTP ${resp.status}`);
    const data = (await resp.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty Gemini response.');
    return text;
  }

  async function callOpenAiCompat(input: LlmPromptInput): Promise<string> {
    if (!config.apiKey?.trim()) throw new Error('API key is required for openai-compat mode.');
    const base = (config.baseUrl || 'https://api.groq.com/openai/v1').replace(/\/$/, '');
    const model = config.model?.trim() || 'llama-3.3-70b-versatile';
    const resp = await timedFetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey.trim()}`,
      },
      body: JSON.stringify({
        model,
        temperature: input.temperature ?? 0.7,
        ...(input.expectJson ? { response_format: { type: 'json_object' } } : {}),
        messages: [
          { role: 'system', content: input.system },
          { role: 'user', content: input.user },
        ],
      }),
    });
    if (!resp.ok) throw new Error(`OpenAI-compat HTTP ${resp.status}`);
    const data = (await resp.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error('Empty OpenAI-compat response.');
    return text;
  }

  async function callPollinations(input: LlmPromptInput): Promise<string> {
    const now = Date.now();
    if (now - lastFreeCallTs < cooldownMs) {
      throw new Error('Free LLM cooldown active.');
    }
    lastFreeCallTs = now;
    const resp = await timedFetch(config.baseUrl || 'https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model?.trim() || 'openai-fast',
        messages: [
          { role: 'system', content: input.system },
          { role: 'user', content: input.user },
        ],
      }),
    });
    if (!resp.ok) throw new Error(`Pollinations HTTP ${resp.status}`);
    const data = (await resp.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error('Empty Pollinations response.');
    return text;
  }

  async function generate(input: LlmPromptInput): Promise<LlmCascadeResult> {
    try {
      if (config.mode === 'gemini') {
        return { text: await callGemini(input), provider: 'gemini', fallbackUsed: false };
      }
      if (config.mode === 'openai-compat') {
        return { text: await callOpenAiCompat(input), provider: 'openai-compat', fallbackUsed: false };
      }
      if (config.mode === 'pollinations') {
        return { text: await callPollinations(input), provider: 'pollinations', fallbackUsed: false };
      }
    } catch (err) {
      if (options.localFallback) {
        return {
          text: await options.localFallback(input),
          provider: 'local',
          fallbackUsed: true,
        };
      }
      throw err;
    }

    if (options.localFallback) {
      return {
        text: await options.localFallback(input),
        provider: 'local',
        fallbackUsed: false,
      };
    }
    throw new Error('No LLM provider or localFallback configured.');
  }

  return { generate };
}
