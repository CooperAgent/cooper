import { describe, expect, it } from 'vitest';
import { isToolStallHeartbeatEventType } from './toolStallHeartbeat';

describe('isToolStallHeartbeatEventType', () => {
  it('treats periodic tool activity events as heartbeats', () => {
    expect(isToolStallHeartbeatEventType('tool.execution_progress')).toBe(true);
    expect(isToolStallHeartbeatEventType('tool.execution_partial_result')).toBe(true);
  });

  it('does not treat start/complete events as heartbeats', () => {
    expect(isToolStallHeartbeatEventType('tool.execution_start')).toBe(false);
    expect(isToolStallHeartbeatEventType('tool.execution_complete')).toBe(false);
    expect(isToolStallHeartbeatEventType('session.idle')).toBe(false);
  });
});
