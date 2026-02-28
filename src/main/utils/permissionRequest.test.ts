import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  createPermissionRequestId,
  resetPermissionRequestIdCounterForTests,
} from './permissionRequest';

describe('createPermissionRequestId', () => {
  beforeEach(() => {
    resetPermissionRequestIdCounterForTests();
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('includes toolCallId when available and stays unique across requests', () => {
    const request = {
      kind: 'shell',
      fullCommandText: 'echo hi',
      intention: 'Echo',
      toolCallId: 'tool-1',
    };

    const first = createPermissionRequestId(request as any, 'session-1');
    const second = createPermissionRequestId(request as any, 'session-1');

    expect(first).toMatch(/^tool-1:1700000000000:\d+$/);
    expect(second).toMatch(/^tool-1:1700000000000:\d+$/);
    expect(first).not.toBe(second);
  });

  it('falls back to session-based prefix when toolCallId is missing', () => {
    const request = { kind: 'read', intention: 'Read file', path: '/tmp/a.txt' };

    const requestId = createPermissionRequestId(request as any, 'session-abc');

    expect(requestId).toMatch(/^perm-session-abc:1700000000000:\d+$/);
  });
});
