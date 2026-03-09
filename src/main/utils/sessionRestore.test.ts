import { describe, expect, it } from 'vitest';
import {
  mergeSessionActiveAgents,
  mergeSessionCwds,
  resolveSessionActiveAgent,
  resolveSessionName,
} from './sessionRestore';

describe('resolveSessionName', () => {
  it('prefers stored open-session name', () => {
    expect(
      resolveSessionName({
        storedName: 'Feature Branch',
        persistedName: 'Old Name',
        summary: 'Please implement the following...',
      })
    ).toBe('Feature Branch');
  });

  it('falls back to persisted name before summary', () => {
    expect(
      resolveSessionName({
        persistedName: 'Renamed Session',
        summary: 'Please implement the following...',
      })
    ).toBe('Renamed Session');
  });

  it("treats 'Unknown' placeholders as missing", () => {
    expect(
      resolveSessionName({
        storedName: 'Unknown',
        persistedName: 'unknown',
        summary: 'Unknown',
      })
    ).toBeUndefined();
  });
});

describe('mergeSessionCwds', () => {
  it('backfills cwd entries from open sessions', () => {
    expect(
      mergeSessionCwds({ a: '/repo/a' }, [
        { sessionId: 'a', cwd: '/repo/new-a' },
        { sessionId: 'b', cwd: '/repo/b' },
      ])
    ).toEqual({ a: '/repo/new-a', b: '/repo/b' });
  });
});

describe('mergeSessionActiveAgents', () => {
  it('stores canonical agent names and clears deselections', () => {
    expect(
      mergeSessionActiveAgents({ a: 'old-agent', c: 'keep-agent' }, [
        { sessionId: 'a', activeAgentName: 'new-agent' },
        { sessionId: 'b', activeAgentName: 'fresh-agent' },
        { sessionId: 'c', activeAgentName: null },
      ])
    ).toEqual({ a: 'new-agent', b: 'fresh-agent' });
  });
});

describe('resolveSessionActiveAgent', () => {
  it('prefers the active agent stored on the open session', () => {
    expect(
      resolveSessionActiveAgent({
        storedActiveAgentName: 'renderer-agent',
        persistedActiveAgentName: 'persisted-agent',
      })
    ).toBe('renderer-agent');
  });

  it('falls back to persisted history metadata when open session metadata is missing', () => {
    expect(
      resolveSessionActiveAgent({
        storedActiveAgentName: '   ',
        persistedActiveAgentName: 'persisted-agent',
      })
    ).toBe('persisted-agent');
  });
});
