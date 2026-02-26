export const COPILOT_IPC_CHANNELS = {
  send: 'copilot:send',
  sendAndWait: 'copilot:sendAndWait',
  getMessages: 'copilot:getMessages',
  createSession: 'copilot:createSession',
  closeSession: 'copilot:closeSession',
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
