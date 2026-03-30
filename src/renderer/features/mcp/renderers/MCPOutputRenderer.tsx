import React from 'react';
import { detectOutputType, isMCPRichOutput } from './detectOutputType';
import { ImageRenderer } from './ImageRenderer';
import { TableRenderer } from './TableRenderer';
import { DataRenderer } from './DataRenderer';

interface MCPOutputRendererProps {
  toolName: string;
  output: unknown;
}

/**
 * Main orchestrator for rich MCP tool output rendering.
 * Detects the output type and routes to the appropriate renderer.
 *
 * Falls back to null (caller should render the default text summary)
 * when the output is plain text or the tool is not an MCP tool.
 */
export const MCPOutputRenderer: React.FC<MCPOutputRendererProps> = ({ toolName, output }) => {
  if (!isMCPRichOutput(toolName, output)) {
    return null;
  }

  const detected = detectOutputType(output);

  try {
    switch (detected.type) {
      case 'image':
        return <ImageRenderer images={detected.images || []} caption={detected.text} />;

      case 'table':
        return <TableRenderer data={detected.data as Record<string, unknown>[]} />;

      case 'json':
        return <DataRenderer data={detected.data} />;

      case 'text':
      default:
        return null;
    }
  } catch {
    // Graceful fallback: if rich rendering fails, return null
    // so the caller renders the default text summary
    return null;
  }
};

export { isMCPRichOutput };
