import { Search, X } from "lucide-react";
import { useRef } from "react";
import { detect, TYPE_LABELS, type InputType } from "@/lib/detect";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
  compact?: boolean;
}

export function SearchBar({ value, onChange, onSubmit, compact = false }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const type = detect(value);
  const hasValue = value.trim().length > 0;
  const detected = hasValue && type !== "unknown";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) onSubmit(value.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      onChange("");
      inputRef.current?.blur();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={cn(
          "relative flex items-center rounded border border-border bg-card transition-colors",
          "focus-within:border-ring focus-within:ring-1 focus-within:ring-ring",
          compact ? "h-8" : "h-11"
        )}
      >
        <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="domain · IP · URL · CVE · ASN · SHA-256"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className={cn(
            "w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground",
            compact ? "px-8" : "px-8",
            hasValue ? "pr-28" : ""
          )}
        />
        {hasValue && (
          <div className="absolute right-1.5 flex items-center gap-1">
            {detected && (
              <span className="hidden text-[10px] text-muted-foreground sm:block">
                {TYPE_LABELS[type]}
              </span>
            )}
            <button
              type="button"
              onClick={() => { onChange(""); inputRef.current?.focus(); }}
              className="rounded p-1 text-muted-foreground hover:text-foreground"
              aria-label="Clear"
            >
              <X className="h-3 w-3" />
            </button>
            <button
              type="submit"
              className="rounded bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground hover:bg-primary/90"
            >
              search
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
