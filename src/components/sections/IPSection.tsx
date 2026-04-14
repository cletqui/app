import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { SectionCard, Row, NoData } from "@/components/SectionCard";
import { ipInfo, ipReverseDns, ipReputation, ipThreat } from "@/lib/api";
import type { IpInfo, IpReverseDns, IpReputation, UrlhausHostResult } from "@/lib/api";

function flag(cc: string) {
  return cc
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<{ loading: boolean; data: T | null; error: string | null }>({
    loading: true,
    data: null,
    error: null,
  });
  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, data: null, error: null });
    fn()
      .then((data) => { if (!cancelled) setState({ loading: false, data, error: null }); })
      .catch((e: Error) => { if (!cancelled) setState({ loading: false, data: null, error: e.message }); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

export function IPSection({ ip }: { ip: string }) {
  const info = useAsync(() => ipInfo(ip), [ip]);
  const rdns = useAsync(() => ipReverseDns(ip), [ip]);
  const rep = useAsync(() => ipReputation(ip), [ip]);
  const threat = useAsync(() => ipThreat(ip), [ip]);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <GeoCard state={info} />
      <RdnsCard state={rdns} />
      <ReputationCard state={rep} />
      <ThreatCard state={threat} />
    </div>
  );
}

function GeoCard({ state }: { state: { loading: boolean; data: IpInfo | null; error: string | null } }) {
  const d = state.data;
  return (
    <SectionCard title="Geolocation" source="ip-api.com" loading={state.loading} error={state.error}>
      {d && (
        <div className="space-y-0.5">
          <div className="mb-2 flex items-center gap-2">
            {d.countryCode && <span className="text-xl">{flag(d.countryCode)}</span>}
            <span className="text-sm font-medium">{d.city}{d.city && d.country ? ", " : ""}{d.country}</span>
          </div>
          <Row label="ISP">{d.isp || "—"}</Row>
          <Row label="Org">{d.org || "—"}</Row>
          <Row label="ASN">{d.as || "—"}</Row>
          <Row label="Timezone">{d.timezone || "—"}</Row>
          <div className="mt-2 flex flex-wrap gap-1">
            {d.hosting && <Badge variant="muted">Hosting</Badge>}
            {d.proxy && <Badge variant="warning">Proxy</Badge>}
            {d.mobile && <Badge variant="muted">Mobile</Badge>}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

function RdnsCard({ state }: { state: { loading: boolean; data: IpReverseDns | null; error: string | null } }) {
  const d = state.data;
  return (
    <SectionCard title="Reverse DNS" source="reversedns.io" loading={state.loading} error={state.error} skeletonRows={2}>
      {d && (
        d.reverse_dns?.length ? (
          <ul className="space-y-1">
            {d.reverse_dns.map((h) => (
              <li key={h} className="font-mono text-xs">{h}</li>
            ))}
          </ul>
        ) : <NoData message="No PTR records found" />
      )}
    </SectionCard>
  );
}

function ReputationCard({ state }: { state: { loading: boolean; data: IpReputation | null; error: string | null } }) {
  const d = state.data;
  return (
    <SectionCard title="Reputation" source="Spamhaus" loading={state.loading} error={state.error} skeletonRows={2}>
      {d && (
        d.results?.length ? (
          <div className="space-y-1">
            {d.results.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <Badge variant="destructive">{r.dataset}</Badge>
                <span className="font-mono text-xs text-muted-foreground">
                  since {new Date(r.listed * 1000).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : <div className="flex items-center gap-1.5"><Badge variant="success">Clean</Badge><span className="text-sm text-muted-foreground">Not listed in any blocklist</span></div>
      )}
    </SectionCard>
  );
}

function ThreatCard({ state }: { state: { loading: boolean; data: UrlhausHostResult | null; error: string | null } }) {
  const d = state.data;
  const found = d?.query_status === "ok";
  return (
    <SectionCard title="Threat Intel" source="URLhaus" loading={state.loading} error={state.error} skeletonRows={2}>
      {d && (
        found ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="destructive">Malicious</Badge>
              <span className="text-xs text-muted-foreground">{d.urls_count} URL{(d.urls_count ?? 0) > 1 ? "s" : ""}</span>
            </div>
            {d.blacklists && (
              <Row label="Spamhaus DBL">{d.blacklists.spamhaus_dbl}</Row>
            )}
            {d.urls?.slice(0, 3).map((u) => (
              <div key={u.id} className="rounded-md border border-border p-2 text-xs font-mono">
                <div className="flex items-center gap-1.5 mb-1">
                  <Badge variant={u.url_status === "online" ? "destructive" : "muted"} className="text-[10px]">
                    {u.url_status}
                  </Badge>
                  <span className="text-muted-foreground">{u.threat}</span>
                </div>
                <span className="break-all text-[11px]">{u.url}</span>
              </div>
            ))}
          </div>
        ) : <div className="flex items-center gap-1.5"><Badge variant="success">Clean</Badge><span className="text-sm text-muted-foreground">No URLhaus records</span></div>
      )}
    </SectionCard>
  );
}
