import { useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// ── SectionCard ────────────────────────────────────────────────────────────

interface SectionCardProps {
  title: string;
  source?: string;
  loading?: boolean;
  error?: string | null;
  skeletonRows?: number;
  expandable?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function SectionCard({
  title,
  source,
  loading,
  error,
  skeletonRows = 3,
  expandable = false,
  className,
  children,
}: SectionCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn("rounded border border-border bg-card p-3 transition-all duration-200 hover:border-ring/30 hover:shadow-sm", className)}>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{title}</span>
        {source && <span className="text-[10px] text-muted-foreground/60">{source}</span>}
      </div>

      {loading ? (
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: skeletonRows }).map((_, i) => (
            <Skeleton key={i} className={i === 0 ? "h-3 w-3/4" : i % 2 === 0 ? "h-3 w-1/2" : "h-3 w-5/6"} />
          ))}
        </div>
      ) : error ? (
        <div className="flex items-start gap-1.5 text-destructive">
          <AlertCircle className="mt-px h-3 w-3 shrink-0" />
          <span className="text-xs">{error}</span>
        </div>
      ) : expandable ? (
        <div className="relative">
          <div className={cn("overflow-hidden", !expanded && "max-h-32")}>
            {children}
          </div>
          {!expanded && (
            <div className="pointer-events-none absolute inset-x-0 bottom-6 h-8 bg-gradient-to-t from-card to-transparent" />
          )}
          <button
            onClick={() => setExpanded((e) => !e)}
            className="mt-1.5 flex items-center gap-0.5 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {expanded ? "Show less" : "Show more"}
          </button>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

// ── Layout helpers ─────────────────────────────────────────────────────────

export function CardGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-2 sm:grid-cols-2", className)}>
      {children}
    </div>
  );
}

// ── Row primitives ─────────────────────────────────────────────────────────

export function Row({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 py-px text-xs">
      <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 break-all">{value ?? children}</span>
    </div>
  );
}

export function SubLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-0.5 text-[10px] text-muted-foreground">{children}</p>;
}

export function StatusRow({ ok, yes, no }: { ok: boolean; yes: string; no: string }) {
  return (
    <span className={cn("text-xs", ok ? "text-success" : "text-destructive")}>
      ● {ok ? yes : no}
    </span>
  );
}

export function NoData({ message = "No data found" }: { message?: string }) {
  return <p className="text-xs text-muted-foreground">{message}</p>;
}

export function Tags({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {tags.map((t) => (
        <span key={t} className="rounded bg-muted px-1.5 py-px text-[10px] text-muted-foreground">{t}</span>
      ))}
    </div>
  );
}
