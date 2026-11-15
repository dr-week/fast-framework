# 01 — AI Agent Automation & Subagent Workflow

Zuari is built to be **AI-Agent Native**. Every rule, design token, and module boundary is encoded so coding agents (Claude Code, Antigravity, Cursor, Windsurf, Copilot, Codex) generate clean zero-Virtual-DOM code on the first pass.

---

## 1. `@zuari/mcp` Advisor & MCP Tools

Architecture recommendations and framework guidance live inside **`@zuari/mcp`** (`packages/mcp/src/advisor.ts` and `packages/mcp/src/index.ts`). Note that there is no separate `@zuari/advisor` package — everything is exposed cleanly through `@zuari/mcp`.

### Available Programmatic Exports & MCP Tools

| Exported Symbol (`@zuari/mcp`) | MCP Tool Name (`ZUARI_MCP_TOOLS`) | Purpose |
| :--- | :--- | :--- |
| `recommendZuariArchitecture` | `zuari_recommend_architecture` | Recommends the right `@zuari/*` packages and modular architecture for a target workload |
| `getCompactAiSystemPrompt` | `zuari_get_system_prompt` | Emits compact token-efficient Zuari coding rules for agent context injection |
| `submitZuariFeedback` | `zuari_submit_feedback` | Captures agent DX feedback on API friction or missing helpers |
| `getZuariGuidance` | `zuari_guide_agent` | Returns detailed syntax, placement, and package guidance for specific tasks |

Example usage in Node/MCP tooling:

```ts
import {
  recommendZuariArchitecture,
  getZuariGuidance,
  getCompactAiSystemPrompt,
} from '@zuari/mcp';

const plan = recommendZuariArchitecture('spatial dashboard with hardware telemetry');
const prompt = getCompactAiSystemPrompt();
```

---

## 2. `@zuari/ai` Prototyping & Streaming Inference

For applications running local AI workflows, **`@zuari/ai`** (`packages/ai/src/workflow.ts` and `packages/ai/src/stream.ts`) binds LLM token streaming and WebNN inference directly to fine-grained signals:

- **`createAIWorkflowEngine()`**: Factory returning an `AIWorkflowEngine` handle with reactive properties (`.state`, `.streamBuffer`, `.activeTokens`, `.latencyMs`, `.error`) and methods:
  - `.generate()` — Runs prompt execution into `.streamBuffer`
  - `.synthesizePrototype()` — Builds rapid zero-VDOM reactive prototype views
  - `.createAetherBadge(container?)` — Mounts a reactive `.aether-ai-badge` kinetic status badge
  - `.abort()` / `.destroy()` — Cancels active generation and disposes effects
- **`createPromptStream()`**: Streams tokens token-by-token directly into DOM text nodes without Virtual DOM re-renders.
- **`createWebNNGraph()`**: Helper for on-device WebNN tensor inference graphs.

---

## 3. Strict Zero-VDOM Code Generation Checklist

AI agents generating or editing Zuari TypeScript code must satisfy all 7 checks from `AGENTS.md`:

1. **No Virtual DOM or JSX**: Never emit `React.useState`, `useEffect`, or JSX syntax. Use `signal()`, `computed()`, `effect()`, `batch()` from `@zuari/signals` and `html\`...\``, `render()` from `@zuari/dom`.
2. **Pass signals directly into `html` template holes**:
   - Correct: ``html`<span>${count}</span>` `` (creates a direct reactive ChildPart).
   - Incorrect: ``html`<span>${count.value}</span>` `` (evaluates once unless wrapped as `() => count.value`).
3. **Keyed lists & conditional control flow (`@zuari/dom`)**:
   - Use `repeat(listSignal, item => item.id, item => html\`...\`)` for dynamic lists instead of `.map()`.
   - Use `when(condSignal, () => thenHtml, () => elseHtml)` and `match(stateSignal, cases, defaultCase)`.
4. **Lifecycle & untracked reads (`@zuari/signals`)**:
   - Use `untracked(() => sig.value)` inside effects/computeds when you intentionally want a non-subscribing read.
   - Use `effectScope()`, `onMount()`, and `onDestroy()` for automatic teardown of listeners and timers.
5. **Event binding syntax**:
   - Use `@click=${fn}`, `@input=${fn}`, `@keydown=${fn}` inside `html\`...\`` templates.
6. **Granular subpath imports (`"sideEffects": false`)**:
   - Import subpaths like `@zuari/ui/card`, `@zuari/ui/drawer`, or `@zuari/hardware/drone` rather than heavyweight barrels when targeting constrained environments.
7. **Deterministic teardown & live inspection**:
   - Retain `const { fragment, destroy } = render(view);` and call `destroy()` during view transitions.
   - Use `zuariDevTools.mountOverlay()` from `@zuari/devtools` to inspect live signals, FPS, and Wasm buffers.

---

## 4. Rule Synchronization Across AI Assistants

`AGENTS.md` in the repository root is the **single canonical source of truth** for coding agent instructions. Mirror files (`CLAUDE.md` and `.cursorrules`) and LLM entrypoints (`llms.txt` and `llms-full.txt`) are verified and synchronized by `scripts/sync-ai-rules.mjs`:

```bash
# Synchronize CLAUDE.md and .cursorrules from AGENTS.md (and verify llms.txt / llms-full.txt)
pnpm run sync:rules

# CI / pre-commit drift check without modifying files (exits 1 if out of sync)
pnpm run sync:rules -- --check
```

Always edit `AGENTS.md` first — never hand-edit `CLAUDE.md` or `.cursorrules` independently.

---

## 5. Parallel Subagent Delegation & Verification Loop

When splitting large Zuari features across multiple subagents or workers:

1. **Enforce strict directory ownership**: Partition parallel workstreams cleanly so no two agents edit the same files concurrently (for example: one subagent owns `packages/tokens` + `packages/presets`, another owns `packages/ui`, another owns `scripts/`, and another owns `docs/`).
2. **Scaffold cleanly**: New UI or hardware controls should be created with `pnpm run new:module submodule <ui|hardware> <name>` so `src/<name>/index.ts`, `src/index.ts`, and `package.json#exports` stay aligned.
3. **Run full verification after integration**: Because `@zuari/mcp` does not expose a separate static code-validator function, verify agent-authored changes against repository invariants using the full verification stack:

```bash
pnpm run sync:rules -- --check
pnpm run doctor
pnpm test
pnpm build
```
