import { describe, expect, it } from 'vitest';
import { buildFallbackSessionAgents, getActivePrimaryAgentLabel } from './primaryAgent';
import type { AgentSection } from './agentPicker';

const groupedAgents: AgentSection[] = [
  {
    id: 'favorites',
    label: 'Favorites',
    agents: [
      { name: 'Fast Agent', path: '/agents/fast.agent.md', type: 'project', source: 'copilot' },
      { name: 'AGENTS', path: '/repo/AGENTS.md', type: 'project', source: 'codex' },
    ],
  },
  {
    id: 'system',
    label: 'System',
    agents: [
      {
        name: 'Cooper (default)',
        path: 'system:cooper-default',
        type: 'system',
        source: 'copilot',
      },
    ],
  },
];

describe('buildFallbackSessionAgents', () => {
  it('builds fallback options excluding default system agent path', () => {
    const result = buildFallbackSessionAgents(groupedAgents, 'system:cooper-default');
    expect(result).toEqual([
      { name: 'Fast Agent', displayName: 'Fast Agent', description: undefined },
    ]);
  });
});

describe('getActivePrimaryAgentLabel', () => {
  it('returns selected agent display label when active agent exists', () => {
    const label = getActivePrimaryAgentLabel(
      [{ name: 'sdk-specialist', displayName: 'SDK Specialist' }],
      'sdk-specialist',
      'Cooper (default)'
    );
    expect(label).toBe('SDK Specialist');
  });

  it('falls back to default label when no active agent is selected', () => {
    const label = getActivePrimaryAgentLabel(
      [{ name: 'sdk-specialist', displayName: 'SDK Specialist' }],
      null,
      'Cooper (default)'
    );
    expect(label).toBe('Cooper (default)');
  });
});
