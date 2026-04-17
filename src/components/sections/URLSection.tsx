import { useAsync } from "@/hooks/useAsync";
import { SectionCard } from "@/components/SectionCard";
import { urlRedirects } from "@/lib/api";
import type { RedirectHop } from "@/lib/api";
import { DomainSection } from "./DomainSection";

function extractHostname(url: string): string | null {
  try { return new URL(url).hostname; } catch { return null; }
}

function statusColor(status: number): string {
  if (status >= 200 && status < 300) return "text-success";
  if (status >= 300 && status < 400) return "text-warning";
  if (status >= 400) return "text-destructive";
  return "text-muted-foreground";
}

function RedirectChainCard({ state }: { state: ReturnType<typeof useAsync<{ hops: RedirectHop[] }>> }) {
  const d = state.data;
  return (
    <SectionCard title="Redirect Chain" loading={state.loading} error={state.error} skeletonRows={2} expandable>
      {d && (
        d.hops.length === 0
          ? <p className="text-xs text-muted-foreground">No redirects — URL resolves directly</p>
          : <div className="space-y-1">
              {d.hops.map((hop, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className={`w-8 shrink-0 tabular-nums font-medium ${statusColor(hop.status)}`}>
                    {hop.status || "→"}
                  </span>
                  <span className="min-w-0 break-all text-muted-foreground">{hop.url}</span>
                </div>
              ))}
            </div>
      )}
    </SectionCard>
  );
}

export function URLSection({ url }: { url: string }) {
  const hostname = extractHostname(url);
  const redirects = useAsync(() => urlRedirects(url), [url]);

  if (!hostname) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Host</span>
        <span className="text-xs">{hostname}</span>
      </div>
      <RedirectChainCard state={redirects} />
      <DomainSection domain={hostname} />
    </div>
  );
}
