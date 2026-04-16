import { useAsync } from "@/hooks/useAsync";
import { SectionCard, CardGrid, Row, SubLabel, StatusRow, NoData, Tags } from "@/components/SectionCard";
import { ipInfo, ipReverseDns, ipShodan, ipWhois, ipReputation } from "@/lib/api";
import type { IpInfo, IpReverseDns, ShodanResult, IpWhois, IpReputation } from "@/lib/api";

function flag(cc: string) {
  return cc.toUpperCase().split("").map((c) =>
    String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)
  ).join("");
}

export function IPSection({ ip }: { ip: string }) {
  const info = useAsync(() => ipInfo(ip), [ip]);
  const rdns = useAsync(() => ipReverseDns(ip), [ip]);
  const shodan = useAsync(() => ipShodan(ip), [ip]);
  const whois = useAsync(() => ipWhois(ip), [ip]);
  const reputation = useAsync(() => ipReputation(ip), [ip]);

  return (
    <CardGrid>
      <GeoCard state={info} />
      <RdnsCard state={rdns} />
      <ShodanCard state={shodan} />
      <ReputationCard state={reputation} />
      <WhoisCard state={whois} />
    </CardGrid>
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
    <SectionCard title="Reverse DNS" source="Cloudflare DoH" loading={state.loading} error={state.error} skeletonRows={2}>
      {d && (
        d.reverse_dns?.length
          ? <ul className="space-y-0.5">{d.reverse_dns.map((h) => <li key={h} className="text-xs">{h}</li>)}</ul>
          : <NoData message="No PTR records" />
      )}
    </SectionCard>
  );
}

function ShodanCard({ state }: { state: ReturnType<typeof useAsync<ShodanResult | null>> }) {
  const d = state.data;
  return (
    <SectionCard title="Ports & Vulns" source="Shodan" loading={state.loading} error={state.error} skeletonRows={3} expandable>
      {state.data !== undefined && (
        d ? (
          <div>
            {d.ports.length > 0 && (
              <div className="mb-1.5">
                <SubLabel>Open ports</SubLabel>
                <p className="text-xs">{d.ports.join(", ")}</p>
              </div>
            )}
            {d.hostnames.length > 0 && (
              <div className="mb-1.5">
                <SubLabel>Hostnames</SubLabel>
                {d.hostnames.map((h) => <p key={h} className="text-xs">{h}</p>)}
              </div>
            )}
            {d.vulns.length > 0 && (
              <div className="mb-1.5">
                <SubLabel>CVEs</SubLabel>
                {d.vulns.map((v) => <p key={v} className="text-xs text-destructive">{v}</p>)}
              </div>
            )}
            <Tags tags={d.tags} />
            {d.ports.length === 0 && d.vulns.length === 0 && d.hostnames.length === 0 && (
              <StatusRow ok={true} yes="No notable exposure" no="" />
            )}
          </div>
        ) : <NoData message="No Shodan data for this IP" />
      )}
    </SectionCard>
  );
}

function ReputationCard({ state }: { state: ReturnType<typeof useAsync<IpReputation>> }) {
  const d = state.data;
  return (
    <SectionCard title="Reputation" source="StopForumSpam" loading={state.loading} error={state.error} skeletonRows={3}>
      {d && (
        <div>
          <StatusRow ok={!d.appears} yes="Clean" no="Listed as spam source" />
          {d.appears && (
            <>
              <Row label="Reports" value={String(d.frequency)} />
              {d.confidence !== null && <Row label="Confidence" value={`${d.confidence}%`} />}
              {d.lastseen && <Row label="Last seen" value={d.lastseen} />}
            </>
          )}
          <Tags tags={[d.torexit ? "tor-exit" : ""].filter(Boolean)} />
        </div>
      )}
    </SectionCard>
  );
}

function WhoisCard({ state }: { state: ReturnType<typeof useAsync<IpWhois>> }) {
  const d = state.data;
  const priority = ["inetnum", "inet6num", "netrange", "cidr", "netname", "country", "org", "orgname", "descr", "owner"];
  const sorted = d
    ? [
        ...priority.map((k) => d.records.find((r) => r.key.toLowerCase() === k)).filter(Boolean),
        ...d.records.filter((r) => !priority.includes(r.key.toLowerCase())),
      ] as { key: string; value: string }[]
    : [];

  return (
    <SectionCard title="WHOIS" source="RIPEstat" loading={state.loading} error={state.error} skeletonRows={5} expandable>
      {d && (
        sorted.length
          ? <div className="space-y-0.5">
              {sorted.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="w-20 shrink-0 text-muted-foreground">{r.key}</span>
                  <span className="break-all">{r.value}</span>
                </div>
              ))}
            </div>
          : <NoData message="No WHOIS data" />
      )}
    </SectionCard>
  );
}
