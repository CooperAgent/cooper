import React, { useState } from 'react';
import type { MCPImageContent } from './types';

interface ImageRendererProps {
  images: MCPImageContent[];
  caption?: string;
}

/**
 * Renders MCP image content blocks inline.
 * Supports base64-encoded images with various MIME types.
 */
export const ImageRenderer: React.FC<ImageRendererProps> = ({ images, caption }) => {
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  const handleError = (index: number) => {
    setFailedImages((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  if (images.length === 0) return null;

  return (
    <div className="mt-1 space-y-2">
      {images.map((img, index) => {
        if (failedImages.has(index)) {
          return (
            <div
              key={index}
              className="text-[10px] text-copilot-text-muted italic px-2 py-1 bg-copilot-bg rounded"
            >
              Failed to load image ({img.mimeType})
            </div>
          );
        }

        const src = `data:${img.mimeType};base64,${img.data}`;

        return (
          <img
            key={index}
            src={src}
            alt={caption || `MCP output image ${index + 1}`}
            className="max-w-full max-h-64 rounded border border-copilot-border object-contain"
            onError={() => handleError(index)}
          />
        );
      })}
      {caption && <div className="text-[10px] text-copilot-text-muted">{caption}</div>}
    </div>
  );
};
