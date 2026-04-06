# Cooper

<p align="center">
  <img src="src/renderer/assets/logo.png" alt="Cooper Logo" width="128" height="128">
</p>

A native desktop GUI for GitHub Copilot, built on the [Copilot SDK](https://github.blog/changelog/2026-01-14-copilot-sdk-in-technical-preview/).

![Cooper Demo](https://github.com/user-attachments/assets/72c9d556-4a47-44c0-951e-568df9a9468e)

## Prerequisites

- **Node.js 22+**
- A **[GitHub Copilot](https://github.com/features/copilot)** subscription
- **[GitHub CLI](https://cli.github.com/)** installed and authenticated — run `gh auth login` if you haven't already

## Installation

Clone the repo, then:

```bash
npm run dist
```

This installs dependencies, runs tests, builds the app, and packages it. The output goes to the `release/` directory:

| Platform    | Output                                        |
| ----------- | --------------------------------------------- |
| **macOS**   | `release/Cooper-<version>-mac-arm64.dmg`      |
| **Windows** | `release/Cooper-<version>-win-x64-Setup.exe`  |
| **Linux**   | `release/Cooper-<version>-linux-x64.AppImage` |

> **Windows:** Run `pwsh -NoProfile -File .\scripts\setup-windows.ps1` before `npm run dist` to set up build dependencies.
>
> **Linux:** Run `sudo ./scripts/install-linux-deps.sh` before `npm run dist` to install native dependencies.

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

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Community

Join our [Discord](https://discord.gg/HPmg6ygq6d) to report bugs, request features, and chat.

## License

MIT
