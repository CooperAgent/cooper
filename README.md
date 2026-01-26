# Copilot Skins

<p align="center">
  <img src="build/icon.png" alt="Copilot Skins Logo" width="128" height="128">
</p>

A native desktop GUI for GitHub Copilot, wrapping the [Copilot SDK](https://github.blog/changelog/2026-01-14-copilot-sdk-in-technical-preview/) and the Copilot agentic logic.

Watch Copilot Skins building itself in action!

![Copilot Skins Demo](https://github.com/idofrizler/copilot-ui/releases/download/assets/Copilot.Skins.2-4.gif)

## Features

### 🗂️ Multiple Sessions, Multiple Contexts

CLI gives you one session at a time. Copilot Skins gives you tabs—each with its own working directory, model, and conversation history.

Each session maintains its own working directory, model, allowed commands, and file changes. Switch tabs instantly. No re-explaining context. No restarting sessions.

### 🌳 Git Worktree Sessions

Instead of just a new tab, create a worktree session—a completely isolated git worktree tied to a branch.

Paste a GitHub issue URL. Copilot Skins fetches the issue (title, body, comments), creates a git worktree in `~/.copilot-sessions/` and opens a new session in that worktree.

Work on multiple issues simultaneously without stashing, switching branches, or losing your place. Each worktree is a real directory—run builds, tests, whatever you need.

### 🔁 Ralph Wiggum: Iterative Agent Mode

Named after [Claude Code's ralph-wiggum plugin](https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum), this feature lets the agent run in a loop until a task is actually done.

You prompt with completion criteria → agent works → checks its work → continues if not done → repeats up to N times. Perfect for tasks that need multiple passes to get right.

### 💻 Embedded Terminal

Every session has a terminal panel that runs in the session's working directory. It's a real PTY (xterm.js), not a fake console.

Click "Add to Message" and the terminal's output buffer gets attached to your next prompt. See a build error? One click to show it to the agent. No copy-paste, no explaining—just "fix this" with full context.

### More Features

- 🔐 **Allowed Commands** — Per-session and global command allowlisting with visual management
- 🔌 **MCP Servers** — Configure Model Context Protocol servers for extended tool capabilities
- 🎯 **Agent Skills** — Personal and project skills via `SKILL.md` files (compatible with Claude format)
- 📦 **Context Compaction** — Automatic conversation summarization when approaching token limits
- 🎨 **Themes** — Custom themes via JSON, including some nostalgic ones (ICQ, Night Owl)
- 🤖 **Multi-Model** — Switch between GPT-4.1, GPT-5, Claude Opus-4, Sonnet, Haiku, Gemini, and more

## Prerequisites

- Node.js 22+ (required for Copilot SDK)
- GitHub Copilot subscription
- GitHub CLI authenticated (`gh auth login`)

## Installation

### Build the App (macOS)

Building locally avoids macOS Gatekeeper issues with unsigned apps:

```bash
# Clone and install
git clone https://github.com/idofrizler/copilot-ui.git
cd copilot-ui

# Build the DMG
npm run dist

# Install
open release/Copilot-Skins-*-arm64.dmg
```

Drag "Copilot Skins" to your Applications folder and you're ready to go!

## Development (works on macOS/Windows)

```bash
npm run dev
```

## Build

```bash
npm run build
```

## How It Works

This app uses the official [GitHub Copilot SDK](https://www.npmjs.com/package/@github/copilot-sdk) to communicate directly with GitHub Copilot. It creates a native Electron window with a React-based chat interface.

The SDK uses your existing GitHub authentication (via `gh` CLI) to authenticate requests.


## License

MIT
