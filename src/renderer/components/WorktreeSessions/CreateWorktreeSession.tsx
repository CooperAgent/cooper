import React, { useState, useEffect } from 'react'
import { Modal } from '../Modal'
import { Button } from '../Button'
import { Spinner } from '../Spinner'
import { RalphIcon, LisaIcon, ChevronDownIcon, ChevronRightIcon } from '../Icons/Icons'

export interface IssueComment {
  body: string
  user: { login: string }
  created_at: string
}

export interface IssueInfo {
  url: string
  title: string
  body: string | null
  comments?: IssueComment[]
}

interface CreateWorktreeSessionProps {
  isOpen: boolean
  onClose: () => void
  repoPath: string
  onSessionCreated: (worktreePath: string, branch: string, autoStart?: { issueInfo: IssueInfo; useRalphWiggum?: boolean; ralphMaxIterations?: number; useLisaSimpson?: boolean }) => void
}

export const CreateWorktreeSession: React.FC<CreateWorktreeSessionProps> = ({
  isOpen,
  onClose,
  repoPath,
  onSessionCreated
}) => {
  const [branch, setBranch] = useState('')
  const [issueUrl, setIssueUrl] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isFetchingIssue, setIsFetchingIssue] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gitSupported, setGitSupported] = useState<boolean | null>(null)
  const [gitVersion, setGitVersion] = useState<string>('')
  const [issueTitle, setIssueTitle] = useState<string | null>(null)
  const [issueBody, setIssueBody] = useState<string | null>(null)
  const [issueComments, setIssueComments] = useState<IssueComment[] | undefined>(undefined)
  const [autoStart, setAutoStart] = useState(false)
  const [useRalphWiggum, setUseRalphWiggum] = useState(false)
  const [ralphMaxIterations, setRalphMaxIterations] = useState(5)
  const [useLisaSimpson, setUseLisaSimpson] = useState(false)
  const [showIssueSection, setShowIssueSection] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setBranch('')
      setIssueUrl('')
      setError(null)
      setIssueTitle(null)
      setIssueBody(null)
      setIssueComments(undefined)
      setAutoStart(false)
      setUseRalphWiggum(false)
      setRalphMaxIterations(5)
      setUseLisaSimpson(false)
      setShowIssueSection(false)
      checkGitVersion()
    }
  }, [isOpen])

  const checkGitVersion = async () => {
    try {
      const result = await window.electronAPI.worktree.checkGitVersion()
      setGitSupported(result.supported)
      setGitVersion(result.version)
    } catch {
      setGitSupported(false)
      setGitVersion('unknown')
    }
  }

  const handleFetchIssue = async () => {
    if (!issueUrl.trim()) return
    
    setIsFetchingIssue(true)
    setError(null)
    setIssueTitle(null)
    
    try {
      const result = await window.electronAPI.worktree.fetchGitHubIssue(issueUrl.trim())
      if (result.success && result.issue && result.suggestedBranch) {
        setBranch(result.suggestedBranch)
        setIssueTitle(result.issue.title)
        setIssueBody(result.issue.body)
        setIssueComments(result.issue.comments)
      } else {
        setError(result.error || 'Failed to fetch issue')
      }
    } catch (err) {
      setError(String(err))
    } finally {
      setIsFetchingIssue(false)
    }
  }

  const handleCreate = async () => {
    if (!branch.trim()) {
      setError('Branch name is required')
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const result = await window.electronAPI.worktree.createSession({
        repoPath,
        branch: branch.trim()
      })

      if (result.success && result.session) {
        const autoStartInfo = autoStart && issueTitle ? {
          issueInfo: {
            url: issueUrl.trim(),
            title: issueTitle,
            body: issueBody,
            comments: issueComments
          },
          useRalphWiggum,
          ralphMaxIterations,
          useLisaSimpson
        } : undefined
        onSessionCreated(result.session.worktreePath, result.session.branch, autoStartInfo)
        onClose()
      } else {
        setError(result.error || 'Failed to create worktree session')
      }
    } catch (err) {
      setError(String(err))
    } finally {
      setIsCreating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isCreating && branch.trim()) {
      handleCreate()
    }
  }

  const handleIssueKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isFetchingIssue && issueUrl.trim()) {
      handleFetchIssue()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Worktree Session" width="450px">
      <Modal.Body>
        {gitSupported === false ? (
          <div className="text-copilot-error text-sm mb-4">
            Git 2.20+ required for worktree support. Found: {gitVersion}
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-xs text-copilot-text-muted mb-1">
                Repository
              </label>
              <div className="text-sm text-copilot-text font-mono truncate bg-copilot-bg px-2 py-1.5 rounded border border-copilot-border">
                {repoPath}
              </div>
            </div>

            <div className="mb-4">
              <button
                type="button"
                onClick={() => setShowIssueSection(!showIssueSection)}
                className="flex items-center gap-1 text-xs text-copilot-text-muted hover:text-copilot-text"
              >
                {showIssueSection ? <ChevronDownIcon size={14} /> : <ChevronRightIcon size={14} />}
                GitHub Issue (optional)
              </button>
              {showIssueSection && (
                <>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={issueUrl}
                      onChange={(e) => setIssueUrl(e.target.value)}
                      onKeyDown={handleIssueKeyDown}
                      placeholder="https://github.com/owner/repo/issues/123"
                      className="flex-1 px-3 py-2 bg-copilot-bg border border-copilot-border rounded text-sm text-copilot-text placeholder:text-copilot-text-muted focus:outline-none focus:border-copilot-accent"
                      disabled={isCreating || isFetchingIssue}
                    />
                    <Button
                      variant="secondary"
                      onClick={handleFetchIssue}
                      disabled={!issueUrl.trim() || isFetchingIssue || isCreating}
                    >
                      {isFetchingIssue ? <Spinner /> : 'Fetch'}
                    </Button>
                  </div>
                  {issueTitle && (
                    <>
                      <p className="text-xs text-copilot-accent truncate mt-2" title={issueTitle}>
                        Issue: {issueTitle}
                      </p>
                      <label className="flex items-center gap-2 cursor-pointer mt-2">
                        <input
                          type="checkbox"
                          checked={autoStart}
                          onChange={(e) => setAutoStart(e.target.checked)}
                          className="w-4 h-4 accent-copilot-accent"
                          disabled={isCreating}
                        />
                        <span className="text-sm text-copilot-text">
                          Start working immediately
                        </span>
                      </label>
                      
                      {autoStart && (
                        <div className="mt-3 ml-6">
                          <div className="text-xs text-copilot-text-muted mb-2">Agent Mode <span className="opacity-60">(optional)</span></div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setUseRalphWiggum(!useRalphWiggum)
                                if (!useRalphWiggum) setUseLisaSimpson(false)
                              }}
                              disabled={isCreating}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                                useRalphWiggum
                                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                  : 'bg-copilot-bg border-copilot-border text-copilot-text-muted hover:border-copilot-border-hover'
                              }`}
                            >
                              <RalphIcon size={18} />
                              <div className="text-left">
                                <div className="text-sm font-medium">Ralph</div>
                                <div className="text-xs opacity-70">Autonomous</div>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setUseLisaSimpson(!useLisaSimpson)
                                if (!useLisaSimpson) setUseRalphWiggum(false)
                              }}
                              disabled={isCreating}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                                useLisaSimpson
                                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                  : 'bg-copilot-bg border-copilot-border text-copilot-text-muted hover:border-copilot-border-hover'
                              }`}
                            >
                              <LisaIcon size={18} />
                              <div className="text-left">
                                <div className="text-sm font-medium">Lisa</div>
                                <div className="text-xs opacity-70">Plan → Code → Review</div>
                              </div>
                            </button>
                          </div>
                          {useRalphWiggum && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs text-copilot-text-muted">Max iterations:</span>
                              <input
                                type="number"
                                value={ralphMaxIterations}
                                onChange={(e) => setRalphMaxIterations(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                                className="w-14 bg-copilot-bg border border-copilot-border rounded px-2 py-1 text-xs text-copilot-text"
                                min={1}
                                max={100}
                                disabled={isCreating}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-xs text-copilot-text-muted mb-1">
                Branch Name
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="feature/my-feature"
                className="w-full px-3 py-2 bg-copilot-bg border border-copilot-border rounded text-sm text-copilot-text placeholder:text-copilot-text-muted focus:outline-none focus:border-copilot-accent"
                autoFocus
                disabled={isCreating}
              />
              <p className="text-xs text-copilot-text-muted mt-1">
                Creates a new branch if it doesn't exist.
              </p>
            </div>

            {error && (
              <div className="text-copilot-error text-sm mb-4 p-2 bg-copilot-error-muted rounded">
                {error}
              </div>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Body className="pt-0">
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            disabled={isCreating || !branch.trim() || gitSupported === false}
          >
            {isCreating ? (
              <>
                <Spinner /> Creating...
              </>
            ) : (
              'Create Session'
            )}
          </Button>
        </Modal.Footer>
      </Modal.Body>
    </Modal>
  )
}

export default CreateWorktreeSession
