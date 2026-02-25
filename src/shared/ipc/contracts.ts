export const COPILOT_IPC_CHANNELS = {
  closeSession: 'copilot:closeSession',
} as const;

export type CopilotCloseSessionArgs = string;

export interface CopilotCloseSessionResult {
  success: boolean;
  remainingSessions: number;
}
