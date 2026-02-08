import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('should debounce the value after the specified delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 500 } },
    );

    expect(result.current).toBe('hello');

    // Update value
    rerender({ value: 'world', delay: 500 });

    // Before timer fires, still old value
    expect(result.current).toBe('hello');

    // Fast-forward past delay
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('world');
  });

  it('should reset the timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } },
    );

    rerender({ value: 'ab', delay: 300 });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Still hasn't updated — timer reset when value changed
    rerender({ value: 'abc', delay: 300 });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Only 200ms since last change, so still debounced
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Now it should have the latest value
    expect(result.current).toBe('abc');
  });

  it('should work with non-string types', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 42, delay: 200 } },
    );

    expect(result.current).toBe(42);

    rerender({ value: 99, delay: 200 });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe(99);
  });
});
