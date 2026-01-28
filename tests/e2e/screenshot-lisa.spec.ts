import { test, expect } from '@playwright/test';

test('capture Lisa Simpson option in CreateWorktreeSession', async ({ page }) => {
  // Mock the electronAPI
  await page.addInitScript(() => {
    (window as any).electronAPI = {
      copilot: {
        getSettings: async () => ({ autoApproveMode: 'ask', model: 'claude-sonnet-4' }),
        addAlwaysAllowed: async () => {},
        sessions: async () => [],
        startSession: async () => ({ sessionId: 'test-123' }),
        getAvailableModels: async () => []
      },
      worktree: {
        list: async () => [],
        listOrphaned: async () => [],
        getTrackedRepos: async () => [
          { path: '/path/to/repo', name: 'copilot-ui', url: 'https://github.com/idofrizler/copilot-ui' }
        ],
        create: async () => ({ success: true, worktreePath: '/tmp/worktree' })
      },
      git: {
        getRemoteUrl: async () => 'https://github.com/idofrizler/copilot-ui',
        getCurrentBranch: async () => 'main'
      },
      system: {
        getVersion: async () => '1.0.0',
        platform: () => 'darwin',
        openExternal: async () => {}
      },
      github: {
        getIssue: async () => ({ title: 'Test Issue', body: 'Test body' })
      }
    };
  });

  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(2000);
  
  // Take initial screenshot
  await page.screenshot({ path: 'evidence/screenshots/06-app-loaded.png', fullPage: true });
});
