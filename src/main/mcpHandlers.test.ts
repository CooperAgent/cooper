// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  handle: vi.fn(),
}));

vi.mock('electron', () => ({
  ipcMain: {
    handle: mocks.handle,
  },
}));

import { registerMcpHandlers } from './mcpHandlers';

type IpcHandler = (...args: unknown[]) => Promise<unknown>;

function getHandler(channel: string): IpcHandler {
  const handler = mocks.handle.mock.calls.find(([name]) => name === channel)?.[1];
  if (!handler) throw new Error(`Handler not found for ${channel}`);
  return handler as IpcHandler;
}

describe('mcp:getSessionStatus handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns MCP runtime status for a session', async () => {
    const mcpList = vi.fn().mockResolvedValue({
      servers: [
        { name: 'github', status: 'connected', source: 'user' },
        { name: 'workiq', status: 'pending' },
      ],
    });

    registerMcpHandlers({
      getActiveSessionId: () => 'session-1',
      sessions: new Map([
        [
          'session-1',
          {
            cwd: '/tmp/project',
            session: {
              rpc: {
                mcp: {
                  list: mcpList,
                },
              },
            },
          },
        ],
      ]),
      getProjectRootForCwd: async () => '/tmp/project',
      readMcpConfig: async () => ({ mcpServers: {} }),
      writeMcpConfig: async () => {},
      getMcpConfigPath: () => '/tmp/.copilot/mcp-config.json',
    });

    const handler = getHandler('mcp:getSessionStatus');
    const result = (await handler({}, 'session-1')) as {
      success: boolean;
      sessionId?: string;
      servers?: Array<{ name: string; status: string }>;
    };

    expect(result.success).toBe(true);
    expect(result.sessionId).toBe('session-1');
    expect(result.servers).toEqual([
      { name: 'github', status: 'connected', source: 'user' },
      { name: 'workiq', status: 'pending' },
    ]);
  });

  it('returns error when session does not exist', async () => {
    registerMcpHandlers({
      getActiveSessionId: () => null,
      sessions: new Map(),
      getProjectRootForCwd: async () => undefined,
      readMcpConfig: async () => ({ mcpServers: {} }),
      writeMcpConfig: async () => {},
      getMcpConfigPath: () => '/tmp/.copilot/mcp-config.json',
    });

    const handler = getHandler('mcp:getSessionStatus');
    const result = (await handler({}, 'missing')) as { success: boolean; error?: string };

    expect(result.success).toBe(false);
    expect(result.error).toBe('Session not found');
  });
});
