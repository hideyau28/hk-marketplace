"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useTemplate } from "@/lib/template-context";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function SearchBar({ value, onChange, placeholder = "搜尋商品..." }: Props) {
  const tmpl = useTemplate();
  const [localValue, setLocalValue] = useState(value);
  const [focused, setFocused] = useState(false);

  // Debounce 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClear = () => {
    setLocalValue("");
    onChange("");
  };

  return (
    <div className="px-4 pt-4 pb-2" style={{ backgroundColor: tmpl.bg }}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 rounded-full border border-zinc-200 text-sm placeholder:text-zinc-400 focus:outline-none focus:border-transparent transition-all"
          style={{
            backgroundColor: tmpl.card,
            color: tmpl.text,
            ...(focused ? { outline: `2px solid ${tmpl.accent}`, outlineOffset: '0px' } : {}),
          }}
        />
        {localValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-zinc-300 hover:bg-zinc-400 flex items-center justify-center transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}
