export const resolveSessionName = ({
  storedName,
  persistedName,
  summary,
}: {
  storedName?: string;
  persistedName?: string;
  summary?: string;
}): string | undefined => {
  const isUsableName = (value?: string): value is string => {
    if (!value) return false;
    const normalized = value.trim();
    return normalized.length > 0 && normalized.toLowerCase() !== 'unknown';
  };

  if (isUsableName(storedName)) return storedName;
  if (isUsableName(persistedName)) return persistedName;
  if (isUsableName(summary)) return summary;
  return undefined;
};

export const mergeSessionCwds = <T extends { sessionId: string; cwd?: string }>(
  existing: Record<string, string>,
  openSessions: T[]
): Record<string, string> => {
  const merged = { ...existing };
  for (const session of openSessions) {
    if (session.cwd) {
      merged[session.sessionId] = session.cwd;
    }
  }
  return merged;
};
