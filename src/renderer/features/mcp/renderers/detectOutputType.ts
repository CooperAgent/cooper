import type { MCPContentBlock, MCPImageContent, DetectedOutput } from './types';

/**
 * Extract text from MCP tool output, handling various formats:
 * - Plain string
 * - Object with `output` string field
 * - Array of MCP content blocks
 */
function extractText(output: unknown): string {
  if (typeof output === 'string') return output;

  if (Array.isArray(output)) {
    return output
      .filter(
        (block): block is { type: 'text'; text: string } =>
          block != null &&
          typeof block === 'object' &&
          block.type === 'text' &&
          typeof block.text === 'string'
      )
      .map((block) => block.text)
      .join('\n');
  }

  if (output != null && typeof output === 'object') {
    const obj = output as Record<string, unknown>;
    if (typeof obj.output === 'string') return obj.output;
    if (typeof obj.text === 'string') return obj.text;
  }

  return '';
}

/**
 * Extract image content blocks from MCP tool output.
 */
function extractImages(output: unknown): MCPImageContent[] {
  if (!Array.isArray(output)) return [];

  return output.filter(
    (block): block is MCPImageContent =>
      block != null &&
      typeof block === 'object' &&
      block.type === 'image' &&
      typeof block.data === 'string' &&
      typeof block.mimeType === 'string'
  );
}

/**
 * Try to parse a string as JSON. Returns the parsed value or undefined.
 */
function tryParseJSON(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) return undefined;

  // Must start with { or [ to be JSON
  if (trimmed[0] !== '{' && trimmed[0] !== '[') return undefined;

  try {
    return JSON.parse(trimmed);
  } catch {
    return undefined;
  }
}

/**
 * Check if a parsed JSON value looks like tabular data:
 * an array of objects where each object has the same (or mostly same) keys.
 */
function isTabularData(data: unknown): data is Record<string, unknown>[] {
  if (!Array.isArray(data)) return false;
  if (data.length < 1) return false;
  if (data.length > 500) return false; // Too large to render as a table

  // Every item must be a non-null object (not an array)
  const allObjects = data.every(
    (item) => item != null && typeof item === 'object' && !Array.isArray(item)
  );
  if (!allObjects) return false;

  // Check that all objects share at least some keys
  const firstKeys = Object.keys(data[0] as Record<string, unknown>)
    .sort()
    .join(',');
  const matchCount = data.filter((item) => {
    const keys = Object.keys(item as Record<string, unknown>)
      .sort()
      .join(',');
    return keys === firstKeys;
  }).length;

  // At least 80% of rows should have the same keys
  return matchCount / data.length >= 0.8;
}

/**
 * Detect the rich output type from MCP tool output.
 * Returns a DetectedOutput describing what kind of rendering to use.
 */
export function detectOutputType(output: unknown): DetectedOutput {
  // Check for images first
  const images = extractImages(output);
  if (images.length > 0) {
    const text = extractText(output);
    return { type: 'image', images, text: text || undefined };
  }

  const text = extractText(output);
  if (!text) {
    return { type: 'text', text: '' };
  }

  // Check for base64 image data URLs embedded in text
  if (text.includes('data:image/') && text.includes(';base64,')) {
    return { type: 'text', text };
  }

  // Try parsing as JSON
  const parsed = tryParseJSON(text);
  if (parsed !== undefined) {
    if (isTabularData(parsed)) {
      return { type: 'table', text, data: parsed };
    }
    return { type: 'json', text, data: parsed };
  }

  return { type: 'text', text };
}

/**
 * Check if tool output contains MCP rich content worth rendering
 * with special renderers (not just a text summary).
 */
export function isMCPRichOutput(toolName: string, output: unknown): boolean {
  // Only apply rich rendering to MCP tools (prefixed with mcp_)
  if (!toolName.startsWith('mcp_')) return false;

  const detected = detectOutputType(output);
  return detected.type !== 'text';
}
