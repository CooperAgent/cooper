import { ipcMain } from 'electron';
import type { CopilotSession } from '@github/copilot-sdk';

import { MCPConfigFile, MCPServerConfig } from './mcpConfig';
import { getMcpDiscoveryMetadata, discoverMcpServers } from './mcpDiscovery';

type McpSessionServerStatus =
  | 'connected'
  | 'failed'
  | 'needs-auth'
  | 'pending'
  | 'disabled'
  | 'not_configured';

type SessionStateForMcp = {
  cwd: string;
  session: Pick<CopilotSession, 'rpc'>;
};

interface RegisterMcpHandlersOptions {
  getActiveSessionId: () => string | null;
  sessions: Map<string, SessionStateForMcp>;
  getProjectRootForCwd: (cwd: string) => Promise<string | undefined>;
  readMcpConfig: () => Promise<MCPConfigFile>;
  writeMcpConfig: (config: MCPConfigFile) => Promise<void>;
  getMcpConfigPath: () => string;
}

export function registerMcpHandlers(options: RegisterMcpHandlersOptions): void {
  ipcMain.handle('mcp:getConfig', async () => {
    let projectRoot: string | undefined;
    const currentSessionId = options.getActiveSessionId();
    if (currentSessionId) {
      const sessionState = options.sessions.get(currentSessionId);
      if (sessionState) {
        projectRoot = await options.getProjectRootForCwd(sessionState.cwd);
      }
    }

    const discovery = await discoverMcpServers({ projectRoot });
    return { mcpServers: discovery.effectiveServers };
  });

  ipcMain.handle('mcp:saveConfig', async (_event, config: MCPConfigFile) => {
    await options.writeMcpConfig(config);
    return { success: true };
  });

  ipcMain.handle(
    'mcp:addServer',
    async (_event, data: { name: string; server: MCPServerConfig }) => {
      const config = await options.readMcpConfig();
      config.mcpServers[data.name] = data.server;
      await options.writeMcpConfig(config);
      return { success: true };
    }
  );

  ipcMain.handle(
    'mcp:updateServer',
    async (_event, data: { name: string; server: MCPServerConfig }) => {
      const config = await options.readMcpConfig();
      if (config.mcpServers[data.name]) {
        config.mcpServers[data.name] = data.server;
        await options.writeMcpConfig(config);
        return { success: true };
      }
      return { success: false, error: 'Server not found' };
    }
  );

  ipcMain.handle('mcp:deleteServer', async (_event, name: string) => {
    const config = await options.readMcpConfig();
    if (config.mcpServers[name]) {
      delete config.mcpServers[name];
      await options.writeMcpConfig(config);
      return { success: true };
    }
    return { success: false, error: 'Server not found' };
  });

  ipcMain.handle('mcp:getConfigPath', async () => {
    return { path: options.getMcpConfigPath() };
  });

  ipcMain.handle('mcp:getSessionStatus', async (_event, sessionId?: string) => {
    const targetSessionId = sessionId || options.getActiveSessionId();
    if (!targetSessionId) {
      return { success: false, error: 'No active session' };
    }

    const sessionState = options.sessions.get(targetSessionId);
    if (!sessionState) {
      return { success: false, error: 'Session not found' };
    }

    try {
      const result = await sessionState.session.rpc.mcp.list();
      return {
        success: true,
        sessionId: targetSessionId,
        servers: result.servers as Array<{
          name: string;
          status: McpSessionServerStatus;
          source?: string;
          error?: string;
        }>,
      };
    } catch (error) {
      return {
        success: false,
        sessionId: targetSessionId,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });

  ipcMain.handle(
    'mcp:getDiscoveryMetadata',
    async (
      _event,
      mcpOptions?: {
        sessionConfig?: Record<string, MCPServerConfig>;
        projectRoot?: string;
      }
    ) => {
      try {
        const result = await getMcpDiscoveryMetadata(mcpOptions || {});
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
  );
}
