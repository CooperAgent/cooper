/**
 * Delta throttler for coalescing frequent emissions into batches.
 * Accumulates deltas and flushes them at regular intervals or on completion.
 */

export interface ThrottledDeltaEmitter {
  addDelta: (delta: string) => void;
  flush: () => void;
}

/**
 * Creates a throttled delta emitter that batches frequent emissions.
 * @param emitFn Function to call with accumulated delta content
 * @param intervalMs Throttle interval in milliseconds (default: 50ms)
 * @returns Throttler object with addDelta and flush methods
 */
export function createDeltaThrottler(
  emitFn: (content: string) => void,
  intervalMs: number = 50
): ThrottledDeltaEmitter {
  let buffer = '';
  let timer: NodeJS.Timeout | null = null;

  const flush = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (buffer) {
      emitFn(buffer);
      buffer = '';
    }
  };

  const addDelta = (delta: string) => {
    buffer += delta;
    if (!timer) {
      timer = setTimeout(flush, intervalMs);
    }
  };

  return { addDelta, flush };
}
