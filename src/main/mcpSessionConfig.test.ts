// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { resolveSessionMcpServers } from './mcpSessionConfig';

describe('resolveSessionMcpServers', () => {
  it('returns undefined when discovery has no servers', () => {
    expect(resolveSessionMcpServers({ effectiveServers: {} })).toBeUndefined();
  });

  it('returns discovered servers when available', () => {
    const effectiveServers = {
      workiq: {
        command: 'agency',
        args: ['mcp', 'workiq'],
        type: 'stdio' as const,
        tools: ['*'],
      },
    };

    expect(resolveSessionMcpServers({ effectiveServers })).toEqual(effectiveServers);
  });
});
