"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface ToastOptions {
  duration?: number;
  type?: "success" | "error" | "info" | "warning";
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration: number;
}

let toastId = 0;

/**
 * Custom hook for toast notifications
 */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, options: ToastOptions = {}) => {
    const id = `toast-${++toastId}`;
    const toast: Toast = {
      id,
      message,
      type: options.type || "info",
      duration: options.duration || 3000,
    };

    setToasts((prev) => [...prev, toast]);

    // Auto-remove after duration
    if (toast.duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toast.duration);
    }

    return id;
  }, []);

  const success = useCallback(
    (message: string, duration?: number) => {
      return show(message, { type: "success", duration });
    },
    [show],
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      return show(message, { type: "error", duration });
    },
    [show],
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      return show(message, { type: "info", duration });
    },
    [show],
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      return show(message, { type: "warning", duration });
    },
    [show],
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    show,
    success,
    error,
    info,
    warning,
    dismiss,
    dismissAll,
  };
}

/**
 * Hook for debouncing values
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for managing local storage
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue],
  );

  const remove = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, remove];
}

/**
 * Hook for tracking previous value
 * Note: Temporarily disabled due to React compiler restrictions
 * Use a state-based approach in your component if needed
 */
// export function usePrevious<T>(value: T): T | undefined {
//   Implementation removed - causes React compiler warnings
//   Use alternative: track previous value in component state
// }
