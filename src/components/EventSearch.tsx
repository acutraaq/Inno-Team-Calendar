"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, CalendarDays } from "lucide-react";
import { searchEventTitles } from "@/lib/actions";
import { format } from "date-fns";

type Suggestion = { title: string; date: string };

interface EventSearchProps {
  year: number;
  query: string;
  onQueryChange: (q: string) => void;
  onSelectResult: (title: string) => void;
}

function fmtDate(dateStr: string) {
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    return format(new Date(y, m - 1, d), "d MMM");
  } catch {
    return dateStr;
  }
}

export function EventSearch({ year, query, onQueryChange, onSelectResult }: EventSearchProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(
    (q: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!q.trim()) {
        setSuggestions([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      debounceRef.current = setTimeout(() => {
        searchEventTitles(year, q)
          .then((res) => {
            setSuggestions(res.filter((s): s is Suggestion => !!s.title && !!s.date));
          })
          .catch(() => setSuggestions([]))
          .finally(() => setLoading(false));
      }, 250);
    },
    [year]
  );

  useEffect(() => {
    fetchSuggestions(query);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (val: string) => {
    onQueryChange(val);
    setOpen(true);
  };

  const handleSelect = (title: string) => {
    onQueryChange(title);
    onSelectResult(title);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-stone-200">
        <Search className="w-4 h-4 text-stone-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search events…"
          className="flex-1 bg-transparent text-sm text-stone-700 placeholder-stone-400 outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              onQueryChange("");
              setSuggestions([]);
              inputRef.current?.focus();
            }}
            className="p-0.5 hover:bg-stone-100 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5 text-stone-400" />
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-stone-200 rounded-lg shadow-lg overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s.title}
              type="button"
              onClick={() => handleSelect(s.title)}
              className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors flex items-center justify-between gap-3"
            >
              <span className="truncate">{s.title}</span>
              <span className="text-stone-400 text-xs flex items-center gap-1 shrink-0">
                <CalendarDays className="w-3 h-3" />
                {fmtDate(s.date)}
              </span>
            </button>
          ))}
        </div>
      )}

      {open && query.trim().length > 0 && !loading && suggestions.length === 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-stone-200 rounded-lg shadow-lg p-3 text-sm text-stone-400">
          No matching events
        </div>
      )}
    </div>
  );
}
