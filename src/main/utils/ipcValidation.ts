import {
  CopilotCreateSessionArgs,
  CopilotResumePreviousSessionArgs,
  CopilotSendAndWaitArgs,
  CopilotSendArgs,
  CopilotSetModelArgs,
  CopilotSwitchSessionArgs,
} from '../../shared/ipc/contracts';

function validationError(field: string, message: string): Error {
  return new Error(`Invalid request: ${field} ${message}`);
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw validationError(field, 'must be a string');
  }
  return value;
}

function requireNonEmptyString(value: unknown, field: string): string {
  const normalized = requireString(value, field).trim();
  if (!normalized) {
    throw validationError(field, 'must be a non-empty string');
  }
  return normalized;
}

export function validateCopilotSendArgs(args: CopilotSendArgs): void {
  requireNonEmptyString(args.sessionId, 'sessionId');
  requireString(args.prompt, 'prompt');

  if (typeof args.mode !== 'undefined' && args.mode !== 'enqueue' && args.mode !== 'immediate') {
    throw validationError('mode', 'must be "enqueue" or "immediate"');
  }

  if (typeof args.attachments === 'undefined') {
    return;
  }
  if (!Array.isArray(args.attachments)) {
    throw validationError('attachments', 'must be an array');
  }
  for (const attachment of args.attachments) {
    if (!attachment || typeof attachment !== 'object') {
      throw validationError('attachments', 'contains invalid item');
    }
    if (!Object.prototype.hasOwnProperty.call(attachment, 'type') || attachment.type !== 'file') {
      throw validationError('attachments.type', 'must be "file"');
    }
    if (!Object.prototype.hasOwnProperty.call(attachment, 'path')) {
      throw validationError('attachments.path', 'must be provided');
    }
    requireNonEmptyString(attachment.path, 'attachments.path');
    if (typeof attachment.displayName !== 'undefined') {
      if (!Object.prototype.hasOwnProperty.call(attachment, 'displayName')) {
        throw validationError('attachments.displayName', 'must be a direct property');
      }
      requireString(attachment.displayName, 'attachments.displayName');
    }
  }
}

export function validateCopilotSendAndWaitArgs(args: CopilotSendAndWaitArgs): void {
  validateCopilotSendArgs({ ...args, mode: undefined });
}

export function validateCopilotCreateSessionArgs(args?: CopilotCreateSessionArgs): void {
  if (typeof args?.cwd !== 'undefined') {
    requireNonEmptyString(args.cwd, 'cwd');
  }
}

export function validateCopilotSetModelArgs(args: CopilotSetModelArgs): void {
  requireNonEmptyString(args.sessionId, 'sessionId');
  requireNonEmptyString(args.model, 'model');
  if (typeof args.hasMessages !== 'boolean') {
    throw validationError('hasMessages', 'must be a boolean');
  }
}

export function validateCopilotSwitchSessionArgs(sessionId: CopilotSwitchSessionArgs): void {
  requireNonEmptyString(sessionId, 'sessionId');
}

export function validateCopilotResumePreviousSessionArgs(
  sessionId: CopilotResumePreviousSessionArgs[0],
  cwd?: CopilotResumePreviousSessionArgs[1]
): void {
  requireNonEmptyString(sessionId, 'sessionId');
  if (typeof cwd !== 'undefined') {
    requireNonEmptyString(cwd, 'cwd');
  }
}
