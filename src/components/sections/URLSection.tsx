import { useAsync } from "@/hooks/useAsync";
import { SectionCard, StatusRow, Tags } from "@/components/SectionCard";
import { urlThreat } from "@/lib/api";
import type { UrlhausUrlResult } from "@/lib/api";
import { DomainSection } from "./DomainSection";

function extractHostname(url: string): string | null {
  try { return new URL(url).hostname; } catch { return null; }
}

export function URLSection({ url }: { url: string }) {
  const state = useAsync(() => urlThreat(url), [url]);
  const d = state.data;
  const found = d?.query_status === "ok";
  const hostname = extractHostname(url);

  return (
    <div className="space-y-3">
      <UrlThreatCard state={state} />
      {hostname && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Host</span>
            <span className="text-xs">{hostname}</span>
          </div>
          <DomainSection domain={hostname} />
        </div>
      )}
    </div>
  );
}

function UrlThreatCard({ state }: { state: ReturnType<typeof useAsync<UrlhausUrlResult>> }) {
  const d = state.data;
  const found = d?.query_status === "ok";
  return (
    <SectionCard title="URL Threat" source="URLhaus" loading={state.loading} error={state.error} skeletonRows={3}>
      {d && (
        found
          ? <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-destructive text-xs">● Malicious</span>
                {d.url_status && (
                  <span className={`text-xs ${d.url_status === "online" ? "text-destructive" : "text-muted-foreground"}`}>
                    {d.url_status}
                  </span>
                )}
              </div>
              {d.threat && <p className="text-xs text-muted-foreground">{d.threat}</p>}
              {d.date_added && <p className="text-xs text-muted-foreground">Added: {d.date_added}</p>}
              {d.blacklists && (
                <div className="space-y-0.5 text-xs">
                  <div className="flex gap-2"><span className="w-24 text-muted-foreground">GSB</span>{d.blacklists.gsb}</div>
                  <div className="flex gap-2"><span className="w-24 text-muted-foreground">SURBL</span>{d.blacklists.surbl}</div>
                  <div className="flex gap-2"><span className="w-24 text-muted-foreground">Spamhaus DBL</span>{d.blacklists.spamhaus_dbl}</div>
                </div>
              )}
              <Tags tags={d.tags ?? []} />
            </div>
          : <StatusRow ok={true} yes="No URLhaus records for this URL" no="" />
      )}
    </SectionCard>
  );
}
