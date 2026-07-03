"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

import { getSearchSuggestions, RECOMMENDED_SEARCHES } from "../lib/search";
import { cn } from "../lib/utils";

type SmartSearchBarProps = {
  className?: string;
  inputClassName?: string;
  size?: "sm" | "lg";
  autoFocus?: boolean;
  initialQuery?: string;
  onSearch?: (query: string) => void;
};

export default function SmartSearchBar({
  className,
  inputClassName,
  size = "sm",
  autoFocus = false,
  initialQuery = "",
  onSearch,
}: SmartSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [focused, setFocused] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const timer = setInterval(() => {
      setHintIndex((i) => (i + 1) % RECOMMENDED_SEARCHES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const suggestions = getSearchSuggestions(query);
  const showRotatingHint = !query && !focused;

  const runSearch = useCallback(
    (term: string) => {
      const q = term.trim();
      if (!q) return;
      setShowSuggestions(false);
      setFocused(false);
      if (onSearch) {
        onSearch(q);
      } else {
        router.push(`/search?q=${encodeURIComponent(q)}`);
      }
    },
    [onSearch, router],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query || RECOMMENDED_SEARCHES[hintIndex]);
  };

  const isLarge = size === "lg";

  return (
    <div ref={wrapRef} className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <Search
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-400",
            isLarge ? "left-5" : "left-4",
          )}
          size={isLarge ? 22 : 18}
        />
        <div className="relative">
          <input
            type="search"
            autoFocus={autoFocus}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => {
              setFocused(true);
              setShowSuggestions(true);
            }}
            onBlur={() => setFocused(false)}
            className={cn(
              "w-full rounded-full border border-line bg-canvas font-medium text-ink-950 outline-none transition focus:border-accent focus:bg-white",
              isLarge
                ? "h-14 pl-14 pr-5 text-base sm:text-lg"
                : "h-10 pl-11 pr-4 text-sm",
              inputClassName,
            )}
            aria-label="Search products"
          />
          {showRotatingHint && (
            <span
              className={cn(
                "pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-400",
                isLarge ? "left-14 text-base" : "left-11 text-sm",
              )}
              aria-hidden
            >
              Search &ldquo;{RECOMMENDED_SEARCHES[hintIndex]}&rdquo;
            </span>
          )}
        </div>
      </form>

      {showSuggestions && (focused || query) && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-line bg-white shadow-xl">
          <p className="border-b border-line-soft px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-ink-400">
            {query ? "Suggestions" : "Trending searches"}
          </p>
          <ul className="max-h-64 overflow-y-auto py-1">
            {(query ? suggestions : RECOMMENDED_SEARCHES).map((item) => (
              <li key={item}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-ink-800 hover:bg-accent-soft hover:text-accent"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setQuery(item);
                    runSearch(item);
                  }}
                >
                  <Search size={14} className="shrink-0 text-ink-400" />
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
