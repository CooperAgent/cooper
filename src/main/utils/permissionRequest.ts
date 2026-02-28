import { PermissionRequest } from '@github/copilot-sdk';

let permissionRequestCounter = 0;

export function createPermissionRequestId(request: PermissionRequest, sessionId: string): string {
  const base = request.toolCallId || `perm-${sessionId}`;
  permissionRequestCounter = (permissionRequestCounter + 1) % Number.MAX_SAFE_INTEGER;
  return `${base}:${Date.now()}:${permissionRequestCounter}`;
}

export function resetPermissionRequestIdCounterForTests(): void {
  permissionRequestCounter = 0;
}
