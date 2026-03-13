import { CopilotSession } from '@github/copilot-sdk';
import { CopilotSetModelResult } from '../../shared/ipc/contracts';

export interface InPlaceModelSwitchSessionState {
  session: CopilotSession;
  model: string;
  cwd: string;
}

interface InPlaceModelSwitchLogger {
  info: (...args: unknown[]) => void;
}

export async function switchSessionModelInPlace(
  sessionId: string,
  targetModel: string,
  validModels: string[],
  sessionState: InPlaceModelSwitchSessionState,
  logger: InPlaceModelSwitchLogger
): Promise<CopilotSetModelResult> {
  if (!validModels.includes(targetModel)) {
    throw new Error(`Invalid model: ${targetModel}`);
  }

  const previousModel = sessionState.model;
  logger.info(`[${sessionId}] Model switch requested: ${previousModel} → ${targetModel}`);

  await sessionState.session.setModel(targetModel);
  sessionState.model = targetModel;

  logger.info(`[${sessionId}] Model switch complete: ${previousModel} → ${targetModel}`);
  return { sessionId, model: targetModel, cwd: sessionState.cwd };
}
