import type { MCPDiscoveryResult, MCPServerConfig } from './mcpDiscovery';

export function resolveSessionMcpServers(
  discovery: Pick<MCPDiscoveryResult, 'effectiveServers'>
): Record<string, MCPServerConfig> | undefined {
  if (Object.keys(discovery.effectiveServers).length === 0) {
    return undefined;
  }

  return discovery.effectiveServers;
}
