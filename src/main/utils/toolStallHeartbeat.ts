export function isToolStallHeartbeatEventType(eventType: string): boolean {
  return eventType === 'tool.execution_progress' || eventType === 'tool.execution_partial_result';
}
