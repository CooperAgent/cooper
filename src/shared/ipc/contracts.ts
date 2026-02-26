export const COPILOT_IPC_CHANNELS = {
  send: 'copilot:send',
  sendAndWait: 'copilot:sendAndWait',
  getMessages: 'copilot:getMessages',
  createSession: 'copilot:createSession',
  closeSession: 'copilot:closeSession',
  setModel: 'copilot:setModel',
  switchSession: 'copilot:switchSession',
  resumePreviousSession: 'copilot:resumePreviousSession',
} as const;

export interface CopilotFileAttachment {
  type: 'file';
  path: string;
  displayName?: string;
}

export type CopilotSendMode = 'enqueue' | 'immediate';

export interface CopilotSendArgs {
  sessionId: string;
  prompt: string;
  attachments?: CopilotFileAttachment[];
  mode?: CopilotSendMode;
}

export type CopilotSendResult = string;

export interface CopilotSendAndWaitArgs {
  sessionId: string;
  prompt: string;
  attachments?: CopilotFileAttachment[];
}

export type CopilotSendAndWaitResult = string;

export type CopilotGetMessagesArgs = string;

export interface CopilotMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type CopilotGetMessagesResult = CopilotMessage[];

export interface CopilotCreateSessionArgs {
  cwd?: string;
}

export interface CopilotCreateSessionResult {
  sessionId: string;
  model: string;
  cwd: string;
}

export type CopilotCloseSessionArgs = string;

export interface CopilotCloseSessionResult {
  success: boolean;
  remainingSessions: number;
}

export interface CopilotSetModelArgs {
  sessionId: string;
  model: string;
  hasMessages: boolean;
}

export interface CopilotSetModelResult {
  sessionId?: string;
  model: string;
  cwd?: string;
  newSession?: boolean;
}

export type CopilotSwitchSessionArgs = string;

export interface CopilotSwitchSessionResult {
  sessionId: string;
  model: string;
}

export type CopilotResumePreviousSessionArgs = [sessionId: string, cwd?: string];

export interface CopilotResumePreviousSessionResult {
  sessionId: string;
  model: string;
  cwd: string;
  alreadyOpen: boolean;
  editedFiles?: string[];
  alwaysAllowed?: string[];
}
