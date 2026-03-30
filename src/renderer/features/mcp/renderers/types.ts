/**
 * Types for MCP rich output rendering.
 *
 * MCP tool results follow the MCP protocol content block format:
 * - { type: "text", text: "..." }
 * - { type: "image", data: "base64...", mimeType: "image/png" }
 *
 * The output can also be a plain string, an object with an `output` field,
 * or an array of content blocks.
 */

export interface MCPTextContent {
  type: 'text';
  text: string;
}

export interface MCPImageContent {
  type: 'image';
  data: string;
  mimeType: string;
}

export type MCPContentBlock = MCPTextContent | MCPImageContent;

export type MCPOutputType = 'image' | 'table' | 'json' | 'text';

export interface DetectedOutput {
  type: MCPOutputType;
  /** Raw text content (for text/json/table types) */
  text?: string;
  /** Parsed JSON data (for json/table types) */
  data?: unknown;
  /** Image content blocks */
  images?: MCPImageContent[];
}
