import React, { useEffect, useState, useCallback } from 'react'
import { CloseIcon, ExternalLinkIcon } from '../Icons'
import { Spinner } from '../Spinner'

export interface FilePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  filePath: string
}

interface FileContent {
  success: boolean
  content?: string
  fileSize?: number
  fileName?: string
  error?: string
  errorType?: 'not_found' | 'too_large' | 'binary' | 'read_error'
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  filePath,
}) => {
  const [loading, setLoading] = useState(true)
  const [fileContent, setFileContent] = useState<FileContent | null>(null)

  const loadFileContent = useCallback(async () => {
    if (!filePath) return
    
    setLoading(true)
    try {
      const result = await window.electronAPI.file.readContent(filePath)
      setFileContent(result)
    } catch (error) {
      setFileContent({
        success: false,
        error: `Failed to load file: ${String(error)}`,
        errorType: 'read_error',
      })
    } finally {
      setLoading(false)
    }
  }, [filePath])

  useEffect(() => {
    if (isOpen && filePath) {
      loadFileContent()
    }
  }, [isOpen, filePath, loadFileContent])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleRevealInFolder = async () => {
    try {
      await window.electronAPI.file.revealInFolder(filePath)
    } catch (error) {
      console.error('Failed to reveal in folder:', error)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  const fileName = filePath.split(/[/\\]/).pop() || filePath

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      data-testid="file-preview-modal"
    >
      <div
        className="bg-copilot-surface border border-copilot-border rounded-lg shadow-xl flex flex-col overflow-hidden"
        style={{ width: '80%', maxWidth: '900px', maxHeight: '80vh' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="file-preview-title"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-copilot-border flex items-center justify-between shrink-0">
          <div className="flex-1 min-w-0 mr-4">
            <h3 id="file-preview-title" className="text-sm font-medium text-copilot-text truncate">
              {fileName}
            </h3>
            <p className="text-xs text-copilot-text-muted truncate mt-0.5" title={filePath}>
              {filePath}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRevealInFolder}
              className="flex items-center gap-1.5 px-2 py-1 text-xs text-copilot-text-muted hover:text-copilot-text hover:bg-copilot-bg rounded transition-colors"
              title="Reveal in Folder"
            >
              <ExternalLinkIcon size={14} />
              <span>Reveal in Folder</span>
            </button>
            <button
              onClick={onClose}
              className="text-copilot-text-muted hover:text-copilot-text transition-colors p-1"
              aria-label="Close modal"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 min-h-0 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Spinner size={24} />
            </div>
          ) : fileContent?.success ? (
            <pre 
              className="text-xs font-mono text-copilot-text leading-relaxed"
              style={{ 
                whiteSpace: 'pre-wrap', 
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
                maxWidth: '100%'
              }}
            >
              {fileContent.content}
            </pre>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <p className="text-copilot-text-muted text-sm mb-2">
                {fileContent?.errorType === 'not_found' && '📁 File not found'}
                {fileContent?.errorType === 'too_large' && '📦 File too large to preview'}
                {fileContent?.errorType === 'binary' && '🔒 Binary file'}
                {fileContent?.errorType === 'read_error' && '⚠️ Error reading file'}
              </p>
              <p className="text-copilot-text-muted text-xs">
                {fileContent?.error}
              </p>
              {(fileContent?.errorType === 'binary' || fileContent?.errorType === 'too_large') && (
                <button
                  onClick={handleRevealInFolder}
                  className="mt-4 flex items-center gap-1.5 px-3 py-1.5 text-xs text-copilot-accent hover:bg-copilot-bg rounded transition-colors border border-copilot-border"
                >
                  <ExternalLinkIcon size={12} />
                  <span>Open in Folder</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer with file size */}
        {fileContent?.fileSize !== undefined && (
          <div className="px-4 py-2 border-t border-copilot-border text-xs text-copilot-text-muted shrink-0">
            {fileContent.fileSize < 1024
              ? `${fileContent.fileSize} bytes`
              : fileContent.fileSize < 1024 * 1024
                ? `${(fileContent.fileSize / 1024).toFixed(1)} KB`
                : `${(fileContent.fileSize / 1024 / 1024).toFixed(2)} MB`}
          </div>
        )}
      </div>
    </div>
  )
}

export default FilePreviewModal
