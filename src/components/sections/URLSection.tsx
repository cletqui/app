import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/SectionCard";
import { Separator } from "@/components/ui/separator";
import { urlThreat } from "@/lib/api";
import type { UrlhausUrlResult } from "@/lib/api";
import { DomainSection } from "./DomainSection";

function extractHostname(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export function URLSection({ url }: { url: string }) {
  const [state, setState] = useState<{ loading: boolean; data: UrlhausUrlResult | null; error: string | null }>({
    loading: true, data: null, error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, data: null, error: null });
    urlThreat(url)
      .then((data) => { if (!cancelled) setState({ loading: false, data, error: null }); })
      .catch((e: Error) => { if (!cancelled) setState({ loading: false, data: null, error: e.message }); });
    return () => { cancelled = true; };
  }, [url]);

  const d = state.data;
  const found = d?.query_status === "ok";
  const hostname = extractHostname(url);

  return (
    <div className="space-y-4">
      <SectionCard title="URL Threat" source="URLhaus" loading={state.loading} error={state.error} skeletonRows={3}>
        {d && (
          found ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Malicious</Badge>
                {d.url_status && <Badge variant={d.url_status === "online" ? "destructive" : "muted"}>{d.url_status}</Badge>}
                {d.urlhaus_reference && (
                  <a href={d.urlhaus_reference} target="_blank" rel="noopener noreferrer" className="ml-auto text-muted-foreground hover:text-foreground">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              {d.threat && <p className="text-sm text-muted-foreground">{d.threat}</p>}
              {d.date_added && <p className="text-xs text-muted-foreground">Added: {d.date_added}</p>}
              {d.tags?.length ? (
                <div className="flex flex-wrap gap-1">
                  {d.tags.map((t) => <Badge key={t} variant="muted">{t}</Badge>)}
                </div>
              ) : null}
              {d.blacklists && (
                <div className="space-y-0.5 text-xs">
                  <div className="text-muted-foreground">GSB: {d.blacklists.gsb}</div>
                  <div className="text-muted-foreground">SURBL: {d.blacklists.surbl}</div>
                  <div className="text-muted-foreground">Spamhaus DBL: {d.blacklists.spamhaus_dbl}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Badge variant="success">Clean</Badge>
              <span className="text-sm text-muted-foreground">No URLhaus records for this URL</span>
            </div>
          )
        )}
      </SectionCard>

      {hostname && (
        <>
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground font-mono">{hostname}</span>
            <Separator className="flex-1" />
          </div>
          <DomainSection domain={hostname} />
        </>
      )}
    </div>
  );
}
