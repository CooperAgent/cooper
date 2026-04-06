import React, { useState } from 'react';
import { Modal } from '../Modal';
import { Button } from '../Button';

export interface UpdateAvailableModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVersion: string;
  newVersion: string;
  onDontRemind: () => void;
}

const UPDATE_COMMAND = 'git pull && npm run dist';

export const UpdateAvailableModal: React.FC<UpdateAvailableModalProps> = ({
  isOpen,
  onClose,
  currentVersion,
  newVersion,
  onDontRemind,
}) => {
  const [copied, setCopied] = useState(false);

  const handleDontRemind = () => {
    onDontRemind();
    onClose();
  };

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(UPDATE_COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may not be available
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Available"
      width="500px"
      testId="update-available-modal"
      showCloseButton
    >
      <Modal.Body>
        <div className="space-y-4">
          <div className="flex items-center justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </div>
          </div>

          <p className="text-copilot-text text-center">
            A new version of <span className="font-semibold">Cooper</span> is available!
          </p>

          <div className="bg-copilot-background rounded-lg p-3 text-center">
            <div className="text-copilot-text-muted text-xs mb-1">Version</div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-copilot-text-muted">{currentVersion}</span>
              <span className="text-copilot-text-muted">→</span>
              <span className="text-green-500 font-semibold">{newVersion}</span>
            </div>
          </div>

          <p className="text-copilot-text-muted text-xs text-center">
            Run the following command in your Cooper directory to update:
          </p>

          <div className="relative group">
            <button
              onClick={handleCopyCommand}
              className="w-full bg-copilot-background rounded-lg p-3 font-mono text-sm text-copilot-text text-center cursor-pointer hover:bg-copilot-border/30 transition-colors"
              title="Click to copy"
              data-testid="copy-update-command"
            >
              {UPDATE_COMMAND}
            </button>
            <span
              className={`absolute top-1 right-2 text-xs transition-opacity ${copied ? 'text-green-500 opacity-100' : 'text-copilot-text-muted opacity-0 group-hover:opacity-100'}`}
            >
              {copied ? 'Copied!' : 'Click to copy'}
            </span>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="p-4 border-t border-copilot-border">
        <div className="flex flex-col w-full gap-2">
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={onClose}>
              Later
            </Button>
            <Button variant="primary" onClick={handleCopyCommand}>
              {copied ? 'Copied!' : 'Copy Command'}
            </Button>
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleDontRemind}
              className="text-copilot-text-muted text-xs hover:text-copilot-text transition-colors underline"
            >
              Don't remind me about this version
            </button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default UpdateAvailableModal;
