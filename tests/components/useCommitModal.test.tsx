import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useCommitModal } from '../../src/renderer/features/git/useCommitModal';
import { TabState } from '../../src/renderer/types';

describe('useCommitModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    window.electronAPI.git.listBranches = vi
      .fn()
      .mockResolvedValue({ success: true, branches: ['main', 'release/1.2'] });
    window.electronAPI.git.getChangedFiles = vi
      .fn()
      .mockResolvedValue({ success: true, files: [] });
    window.electronAPI.git.checkMainAhead = vi
      .fn()
      .mockResolvedValue({ success: true, isAhead: false, commits: [] });
    window.electronAPI.settings.getTargetBranch = vi
      .fn()
      .mockResolvedValue({ success: true, targetBranch: null });
    window.electronAPI.worktree.listSessions = vi.fn().mockResolvedValue({
      sessions: [
        {
          id: 'repo--feature-branch',
          repoPath: '/repo',
          branch: 'feature-branch',
          baseBranch: 'release/1.2',
          worktreePath: '/repo/.copilot-sessions/repo--feature-branch',
          createdAt: new Date().toISOString(),
          lastAccessedAt: new Date().toISOString(),
          status: 'active',
        },
      ],
    });
  });

  it('defaults target branch to remembered worktree base branch when no saved setting exists', async () => {
    const { result } = renderHook(() => useCommitModal());
    const updateTab = vi.fn();
    const activeTab: TabState = {
      id: 'tab-1',
      name: 'Worktree Tab',
      messages: [],
      model: 'gpt-5',
      cwd: '/repo/.copilot-sessions/repo--feature-branch',
      isProcessing: false,
      activeTools: [],
      activeSubagents: [],
      hasUnreadCompletion: false,
      pendingConfirmations: [],
      needsTitle: false,
      alwaysAllowed: [],
      editedFiles: [],
      untrackedFiles: [],
      fileViewMode: 'flat',
      currentIntent: null,
      currentIntentTimestamp: null,
      gitBranchRefresh: 0,
    };

    await act(async () => {
      await result.current.handleOpenCommitModal(activeTab, updateTab);
    });

    await waitFor(() => {
      expect(result.current.targetBranch).toBe('release/1.2');
    });
  });

  it('prefers saved target branch over remembered worktree base branch', async () => {
    window.electronAPI.settings.getTargetBranch = vi
      .fn()
      .mockResolvedValue({ success: true, targetBranch: 'hotfix/urgent' });
    const { result } = renderHook(() => useCommitModal());
    const updateTab = vi.fn();
    const activeTab: TabState = {
      id: 'tab-1',
      name: 'Worktree Tab',
      messages: [],
      model: 'gpt-5',
      cwd: '/repo/.copilot-sessions/repo--feature-branch',
      isProcessing: false,
      activeTools: [],
      activeSubagents: [],
      hasUnreadCompletion: false,
      pendingConfirmations: [],
      needsTitle: false,
      alwaysAllowed: [],
      editedFiles: [],
      untrackedFiles: [],
      fileViewMode: 'flat',
      currentIntent: null,
      currentIntentTimestamp: null,
      gitBranchRefresh: 0,
    };

    await act(async () => {
      await result.current.handleOpenCommitModal(activeTab, updateTab);
    });

    await waitFor(() => {
      expect(result.current.targetBranch).toBe('hotfix/urgent');
    });
  });
});
