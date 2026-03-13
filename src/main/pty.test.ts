import { afterEach, describe, expect, it, vi } from 'vitest';

import { __ptyInternals } from './pty';

describe('pty splitCommandLine', () => {
  it('parses quoted executable paths with spaces', () => {
    expect(
      __ptyInternals.splitCommandLine('"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -NoLogo')
    ).toEqual(['C:\\Program Files\\PowerShell\\7\\pwsh.exe', '-NoLogo']);
  });

  it('parses unquoted executable paths with spaces from expanded env vars', () => {
    expect(
      __ptyInternals.splitCommandLine('C:\\Program Files\\PowerShell\\7\\pwsh.exe -NoLogo')
    ).toEqual(['C:\\Program Files\\PowerShell\\7\\pwsh.exe', '-NoLogo']);
  });
});

describe('pty batching internals', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('flushes queued batch data exactly once after interval', () => {
    vi.useFakeTimers();
    const send = vi.fn();
    const instance = { batchBuffer: '', batchTimer: null as NodeJS.Timeout | null };
    const windowRef = {
      isDestroyed: () => false,
      webContents: { send },
    } as any;

    __ptyInternals.enqueueBatchBuffer(instance, 's1', 'hello ', windowRef);
    __ptyInternals.enqueueBatchBuffer(instance, 's1', 'world', windowRef);
    expect(send).not.toHaveBeenCalled();

    vi.advanceTimersByTime(16);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith('pty:data', { sessionId: 's1', data: 'hello world' });
    expect(instance.batchBuffer).toBe('');
    expect(instance.batchTimer).toBeNull();
  });

  it('flushes pending batch immediately when requested', () => {
    vi.useFakeTimers();
    const send = vi.fn();
    const instance = { batchBuffer: '', batchTimer: null as NodeJS.Timeout | null };
    const windowRef = {
      isDestroyed: () => false,
      webContents: { send },
    } as any;

    __ptyInternals.enqueueBatchBuffer(instance, 's2', 'partial', windowRef);
    __ptyInternals.flushBatchBuffer(instance, 's2', windowRef);

    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith('pty:data', { sessionId: 's2', data: 'partial' });
    vi.advanceTimersByTime(16);
    expect(send).toHaveBeenCalledTimes(1);
    expect(instance.batchBuffer).toBe('');
    expect(instance.batchTimer).toBeNull();
  });
});
