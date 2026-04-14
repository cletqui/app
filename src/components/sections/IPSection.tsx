import { useAsync } from "@/hooks/useAsync";
import { SectionCard, Row, StatusRow, NoData, Tags } from "@/components/SectionCard";
import { ipInfo, ipReverseDns, ipReputation, ipThreat } from "@/lib/api";
import type { IpInfo, IpReverseDns, IpReputation, UrlhausHostResult } from "@/lib/api";

function flag(cc: string) {
  return cc.toUpperCase().split("").map((c) =>
    String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)
  ).join("");
}

export function IPSection({ ip }: { ip: string }) {
  const info = useAsync(() => ipInfo(ip), [ip]);
  const rdns = useAsync(() => ipReverseDns(ip), [ip]);
  const rep = useAsync(() => ipReputation(ip), [ip]);
  const threat = useAsync(() => ipThreat(ip), [ip]);

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <GeoCard state={info} />
      <RdnsCard state={rdns} />
      <ReputationCard state={rep} />
      <ThreatCard state={threat} />
    </div>
  );
}

function GeoCard({ state }: { state: ReturnType<typeof useAsync<IpInfo>> }) {
  const d = state.data;
  return (
    <SectionCard title="Geolocation" source="ip-api.com" loading={state.loading} error={state.error}>
      {d && (
        <div>
          <div className="mb-1.5 flex items-center gap-1.5">
            {d.countryCode && <span>{flag(d.countryCode)}</span>}
            <span className="text-xs">{[d.city, d.regionName, d.country].filter(Boolean).join(", ")}</span>
          </div>
          <Row label="ISP" value={d.isp || "—"} />
          <Row label="Org" value={d.org || "—"} />
          <Row label="ASN" value={d.as || "—"} />
          <Row label="Timezone" value={d.timezone || "—"} />
          <Tags tags={[d.hosting ? "hosting" : "", d.proxy ? "proxy" : "", d.mobile ? "mobile" : ""].filter(Boolean)} />
        </div>
      )}
    </SectionCard>
  );
}

function RdnsCard({ state }: { state: ReturnType<typeof useAsync<IpReverseDns>> }) {
  const d = state.data;
  return (
    <SectionCard title="Reverse DNS" source="reversedns.io" loading={state.loading} error={state.error} skeletonRows={2}>
      {d && (
        d.reverse_dns?.length
          ? <ul className="space-y-0.5">{d.reverse_dns.map((h) => <li key={h} className="text-xs">{h}</li>)}</ul>
          : <NoData message="No PTR records" />
      )}
    </SectionCard>
  );
}

function ReputationCard({ state }: { state: ReturnType<typeof useAsync<IpReputation>> }) {
  const d = state.data;
  return (
    <SectionCard title="Reputation" source="Spamhaus" loading={state.loading} error={state.error} skeletonRows={2}>
      {d && (
        d.results?.length
          ? <div className="space-y-1">
              {d.results.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-destructive">● {r.dataset}</span>
                  <span className="text-muted-foreground">since {new Date(r.listed * 1000).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          : <StatusRow ok={true} yes="Not listed in any blocklist" no="" />
      )}
    </SectionCard>
  );
}

function ThreatCard({ state }: { state: ReturnType<typeof useAsync<UrlhausHostResult>> }) {
  const d = state.data;
  const found = d?.query_status === "ok";
  return (
    <SectionCard title="Threat Intel" source="URLhaus" loading={state.loading} error={state.error} skeletonRows={2}>
      {d && (
        found
          ? <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-destructive text-xs">● Malicious</span>
                <span className="text-xs text-muted-foreground">{d.urls_count} URL{(d.urls_count ?? 0) !== 1 ? "s" : ""}</span>
              </div>
              {d.blacklists && <Row label="Spamhaus DBL" value={d.blacklists.spamhaus_dbl} />}
              {d.urls?.slice(0, 3).map((u) => (
                <div key={u.id} className="rounded border border-border p-1.5 text-xs">
                  <div className="mb-0.5 flex items-center gap-1.5">
                    <span className={u.url_status === "online" ? "text-destructive" : "text-muted-foreground"}>
                      {u.url_status}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{u.threat}</span>
                  </div>
                  <span className="break-all">{u.url}</span>
                </div>
              ))}
            </div>
          : <StatusRow ok={true} yes="No URLhaus records" no="" />
      )}
    </SectionCard>
  );
}
