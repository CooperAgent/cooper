import { ipcMain } from 'electron';

import { type AgentsResult } from './agents';
import { type InstructionsResult } from './instructions';
import { type SkillsResult } from './skills';

interface SessionContextResult {
  skills: SkillsResult;
  agents: AgentsResult;
  instructions: InstructionsResult;
}

interface RegisterSessionContextHandlersOptions {
  loadSessionContext: (cwd?: string) => Promise<SessionContextResult>;
}

export function registerSessionContextHandlers(
  options: RegisterSessionContextHandlersOptions
): void {
  ipcMain.handle('skills:getAll', async (_event, cwd?: string) => {
    const result = await options.loadSessionContext(cwd);
    console.log(
      `Found ${result.skills.skills.length} skills (${result.skills.errors.length} errors)`
    );
    return result.skills;
  });

  ipcMain.handle('agents:getAll', async (_event, cwd?: string) => {
    const result = await options.loadSessionContext(cwd);
    return result.agents;
  });

  ipcMain.handle('instructions:getAll', async (_event, cwd?: string) => {
    const result = await options.loadSessionContext(cwd);
    console.log(
      `Found ${result.instructions.instructions.length} instructions (${result.instructions.errors.length} errors)`
    );
    return result.instructions;
  });

  ipcMain.handle('sessionContext:getAll', async (_event, cwd?: string) => {
    return options.loadSessionContext(cwd);
  });
}
