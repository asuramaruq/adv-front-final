import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { apiClient } from '@/api/apiClient';
import type { Task } from '@/types';

interface AsyncValidationResult {
  isValidating: boolean;
  error: string | null;
  isValid: boolean;
}

/**
 * Custom hook for asynchronous task-title uniqueness validation.
 * Debounces the input by 500ms, then queries the API to check for duplicates.
 * Aborts in-flight requests when the value changes.
 */
export function useAsyncValidation(
  title: string,
  projectId: string,
  excludeTaskId?: string,
): AsyncValidationResult {
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);
  const debouncedTitle = useDebounce(title, 500);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Skip validation for empty/short titles
    if (!debouncedTitle || debouncedTitle.length < 3 || !projectId) {
      setError(null);
      setIsValid(true);
      setIsValidating(false);
      return;
    }

    // Abort previous in-flight request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsValidating(true);

    apiClient
      .get<Task[]>(`/tasks?projectId=${encodeURIComponent(projectId)}`)
      .then((tasks) => {
        if (controller.signal.aborted) return;
        const duplicate = tasks.find(
          (t) =>
            t.title.toLowerCase() === debouncedTitle.toLowerCase() &&
            t.id !== excludeTaskId,
        );
        if (duplicate) {
          setError('A task with this title already exists in this project');
          setIsValid(false);
        } else {
          setError(null);
          setIsValid(true);
        }
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setError('Validation check failed');
        setIsValid(false);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsValidating(false);
      });

    return () => {
      controller.abort();
    };
  }, [debouncedTitle, projectId, excludeTaskId]);

  return { isValidating, error, isValid };
}
