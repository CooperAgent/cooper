# Feature 002: Session Management Tools

**Source:** Cherry-picked from [Cooper PR #308](https://github.com/CooperAgent/cooper/pull/308) (branch `feature/session_tools`)
**Date added:** 2026-02-28
**Dependencies:** None

---

## What This Feature Does

Adds 7 custom tools that the AI can invoke to manage Cooper's session tabs programmatically. The AI can create new sessions, create git worktree sessions for parallel branch development, list/close sessions, query available models, and get current session info — all without the user manually clicking UI buttons.

---

## Architecture

```
Copilot SDK Session
    ↓ (tool invocation)
sessionTools.ts (tool handlers)
    ↓ (callbacks into main.ts closures)
main.ts (createNewSession, IPC sends)
    ↓ (IPC events)
preload.ts (bridge: onSessionCreatedByTool, onCloseSessionByTool)
    ↓ (event listeners)
App.tsx (creates/removes tabs in React state)
```

Tools are registered with the SDK session at creation time via `client.createSession({ tools: [...] })`. The tool handlers use callback functions passed from `main.ts` to access session state and create/close sessions. New tab creation and tab closing are communicated to the renderer via IPC events (not invoke — these are fire-and-forget notifications).

---

## Tools Provided

| Tool | Description |
|------|-------------|
| `cooper_create_session` | Create a new tab (optional cwd, model, initialPrompt). Defaults to current session's cwd/model. |
| `cooper_create_worktree_session` | Create a git worktree + session tab. Requires repoPath, branch, optional baseBranch (defaults to "main"). |
| `cooper_list_sessions` | List all active session tabs with id, model, cwd, isActive. |
| `cooper_close_session` | Close a session tab. Cannot close the current session. |
| `cooper_get_current_session` | Get current session's id, model, cwd. |
| `cooper_get_models` | List available AI models (id, name, multiplier). |
| `cooper_get_favorite_models` | List user's favorited model IDs. |

---

## Files to Create

### `src/main/sessionTools.ts`

Exports `createSessionTools(options)` which returns an array of `Tool<any>[]` for the Copilot SDK.

Key types:
```typescript
interface SessionToolsOptions {
  sessionId: string;
  getVerifiedModels: () => ModelInfo[];
  getSessions: () => Map<string, { model: string; cwd: string }>;
  getActiveSessionId: () => string | null;
  createSessionTab: (options: {
    cwd?: string; model?: string; initialPrompt?: string;
  }) => Promise<{ sessionId: string; model: string; cwd: string }>;
  closeSessionTab: (sessionId: string) => Promise<{ success: boolean; error?: string }>;
}
```

Uses `zod` for parameter validation, `defineTool` from `@github/copilot-sdk`, `electron-store` for favorite models, and `./worktree` for worktree creation.

**Scooper-specific adaptation:** The `ModelInfo` type matches scooper's simpler schema (`id`, `name`, `multiplier`) rather than upstream Cooper's extended version. The `cooper_create_worktree_session` tool includes a `baseBranch` parameter (defaults to "main") because scooper's `worktree.createWorktreeSession()` requires 3 args (repoPath, branch, baseBranch), not 2 like upstream Cooper.

---

## Files to Modify

### `src/main/main.ts`

#### 1. Add import
```typescript
import { createSessionTools } from './sessionTools';
```

#### 2. In `createNewSession()` — create session tools and combine with browser tools
After creating `browserTools`, create session tools with callbacks that close over `sessions`, `activeSessionId`, `mainWindow`, and `createNewSession`:

```typescript
const sessionTools = createSessionTools({
  sessionId: generatedSessionId,
  getVerifiedModels: getCachedModels,
  getSessions: () => { /* returns simplified Map */ },
  getActiveSessionId: () => activeSessionId,
  createSessionTab: async (options) => {
    const newSessionId = await createNewSession(options.model, options.cwd);
    // Send IPC event to renderer
    mainWindow.webContents.send('copilot:session-created-by-tool', { ... });
    return { sessionId, model, cwd };
  },
  closeSessionTab: async (targetSessionId) => {
    mainWindow.webContents.send('copilot:close-session-by-tool', { sessionId: targetSessionId });
    return { success: true };
  },
});

const allTools = [...browserTools, ...sessionTools];
```

Pass `allTools` instead of `browserTools` to `client.createSession({ tools: allTools })`.

#### 3. Add system message section for session tools
Append to the `systemMessage.content` string:

```
## Session Management Tools

You have tools to manage Cooper sessions:
- cooper_create_session: Create a new session tab (with optional cwd, model, initial message)
- cooper_create_worktree_session: Create a git worktree and open a session in it
- cooper_list_sessions: List all active Copilot sessions (tabs)
- cooper_close_session: Close a session tab
- cooper_get_current_session: Get info about the current session
- cooper_get_models: List available AI models
- cooper_get_favorite_models: Get user's favorite models
```

### `src/preload/preload.ts`

Add two new event bridge methods to the `copilot` namespace:

```typescript
onSessionCreatedByTool: (callback) => {
  // Listens for 'copilot:session-created-by-tool' IPC event
  // Data: { sessionId, model, cwd, initialPrompt? }
},
onCloseSessionByTool: (callback) => {
  // Listens for 'copilot:close-session-by-tool' IPC event
  // Data: { sessionId }
},
```

### `src/renderer/App.tsx`

Add two event handlers in the main `useEffect([], [])`:

1. **`onSessionCreatedByTool`** — Creates a new `TabState` with all required fields (including `activeSubagents: []` which scooper requires), adds it to tabs. If `initialPrompt` is present, sends it via `copilot.send()` and adds a user message to the tab.

2. **`onCloseSessionByTool`** — Calls `copilot.closeSession()` on the backend, removes the tab from state. If the closed tab was active, switches to the last remaining tab.

Both unsubscribe functions added to the cleanup return.

---

## Merge Notes

This was a manual implementation (branch not available remotely), applied from the PR diff. No merge conflicts — all insertion points were clean additive changes.

**Scooper-specific adaptations required:**
- `ModelInfo` type simplified to match scooper's schema (`id`, `name`, `multiplier` — no `vendor`/`tier`)
- `cooper_create_worktree_session` tool: added `baseBranch` parameter because scooper's `worktree.createWorktreeSession()` takes 3 args (upstream takes 2). Without this, `baseBranch.trim()` throws `Cannot read properties of undefined`
- `TabState` creation in renderer: added `activeSubagents: []` field (present in scooper but not in the PR's version)
- Message creation in renderer: added `id: generateId()` field (scooper requires message IDs)

---

## Key Design Decisions

- **Tools registered per-session** — each session gets its own tool instances with the session ID baked in, so the AI can't accidentally operate on the wrong session context
- **New tabs open in background** — `cooper_create_session` never switches the active tab, preventing disruption to the current conversation
- **IPC events not invokes** — session creation/close notifications use `webContents.send()` (fire-and-forget) rather than `ipcMain.handle()` because the renderer just needs to update its state
- **Self-close prevention** — `cooper_close_session` refuses to close the session that's running the tool
- **Callbacks pattern** — tool handlers receive callback functions rather than importing main.ts internals, keeping the module boundary clean
