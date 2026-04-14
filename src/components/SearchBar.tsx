import { Search, X } from "lucide-react";
import { useRef } from "react";
import { detect, TYPE_LABELS, type InputType } from "@/lib/detect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TYPE_COLORS: Record<InputType, BadgeVariant> = {
  ipv4: "default",
  ipv6: "default",
  domain: "secondary",
  url: "secondary",
  cve: "warning",
  asn: "default",
  sha256: "muted",
  unknown: "outline",
};

type BadgeVariant = "default" | "secondary" | "outline" | "destructive" | "success" | "warning" | "muted";

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
          "relative flex items-center rounded-lg border border-border bg-card transition-shadow",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0",
          compact ? "h-10" : "h-14"
        )}
      >
        <Search
          className={cn(
            "pointer-events-none absolute left-3 shrink-0 text-muted-foreground",
            compact ? "h-4 w-4" : "h-5 w-5"
          )}
        />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Domain, IP, URL, CVE, ASN, SHA-256…"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className={cn(
            "w-full bg-transparent font-mono outline-none placeholder:font-sans placeholder:text-muted-foreground",
            compact ? "px-9 text-sm" : "px-10 text-base",
            hasValue && !compact ? "pr-28" : hasValue ? "pr-24" : ""
          )}
        />
        {hasValue && (
          <div className="absolute right-2 flex items-center gap-1.5">
            <Badge variant={TYPE_COLORS[type]} className="hidden sm:inline-flex">
              {TYPE_LABELS[type]}
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={() => { onChange(""); inputRef.current?.focus(); }}
              aria-label="Clear"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
            <Button type="submit" size="sm" className={cn(compact ? "h-7 text-xs" : "h-8")}>
              Search
            </Button>
          </div>
        )}
      </div>
    </form>
  );
}
