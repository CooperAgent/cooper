import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { EnvironmentModal } from '../../src/renderer/components/EnvironmentModal';

describe('Environment modal (markdown preview)', () => {
  const agentPath = 'C:/agents/helper.agent.md';
  const skillPath = '/project/.github/skills/reviewer/SKILL.md';
  const textSkillPath = '/project/.github/skills/reviewer/notes.txt';
  const markdownContent = `---
name: Helper
description: Assist with tasks.
---

# Helper Agent

Use the helper rules.`;

  beforeEach(() => {
    // @ts-expect-error - mocking electron API
    window.electronAPI = {
      file: {
        readContent: vi.fn().mockImplementation((path: string) => {
          if (path === textSkillPath) {
            return Promise.resolve({
              success: true,
              content: 'plain skill notes',
            });
          }
          return Promise.resolve({
            success: true,
            content: markdownContent,
          });
        }),
        revealInFolder: vi.fn(),
      },
    };
  });

  it('renders agent markdown with frontmatter', async () => {
    render(
      <EnvironmentModal
        isOpen={true}
        onClose={vi.fn()}
        instructions={[]}
        skills={[]}
        agents={[{ name: 'Helper', path: agentPath, type: 'personal', source: 'copilot' }]}
        cwd="/project"
        initialTab="agents"
        initialAgentPath={agentPath}
        fileViewMode="tree"
      />
    );

    expect(screen.getByText('Environment')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Helper Agent')).toBeInTheDocument());
    expect(screen.getByText('Frontmatter')).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('Helper')).toBeInTheDocument();
  });

  it('renders skill markdown with frontmatter', async () => {
    render(
      <EnvironmentModal
        isOpen={true}
        onClose={vi.fn()}
        instructions={[]}
        skills={[
          {
            name: 'reviewer',
            description: 'review skills',
            path: '/project/.github/skills/reviewer',
            files: [skillPath],
            type: 'project',
            source: 'copilot',
            relativePath: '.github/skills/reviewer',
            locationLabel: './.github/skills',
          },
        ]}
        agents={[]}
        cwd="/project"
        initialTab="skills"
        initialSkillPath={skillPath}
        fileViewMode="tree"
      />
    );

    await waitFor(() => expect(screen.getByText('Helper Agent')).toBeInTheDocument());
    expect(screen.getByText('Frontmatter')).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('Helper')).toBeInTheDocument();
  });

  it('does not show frontmatter block for non-markdown skill files', async () => {
    render(
      <EnvironmentModal
        isOpen={true}
        onClose={vi.fn()}
        instructions={[]}
        skills={[
          {
            name: 'reviewer',
            description: 'review skills',
            path: '/project/.github/skills/reviewer',
            files: [textSkillPath],
            type: 'project',
            source: 'copilot',
            relativePath: '.github/skills/reviewer',
            locationLabel: './.github/skills',
          },
        ]}
        agents={[]}
        cwd="/project"
        initialTab="skills"
        initialSkillPath={textSkillPath}
        fileViewMode="tree"
      />
    );

    await waitFor(() => expect(screen.getByText('plain skill notes')).toBeInTheDocument());
    expect(screen.queryByText('Frontmatter')).not.toBeInTheDocument();
  });
});
