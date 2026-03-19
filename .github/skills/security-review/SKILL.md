---
name: security-review
description: Review Electron security, IPC isolation, preload bridge safety, and input validation. Prevent common Electron security vulnerabilities in Cooper.
---

# Security Review

## Purpose

Review Electron security, IPC isolation, preload bridge safety, and input validation. Prevent common Electron security vulnerabilities in Cooper.

## When to Use

- Any change to `src/preload/preload.ts`
- New IPC channels or handlers in `src/main/`
- Changes involving user input, file system access, or shell execution
- Authentication or credential handling (Copilot SDK auth)

## When NOT to Use

- Pure UI styling changes
- Documentation-only changes

## Activation Rules

### Step 1: Electron Security Checklist

| Rule                             | Check                               | Severity    |
| -------------------------------- | ----------------------------------- | ----------- |
| No `nodeIntegration: true`       | `webPreferences` in main.ts         | 🔴 Critical |
| No `contextIsolation: false`     | `webPreferences` in main.ts         | 🔴 Critical |
| No `remote` module               | Anywhere in codebase                | 🔴 Critical |
| No Node.js globals in renderer   | `src/renderer/` files               | 🔴 Critical |
| All IPC goes through preload     | No direct `ipcRenderer` in renderer | 🟡 High     |
| Input validation on IPC handlers | `ipcMain.handle()` callbacks        | 🟡 High     |
| No shell injection               | `child_process` / PTY usage         | 🔴 Critical |
| No path traversal                | File system operations              | 🟡 High     |

### Step 2: IPC Security Review

For each IPC channel:

- **Validate inputs**: Check types and bounds on main process side
- **Minimize exposure**: Only expose what renderer needs
- **Namespace properly**: Use `copilot.*`, `git.*`, `voice.*`, `system.*`, `mcp.*` prefixes

### Step 3: Copilot SDK Security

- **Token handling**: Never expose tokens to renderer process
- **Session data**: Sanitize before sending to renderer
- **Tool execution**: Validate tool names and arguments before execution
- **File operations**: Validate paths, prevent directory traversal

### Step 4: PTY/Terminal Security

- **Shell commands**: Never construct shell commands from user input without validation
- **Working directory**: Validate path exists and is within expected bounds
- **Environment variables**: Don't leak secrets through env

## Cooper-Specific Patterns

**Safe IPC exposure (preload.ts):**

```typescript
// ✅ Good: namespaced, typed, minimal surface
copilot: {
  sendMessage: (sessionId: string, message: string) =>
    ipcRenderer.invoke('copilot:send-message', sessionId, message),
}

// ❌ Bad: raw IPC access exposed
ipcRenderer: ipcRenderer  // NEVER DO THIS
```

**Safe input validation (main.ts):**

```typescript
ipcMain.handle('system:open-path', async (_, path: string) => {
  // ✅ Validate before acting
  if (!path || typeof path !== 'string') throw new Error('Invalid path');
  const resolved = resolve(path);
  if (!resolved.startsWith(allowedBase)) throw new Error('Path not allowed');
  // proceed...
});
```

## Success Criteria

- No Electron security rules violated
- All IPC inputs validated
- No Node.js globals leaked to renderer
- No secrets in code or logs

## Related Skills

- [electron-ipc-patterns](../electron-ipc-patterns/) — For IPC implementation patterns
