import { ExternalLink } from "lucide-react";
import { useAsync } from "@/hooks/useAsync";
import { SectionCard, Row, StatusRow, NoData, Tags } from "@/components/SectionCard";
import {
  domainWhois, domainNslookup, domainCerts,
  domainReputation, domainMailSecurity, domainThreat,
} from "@/lib/api";
import type {
  WhoisResult, NslookupResult, CertEntry,
  DomainReputation, MailSecurity, UrlhausHostResult,
} from "@/lib/api";

export function DomainSection({ domain }: { domain: string }) {
  const whois = useAsync(() => domainWhois(domain), [domain]);
  const dns = useAsync(() => domainNslookup(domain), [domain]);
  const certs = useAsync(() => domainCerts(domain), [domain]);
  const rep = useAsync(() => domainReputation(domain), [domain]);
  const mail = useAsync(() => domainMailSecurity(domain), [domain]);
  const threat = useAsync(() => domainThreat(domain), [domain]);

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      <WhoisCard state={whois} />
      <DnsCard state={dns} />
      <CertsCard state={certs} />
      <ReputationCard state={rep} />
      <MailCard state={mail} />
      <ThreatCard state={threat} />
    </div>
  );
}

function WhoisCard({ state }: { state: ReturnType<typeof useAsync<WhoisResult>> }) {
  const d = state.data;
  const registrar = d?.entities?.find((e) => e.roles.includes("registrar"))?.handle;
  const created = d?.events?.find((e) => e.eventAction === "registration")?.eventDate;
  const expires = d?.events?.find((e) => e.eventAction === "expiration")?.eventDate;
  const updated = d?.events?.find((e) => e.eventAction === "last changed")?.eventDate;
  return (
    <SectionCard title="WHOIS" source="rdap.org" loading={state.loading} error={state.error}>
      {d && (
        <div>
          {registrar && <Row label="Registrar" value={registrar} />}
          {created && <Row label="Created" value={new Date(created).toLocaleDateString()} />}
          {expires && <Row label="Expires" value={new Date(expires).toLocaleDateString()} />}
          {updated && <Row label="Updated" value={new Date(updated).toLocaleDateString()} />}
          {(d.nameservers?.length ?? 0) > 0 && (
            <div className="mt-1.5">
              <p className="mb-0.5 text-[10px] text-muted-foreground">Nameservers</p>
              {d.nameservers?.slice(0, 4).map((ns) => (
                <div key={ns.ldhName} className="text-xs">{ns.ldhName.toLowerCase()}</div>
              ))}
            </div>
          )}
          <Tags tags={d.status?.slice(0, 4) ?? []} />
        </div>
      )}
    </SectionCard>
  );
}

function DnsCard({ state }: { state: ReturnType<typeof useAsync<NslookupResult>> }) {
  const d = state.data;
  if (!d) return <SectionCard title="DNS Records" source="Cloudflare DoH" loading={state.loading} error={state.error} />;

  const records = [
    ...d.A.map((r) => ({ type: "A", data: r.data })),
    ...d.AAAA.map((r) => ({ type: "AAAA", data: r.data })),
    ...d.CNAME.map((r) => ({ type: "CNAME", data: r.data })),
    ...d.MX.map((r) => ({ type: "MX", data: r.data })),
    ...d.NS.map((r) => ({ type: "NS", data: r.data })),
    ...d.TXT.map((r) => ({ type: "TXT", data: r.data.replace(/^"|"$/g, "") })),
  ];

  return (
    <SectionCard title="DNS Records" source="Cloudflare DoH" loading={state.loading} error={state.error} skeletonRows={5}>
      {records.length ? (
        <div className="space-y-1">
          {records.slice(0, 12).map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="w-10 shrink-0 text-muted-foreground">{r.type}</span>
              <span className="break-all">{r.data}</span>
            </div>
          ))}
        </div>
      ) : <NoData message="No records found" />}
    </SectionCard>
  );
}

function CertsCard({ state }: { state: ReturnType<typeof useAsync<CertEntry[]>> }) {
  const d = state.data;
  return (
    <SectionCard title="Certificates" source="crt.sh" loading={state.loading} error={state.error} skeletonRows={4}>
      {d && (d.length ? (
        <div className="space-y-1.5">
          {d.slice(0, 5).map((c) => (
            <div key={c.id} className="rounded border border-border p-1.5 text-xs">
              <div className="mb-0.5 font-medium">{c.common_name}</div>
              <div className="text-muted-foreground">{c.issuer_name?.split("O=")[1]?.split(",")[0] ?? c.issuer_name}</div>
              <div className="mt-0.5 text-muted-foreground">
                {new Date(c.not_before).toLocaleDateString()} → {new Date(c.not_after).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      ) : <NoData message="No certificates found" />)}
    </SectionCard>
  );
}

function ReputationCard({ state }: { state: ReturnType<typeof useAsync<DomainReputation>> }) {
  const d = state.data;
  const score = d?.score ?? 0;
  const scoreColor = score > 70 ? "text-destructive" : score > 30 ? "text-warning" : "text-success";
  return (
    <SectionCard title="Reputation" source="Spamhaus" loading={state.loading} error={state.error} skeletonRows={3}>
      {d && (
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className={`text-xs font-medium ${scoreColor}`}>{score.toFixed(1)} / 100</span>
            {d.abused && <span className="text-xs text-destructive">● Abused</span>}
          </div>
          {Object.entries(d.dimensions ?? {}).map(([k, v]) => (
            <Row key={k} label={k} value={(v as number).toFixed(1)} />
          ))}
          <Tags tags={d.tags ?? []} />
        </div>
      )}
    </SectionCard>
  );
}

function MailCard({ state }: { state: ReturnType<typeof useAsync<MailSecurity>> }) {
  const d = state.data;
  const spfColor = (p?: string | null) =>
    p === "pass" ? "text-success" : p === "softfail" ? "text-warning" : p === "fail" ? "text-destructive" : "text-muted-foreground";
  const dmarcColor = (p?: string | null) =>
    p === "reject" ? "text-success" : p === "quarantine" ? "text-warning" : "text-destructive";
  return (
    <SectionCard title="Mail Security" source="DoH" loading={state.loading} error={state.error} skeletonRows={4}>
      {d && (
        <div>
          <div className="flex items-center gap-2 py-px text-xs">
            <span className="w-14 shrink-0 text-muted-foreground">SPF</span>
            <span className={spfColor(d.spf.policy)}>● {d.spf.valid ? (d.spf.policy ?? "present") : "none"}</span>
          </div>
          <div className="flex items-center gap-2 py-px text-xs">
            <span className="w-14 shrink-0 text-muted-foreground">DMARC</span>
            <span className={dmarcColor(d.dmarc.policy)}>
              ● {d.dmarc.valid ? `p=${d.dmarc.policy}` : "none"}
            </span>
            {d.dmarc.pct !== null && d.dmarc.pct < 100 && (
              <span className="text-warning text-[10px]">{d.dmarc.pct}%</span>
            )}
          </div>
          <div className="flex items-center gap-2 py-px text-xs">
            <span className="w-14 shrink-0 text-muted-foreground">DKIM</span>
            <span className={d.dkim.valid ? "text-success" : "text-muted-foreground"}>
              ● {d.dkim.valid ? d.dkim.selector : "not found"}
            </span>
          </div>
          {d.mx?.length > 0 && (
            <div className="mt-1.5">
              <p className="mb-0.5 text-[10px] text-muted-foreground">MX Records</p>
              {d.mx.slice(0, 3).map((mx) => (
                <div key={mx.exchange} className="text-xs">{mx.priority} {mx.exchange}</div>
              ))}
            </div>
          )}
        </div>
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
                {d.urlhaus_reference && (
                  <a href={d.urlhaus_reference} target="_blank" rel="noopener noreferrer" className="ml-auto text-muted-foreground hover:text-foreground">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              {d.urls?.slice(0, 3).map((u) => (
                <div key={u.id} className="rounded border border-border p-1.5 text-xs">
                  <div className="mb-0.5 flex items-center gap-1.5">
                    <span className={u.url_status === "online" ? "text-destructive" : "text-muted-foreground"}>{u.url_status}</span>
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
