# Cooper

<p align="center">
  <img src="src/renderer/assets/logo.png" alt="Cooper Logo" width="128" height="128">
</p>

A native desktop GUI for GitHub Copilot, built on the [Copilot SDK](https://github.blog/changelog/2026-01-14-copilot-sdk-in-technical-preview/).

![Cooper Demo](https://github.com/user-attachments/assets/72c9d556-4a47-44c0-951e-568df9a9468e)

## Prerequisites

- A **[GitHub Copilot](https://github.com/features/copilot)** subscription
- **[GitHub CLI](https://cli.github.com/)** installed and authenticated — run `gh auth login` if you haven't already

## Installation

Download the latest release from the **[Releases page](https://github.com/CooperAgent/cooper/releases/latest)**:

| Platform                  | File                                  | Notes                |
| ------------------------- | ------------------------------------- | -------------------- |
| **macOS** (Apple Silicon) | `Cooper-<version>-mac-arm64.dmg`      | Signed and notarized |
| **Windows** (x64)         | `Cooper-<version>-win-x64-Setup.exe`  | Installer            |
| **Linux** (x64)           | `Cooper-<version>-linux-x64.AppImage` | Experimental         |
| **Linux** (Debian/Ubuntu) | `Cooper-<version>-linux-x64.deb`      | Experimental         |

> **Note:** Cooper is an open-source project, so release executables are not officially code-signed. Your OS may show a warning on first launch. If you prefer, you can [build from source](#build-from-source) below.

<details>
<summary><b>Build from source</b></summary>

Requires **Node.js 22+**.

**macOS:**

```bash
git clone https://github.com/CooperAgent/cooper.git && cd cooper && npm run dist
```

**Windows:**

```powershell
git clone https://github.com/CooperAgent/cooper.git; cd cooper; pwsh -NoProfile -File .\scripts\setup-windows.ps1; npm run dist
```

**Linux:**

```bash
git clone https://github.com/CooperAgent/cooper.git && cd cooper
sudo ./scripts/install-linux-deps.sh  # auto-detects distro
npm run dist
```

</details>

## Features

- 🗂️ **Tabbed Sessions** — Multiple conversations, each with its own working directory and model
- 🌳 **Git Worktree Sessions** — Paste a GitHub issue URL → isolated worktree + session
- 🔁 **[Ralph Wiggum](https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum)** — Iterative agent mode: set completion criteria, let it loop until done
- 💻 **Embedded Terminal** — Real PTY per session, one click to attach output to your prompt
- 🎤 **Voice Input/Output** — Speech-to-text and text-to-speech
- 🔌 **MCP Servers** — Model Context Protocol for extended tool capabilities
- 🎯 **Agent Skills & Subagents** — Personal and project skills via `SKILL.md`, `.agent.md`, and subagent delegation
- 🤖 **Model Selection** — Dynamic model list with favorites — GPT-5.2, Opus-4.6, Sonnet, Haiku, Gemini, and more
- ⚡ **YOLO Mode** — Auto-approve tool calls for uninterrupted agent flow

## Development

```bash
npm install && npm run dev
```

`npm install` now attempts a best-effort RTK install (skippable with `COOPER_SKIP_RTK_INSTALL=1`).

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Community

Join our [Discord](https://discord.gg/HPmg6ygq6d) to report bugs, request features, and chat.

## License

MIT
