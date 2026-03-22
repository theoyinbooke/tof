"use client";

import { useState, useCallback } from "react";

export function useMutationWithError() {
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const handleError = useCallback((err: unknown) => {
    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError("An unexpected error occurred.");
    }
    // Auto-clear after 5 seconds
    setTimeout(() => setError(null), 5000);
  }, []);

  return { error, clearError, handleError };
}

export function ErrorToast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full bg-[#171717] px-4 py-2 shadow-lg">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="#EF4444"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <circle cx="8" cy="8" r="6" />
          <path d="M8 5v3M8 10h.01" />
        </svg>
        <span className="text-xs text-white">{message}</span>
        <button
          onClick={onClose}
          className="ml-1 text-[#737373] hover:text-white"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M3 3l6 6M9 3l-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function SuccessToast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full bg-[#171717] px-4 py-2 shadow-lg">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="#00D632"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <circle cx="8" cy="8" r="6" />
          <path d="M6 8l1.5 1.5L10 6" />
        </svg>
        <span className="text-xs text-white">{message}</span>
        <button
          onClick={onClose}
          className="ml-1 text-[#737373] hover:text-white"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M3 3l6 6M9 3l-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
