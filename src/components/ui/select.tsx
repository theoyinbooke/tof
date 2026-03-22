"use client";

import { useDeferredValue, useEffect, useRef, useState } from "react";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  /** Compact variant for inline usage (e.g., role badges in tables) */
  variant?: "default" | "compact";
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  className = "",
  searchable = false,
  searchPlaceholder = "Search options",
  emptyMessage = "No results found.",
  variant = "default",
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const deferredSearch = useDeferredValue(search);

  const close = () => {
    setOpen(false);
    setSearch("");
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        close();
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open]);

  const selectedOption = options.find((o) => o.value === value);
  const normalizedQuery = deferredSearch.trim().toLowerCase();
  const filteredOptions =
    searchable && normalizedQuery
      ? options.filter((option) => {
          const label = option.label.toLowerCase();
          const optionValue = option.value.toLowerCase();
          return (
            label.includes(normalizedQuery) ||
            optionValue.includes(normalizedQuery)
          );
        })
      : options;
  const displayLabel = selectedOption?.label || value || placeholder || "Select";
  const hasDisplayValue = Boolean(selectedOption || value);

  useEffect(() => {
    if (open && searchable && variant === "default") {
      searchRef.current?.focus();
    }
  }, [open, searchable, variant]);

  if (variant === "compact") {
    return (
      <div ref={ref} className={`relative inline-block ${className}`}>
        <button
          type="button"
          onClick={() => {
            if (disabled) return;
            if (open) {
              close();
              return;
            }
            setOpen(true);
          }}
          disabled={disabled}
          className="flex items-center gap-1 rounded-full border border-[#E5E5E5] bg-white px-2.5 py-1 text-xs font-medium text-[#171717] transition-colors hover:bg-[#F7F7F7] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>{displayLabel}</span>
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="#737373"
            strokeWidth="1.5"
            strokeLinecap="round"
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path d="M2.5 3.75L5 6.25l2.5-2.5" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 z-50 mt-1 min-w-[140px] overflow-hidden rounded-lg border border-[#E5E5E5] bg-white shadow-md">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  close();
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-[#F7F7F7] ${
                  option.value === value
                    ? "font-medium text-[#00D632]"
                    : "text-[#262626]"
                }`}
              >
                {option.value === value && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="#00D632"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 6l3 3 5-5" />
                  </svg>
                )}
                {option.value !== value && <span className="w-3" />}
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => {
          if (disabled) return;
          if (open) {
            close();
            return;
          }
          setOpen(true);
        }}
        disabled={disabled}
        className="flex h-11 w-full items-center justify-between rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm text-[#171717] outline-none transition-colors hover:border-[#D4D4D4] focus:border-[#171717] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={hasDisplayValue ? "text-[#171717]" : "text-[#D4D4D4]"}>
          {displayLabel}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="#737373"
          strokeWidth="1.5"
          strokeLinecap="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M3 4.5L6 7.5l3-3" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-[#E5E5E5] bg-white shadow-md">
          {searchable && (
            <div className="sticky top-0 border-b border-[#F0F0F0] bg-white p-2">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 w-full rounded-md border border-[#E5E5E5] bg-white px-3 text-sm text-[#171717] outline-none transition-colors focus:border-[#171717] placeholder:text-[#A3A3A3]"
              />
            </div>
          )}

          {filteredOptions.length === 0 ? (
            <div className="px-3 py-3 text-sm text-[#737373]">{emptyMessage}</div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  close();
                }}
                className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#F7F7F7] ${
                  option.value === value
                    ? "font-medium text-[#00D632]"
                    : "text-[#262626]"
                }`}
              >
                {option.value === value && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="#00D632"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2.5 7l3 3 6-6" />
                  </svg>
                )}
                {option.value !== value && <span className="w-3.5" />}
                {option.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
