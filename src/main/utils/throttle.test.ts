import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { createDeltaThrottler } from './throttle';

describe('createDeltaThrottler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('batches multiple deltas within throttle window', () => {
    const emitFn = vi.fn();
    const throttler = createDeltaThrottler(emitFn, 50);

    // Add multiple deltas rapidly
    throttler.addDelta('Hello ');
    throttler.addDelta('world');
    throttler.addDelta('!');

    // Should not emit yet
    expect(emitFn).not.toHaveBeenCalled();

    // Advance time past throttle window
    vi.advanceTimersByTime(50);

    // Should emit combined delta
    expect(emitFn).toHaveBeenCalledTimes(1);
    expect(emitFn).toHaveBeenCalledWith('Hello world!');
  });

  it('emits immediately when flush is called', () => {
    const emitFn = vi.fn();
    const throttler = createDeltaThrottler(emitFn, 50);

    throttler.addDelta('Test');
    expect(emitFn).not.toHaveBeenCalled();

    throttler.flush();
    expect(emitFn).toHaveBeenCalledTimes(1);
    expect(emitFn).toHaveBeenCalledWith('Test');
  });

  it('does not emit if buffer is empty', () => {
    const emitFn = vi.fn();
    const throttler = createDeltaThrottler(emitFn, 50);

    throttler.flush();
    expect(emitFn).not.toHaveBeenCalled();
  });

  it('clears buffer after emission', () => {
    const emitFn = vi.fn();
    const throttler = createDeltaThrottler(emitFn, 50);

    throttler.addDelta('First');
    throttler.flush();

    expect(emitFn).toHaveBeenCalledWith('First');
    emitFn.mockClear();

    throttler.addDelta('Second');
    throttler.flush();

    expect(emitFn).toHaveBeenCalledWith('Second');
  });

  it('cancels timer on flush', () => {
    const emitFn = vi.fn();
    const throttler = createDeltaThrottler(emitFn, 50);

    throttler.addDelta('Test');
    throttler.flush();

    // Advance time - should not trigger another emission
    vi.advanceTimersByTime(50);
    expect(emitFn).toHaveBeenCalledTimes(1);
  });

  it('handles multiple batch cycles', () => {
    const emitFn = vi.fn();
    const throttler = createDeltaThrottler(emitFn, 50);

    // First batch
    throttler.addDelta('Batch 1');
    vi.advanceTimersByTime(50);
    expect(emitFn).toHaveBeenCalledWith('Batch 1');

    emitFn.mockClear();

    // Second batch
    throttler.addDelta('Batch 2');
    vi.advanceTimersByTime(50);
    expect(emitFn).toHaveBeenCalledWith('Batch 2');
  });
});
