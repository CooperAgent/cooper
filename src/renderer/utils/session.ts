let messageIdCounter = 0;
export const generateId = () => `msg-${++messageIdCounter}-${Date.now()}`;

let tabCounter = 0;
export const generateTabName = () => `Session ${++tabCounter}`;
export const setTabCounter = (value: number) => {
  tabCounter = value;
};

// Format tool output into a summary string like CLI does
export const formatToolOutput = (
  toolName: string,
  input: Record<string, unknown>,
  output: unknown
): string => {
  const out = output as Record<string, unknown> | string | undefined;
  const path = input.path as string | undefined;
  const shortPath = path ? path.split('/').slice(-2).join('/') : '';

  if (toolName === 'grep') {
    if (typeof out === 'object' && out?.output) {
      const lines = String(out.output)
        .split('\n')
        .filter((l) => l.trim()).length;
      return lines > 0 ? `${lines} lines found` : 'No matches found';
    }
    return 'No matches found';
  }

  if (toolName === 'glob') {
    if (typeof out === 'object' && out?.output) {
      const files = String(out.output)
        .split('\n')
        .filter((l) => l.trim()).length;
      return `${files} files found`;
    }
    return 'No files found';
  }

  if (toolName === 'view') {
    const range = input.view_range as number[] | undefined;
    if (range && range.length >= 2) {
      const lineCount = range[1] === -1 ? 'rest of file' : `${range[1] - range[0] + 1} lines`;
      return shortPath ? `${shortPath} (${lineCount})` : `${lineCount} read`;
    }
    return shortPath ? `${shortPath} read` : 'File read';
  }

  if (toolName === 'edit') {
    return shortPath ? `${shortPath} edited` : 'File edited';
  }

  if (toolName === 'create') {
    return shortPath ? `${shortPath} created` : 'File created';
  }

  if (toolName === 'bash') {
    if (typeof out === 'object' && out?.output) {
      const lines = String(out.output)
        .split('\n')
        .filter((l) => l.trim()).length;
      return `${lines} lines...`;
    }
    return 'Completed';
  }

  if (toolName === 'web_fetch') {
    return 'Page fetched';
  }

  if (toolName === 'read_bash') {
    return 'Output read';
  }

  if (toolName === 'write_bash') {
    return 'Input sent';
  }

  // MCP tools: try to extract a meaningful summary from output
  if (toolName.startsWith('mcp_')) {
    if (Array.isArray(out)) {
      const textBlocks = out.filter(
        (block: unknown) =>
          block != null &&
          typeof block === 'object' &&
          (block as Record<string, unknown>).type === 'text'
      );
      const imageBlocks = out.filter(
        (block: unknown) =>
          block != null &&
          typeof block === 'object' &&
          (block as Record<string, unknown>).type === 'image'
      );

      const parts: string[] = [];
      if (textBlocks.length > 0) {
        const firstText = String((textBlocks[0] as Record<string, unknown>).text || '').slice(
          0,
          60
        );
        parts.push(firstText + (firstText.length >= 60 ? '...' : ''));
      }
      if (imageBlocks.length > 0) {
        parts.push(`${imageBlocks.length} image${imageBlocks.length !== 1 ? 's' : ''}`);
      }
      if (parts.length > 0) return parts.join(' + ');
    }

    if (typeof out === 'object' && out?.output) {
      const text = String(out.output).slice(0, 80);
      return text + (text.length >= 80 ? '...' : '');
    }

    if (typeof out === 'string') {
      const text = out.slice(0, 80);
      return text + (text.length >= 80 ? '...' : '');
    }
  }

  return 'Done';
};
