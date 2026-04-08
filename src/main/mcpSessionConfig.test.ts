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

  it('normalizes local/stdio servers for SDK session config', () => {
    const effectiveServers = {
      localServer: {
        command: 'my-mcp',
        tools: ['search'],
        builtIn: true,
      },
    };

    expect(resolveSessionMcpServers({ effectiveServers })).toEqual({
      localServer: {
        command: 'my-mcp',
        args: [],
        type: 'stdio',
        tools: ['search'],
      },
    });
  });

  it('normalizes remote servers and defaults tools to wildcard', () => {
    const effectiveServers = {
      remoteServer: {
        type: 'http' as const,
        url: 'https://example.com/mcp',
        headers: { Authorization: 'Bearer test' },
      },
    };

    expect(resolveSessionMcpServers({ effectiveServers })).toEqual({
      remoteServer: {
        type: 'http',
        url: 'https://example.com/mcp',
        headers: { Authorization: 'Bearer test' },
        tools: ['*'],
      },
    });
  });
});
