import { existsSync } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

// MCP Server Configuration types (matching SDK)
interface MCPServerConfigBase {
  tools: string[];
  type?: string;
  timeout?: number;
  builtIn?: boolean;
}

interface MCPLocalServerConfig extends MCPServerConfigBase {
  type?: 'local' | 'stdio';
  command: string;
  args: string[];
  env?: Record<string, string>;
  cwd?: string;
}

interface MCPRemoteServerConfig extends MCPServerConfigBase {
  type: 'http' | 'sse';
  url: string;
  headers?: Record<string, string>;
}

export type MCPServerConfig = MCPLocalServerConfig | MCPRemoteServerConfig;

export interface MCPConfigFile {
  mcpServers: Record<string, MCPServerConfig>;
}

export const getMcpConfigPath = (copilotConfigPath: string): string =>
  join(copilotConfigPath, 'mcp-config.json');

export async function readMcpConfig(configPath: string): Promise<MCPConfigFile> {
  try {
    if (!existsSync(configPath)) {
      return { mcpServers: {} };
    }
    const content = await readFile(configPath, 'utf-8');
    const parsed = JSON.parse(content) as MCPConfigFile;

    // Default tools to ["*"] for servers that don't specify it (matches copilot-cli behavior)
    for (const serverName in parsed.mcpServers) {
      const server = parsed.mcpServers[serverName];
      if (!server.tools) {
        server.tools = ['*'];
      }
    }

    return parsed;
  } catch (error) {
    console.error('Failed to read MCP config:', error);
    return { mcpServers: {} };
  }
}

export async function writeMcpConfig(
  configPath: string,
  copilotConfigPath: string,
  config: MCPConfigFile
): Promise<void> {
  if (!existsSync(copilotConfigPath)) {
    await mkdir(copilotConfigPath, { recursive: true });
  }

  await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
  console.log('Saved MCP config:', Object.keys(config.mcpServers));
}
