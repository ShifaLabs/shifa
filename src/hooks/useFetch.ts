"use client";

import { useState, useCallback } from "react";

interface FetchOptions extends RequestInit {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UseFetchResult<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  execute: (url: string, options?: FetchOptions) => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for data fetching with loading and error states
 */
export function useFetch<T = any>(): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(
    async (url: string, options: FetchOptions = {}) => {
      const { onSuccess, onError, ...fetchOptions } = options;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url, fetchOptions);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || result.message || "Request failed");
        }

        setData(result);
        onSuccess?.(result);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        onError?.(error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, error, loading, execute, reset };
}

/**
 * Hook for POST requests
 */
export function usePost<T = any>() {
  const { data, error, loading, execute, reset } = useFetch<T>();

  const post = useCallback(
    (url: string, body: any, options: FetchOptions = {}) => {
      return execute(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        body: JSON.stringify(body),
        ...options,
      });
    },
    [execute],
  );

  return { data, error, loading, post, reset };
}

/**
 * Hook for PATCH/PUT requests
 */
export function useUpdate<T = any>() {
  const { data, error, loading, execute, reset } = useFetch<T>();

  const update = useCallback(
    (
      url: string,
      body: any,
      options: FetchOptions = {},
      method: "PATCH" | "PUT" = "PATCH",
    ) => {
      return execute(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        body: JSON.stringify(body),
        ...options,
      });
    },
    [execute],
  );

  return { data, error, loading, update, reset };
}

/**
 * Hook for DELETE requests
 */
export function useDelete<T = any>() {
  const { data, error, loading, execute, reset } = useFetch<T>();

  const remove = useCallback(
    (url: string, options: FetchOptions = {}) => {
      return execute(url, {
        method: "DELETE",
        ...options,
      });
    },
    [execute],
  );

  return { data, error, loading, remove, reset };
}
