import type { AgentSection } from './agentPicker';

export interface SessionAgentOption {
  name: string;
  displayName: string;
  description?: string;
}

export function buildFallbackSessionAgents(
  groupedAgents: AgentSection[],
  defaultAgentPath: string
): SessionAgentOption[] {
  return groupedAgents
    .flatMap((section) => section.agents)
    .filter((agent) => agent.path !== defaultAgentPath && agent.source !== 'codex')
    .map((agent) => ({
      name: agent.name,
      displayName: agent.name,
      description: agent.description,
    }));
}

export function getActivePrimaryAgentLabel(
  agents: SessionAgentOption[],
  activeAgentName: string | null,
  defaultLabel: string
): string {
  return agents.find((agent) => agent.name === activeAgentName)?.displayName || defaultLabel;
}
