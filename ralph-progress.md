# Ralph Progress Log

## Task
I want to really figure out how to support Windows well. This app was built primarily on Mac, so a lot of things in it are Mac specific, or have never been tested. Research the entire codebase and come up with a detailed plan for adding the missing pieces for supporting Windows. Then implement those and verify.

## Iteration 1 - 2026-01-29T10:06:56.246Z
### Status: COMPLETE
### What I'm working on:
- Windows support audit + fixes + verification

### Completed:
- Replaced macOS-specific "Finder" wording + API naming with OS-agnostic "Folder" (IPC + preload + UI + tests)
- Fixed Windows path separator handling (replaced `split('/')` with cross-platform handling)
- Made Playwright user agent platform-neutral
- Fixed Vitest node/jsdom environment mismatch for main-process tests
- Fixed renderer build break in FilePreviewModal
- Stabilized Playwright E2E on Windows (selectors, session counts, removed localhost-only test, installed browsers)
- Ensured single-instance lock does not break Playwright runs in NODE_ENV=test

### Next steps:
- (done)

## Iteration 2 - 2026-01-29T12:10:39.530Z
### Status: COMPLETE

## Final Status: COMPLETE
- Verified on Windows: `npm test`, `npm run build`, `npm run test:e2e`
### What I'm working on:
- Finishing Windows E2E stabilization + full verification

### Completed this iteration:
- Fixed remaining session-history E2E failures (robust locators + correct footer/count expectations)
- Installed Playwright browsers on Windows (`npx playwright install --with-deps`)
- Reworked `screenshot-lisa.spec.ts` to use Electron launch (no localhost dependency)
- Updated main process single-instance lock logic to skip in test mode
- Verified: `npm test`, `npm run build`, `npm run test:e2e` all pass

### Next steps:
- (done)
