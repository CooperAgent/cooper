import { describe, expect, it, vi } from 'vitest';
import type { CopilotSession } from '@github/copilot-sdk';
import { switchSessionModelInPlace } from './modelSwitch';

describe('switchSessionModelInPlace', () => {
  it('switches model in place and preserves session id/cwd', async () => {
    const setModel = vi.fn(async () => undefined);
    const state = {
      session: { setModel } as unknown as CopilotSession,
      model: 'gpt-5.1',
      cwd: '/repo',
    };
    const logger = { info: vi.fn() };

    const result = await switchSessionModelInPlace(
      'session-1',
      'gpt-5.3-codex',
      ['gpt-5.1', 'gpt-5.3-codex'],
      state,
      logger
    );

    expect(setModel).toHaveBeenCalledWith('gpt-5.3-codex');
    expect(state.model).toBe('gpt-5.3-codex');
    expect(result).toEqual({ sessionId: 'session-1', model: 'gpt-5.3-codex', cwd: '/repo' });
  });

  it('throws when target model is invalid', async () => {
    const setModel = vi.fn(async () => undefined);
    const state = {
      session: { setModel } as unknown as CopilotSession,
      model: 'gpt-5.1',
      cwd: '/repo',
    };

    await expect(
      switchSessionModelInPlace(
        'session-1',
        'invalid-model',
        ['gpt-5.1', 'gpt-5.3-codex'],
        state,
        { info: vi.fn() }
      )
    ).rejects.toThrow('Invalid model: invalid-model');

    expect(setModel).not.toHaveBeenCalled();
    expect(state.model).toBe('gpt-5.1');
  });
});
