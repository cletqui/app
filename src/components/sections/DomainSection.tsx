import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionCard, Row, NoData } from "@/components/SectionCard";
import {
  domainWhois, domainNslookup, domainCerts,
  domainReputation, domainMailSecurity, domainThreat,
} from "@/lib/api";
import type {
  WhoisResult, NslookupResult, CertEntry,
  DomainReputation, MailSecurity, UrlhausHostResult,
} from "@/lib/api";

function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<{ loading: boolean; data: T | null; error: string | null }>({
    loading: true, data: null, error: null,
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

export function DomainSection({ domain }: { domain: string }) {
  const whois = useAsync(() => domainWhois(domain), [domain]);
  const dns = useAsync(() => domainNslookup(domain), [domain]);
  const certs = useAsync(() => domainCerts(domain), [domain]);
  const rep = useAsync(() => domainReputation(domain), [domain]);
  const mail = useAsync(() => domainMailSecurity(domain), [domain]);
  const threat = useAsync(() => domainThreat(domain), [domain]);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <WhoisCard state={whois} />
      <DnsCard state={dns} />
      <CertsCard state={certs} />
      <ReputationCard state={rep} />
      <MailCard state={mail} />
      <ThreatCard state={threat} />
    </div>
  );
}

function WhoisCard({ state }: { state: { loading: boolean; data: WhoisResult | null; error: string | null } }) {
  const d = state.data;
  const registrar = d?.entities?.find((e) => e.roles.includes("registrar"))?.handle;
  const created = d?.events?.find((e) => e.eventAction === "registration")?.eventDate;
  const expires = d?.events?.find((e) => e.eventAction === "expiration")?.eventDate;
  const updated = d?.events?.find((e) => e.eventAction === "last changed")?.eventDate;
  return (
    <SectionCard title="WHOIS" source="rdap.org" loading={state.loading} error={state.error}>
      {d && (
        <div className="space-y-0.5">
          {registrar && <Row label="Registrar">{registrar}</Row>}
          {created && <Row label="Created">{new Date(created).toLocaleDateString()}</Row>}
          {expires && <Row label="Expires">{new Date(expires).toLocaleDateString()}</Row>}
          {updated && <Row label="Updated">{new Date(updated).toLocaleDateString()}</Row>}
          {d.status?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {d.status.slice(0, 4).map((s) => <Badge key={s} variant="muted" className="text-[10px]">{s}</Badge>)}
            </div>
          )}
          {d.nameservers?.length ? (
            <div className="mt-2">
              <p className="mb-1 text-xs text-muted-foreground">Nameservers</p>
              {d.nameservers.slice(0, 4).map((ns) => (
                <div key={ns.ldhName} className="font-mono text-xs">{ns.ldhName.toLowerCase()}</div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </SectionCard>
  );
}

const DNS_TYPE: Record<number, string> = { 1: "A", 28: "AAAA", 5: "CNAME", 15: "MX", 2: "NS", 16: "TXT" };

function DnsCard({ state }: { state: { loading: boolean; data: NslookupResult | null; error: string | null } }) {
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
              <Badge variant="outline" className="mt-0.5 w-12 shrink-0 justify-center font-mono text-[10px]">{r.type}</Badge>
              <span className="font-mono break-all text-[11px]">{r.data}</span>
            </div>
          ))}
        </div>
      ) : <NoData message="No records found" />}
    </SectionCard>
  );
}

function CertsCard({ state }: { state: { loading: boolean; data: CertEntry[] | null; error: string | null } }) {
  const d = state.data;
  return (
    <SectionCard title="Certificates" source="crt.sh" loading={state.loading} error={state.error} skeletonRows={4}>
      {d && (d.length ? (
        <div className="space-y-2">
          {d.slice(0, 5).map((c) => (
            <div key={c.id} className="rounded-md border border-border p-2 text-xs">
              <div className="mb-1 font-mono font-medium">{c.common_name}</div>
              <div className="text-muted-foreground">{c.issuer_name?.split("O=")[1]?.split(",")[0] ?? c.issuer_name}</div>
              <div className="mt-1 text-muted-foreground">
                {new Date(c.not_before).toLocaleDateString()} → {new Date(c.not_after).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      ) : <NoData message="No certificates found" />)}
    </SectionCard>
  );
}

function ReputationCard({ state }: { state: { loading: boolean; data: DomainReputation | null; error: string | null } }) {
  const d = state.data;
  const score = d?.score ?? 0;
  const scoreVariant = score > 70 ? "destructive" : score > 30 ? "warning" : "success";
  return (
    <SectionCard title="Reputation" source="Spamhaus" loading={state.loading} error={state.error} skeletonRows={3}>
      {d && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={scoreVariant}>{score.toFixed(1)} / 100</Badge>
            {d.abused && <Badge variant="destructive">Abused</Badge>}
          </div>
          {d.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {d.tags.map((t) => <Badge key={t} variant="muted">{t}</Badge>)}
            </div>
          )}
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(d.dimensions ?? {}).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1.5 text-xs">
                <span className="capitalize text-muted-foreground">{k}</span>
                <span className="font-mono">{(v as number).toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

const SPF_VARIANT: Record<string, "success" | "warning" | "destructive" | "muted"> = {
  pass: "success", softfail: "warning", fail: "destructive", neutral: "muted", none: "muted",
};
const DMARC_VARIANT: Record<string, "success" | "warning" | "destructive"> = {
  reject: "success", quarantine: "warning", none: "destructive",
};

function MailCard({ state }: { state: { loading: boolean; data: MailSecurity | null; error: string | null } }) {
  const d = state.data;
  return (
    <SectionCard title="Mail Security" source="DoH" loading={state.loading} error={state.error} skeletonRows={4}>
      {d && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground w-14">SPF</span>
            {d.spf.valid ? (
              <Badge variant={SPF_VARIANT[d.spf.policy ?? "none"] ?? "muted"}>{d.spf.policy ?? "present"}</Badge>
            ) : <Badge variant="muted">none</Badge>}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground w-14">DMARC</span>
            {d.dmarc.valid ? (
              <>
                <Badge variant={DMARC_VARIANT[d.dmarc.policy ?? "none"] ?? "muted"}>p={d.dmarc.policy}</Badge>
                {d.dmarc.pct !== null && d.dmarc.pct < 100 && (
                  <Badge variant="warning">{d.dmarc.pct}%</Badge>
                )}
              </>
            ) : <Badge variant="muted">none</Badge>}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground w-14">DKIM</span>
            <Badge variant={d.dkim.valid ? "success" : "muted"}>{d.dkim.valid ? `${d.dkim.selector}` : "not found"}</Badge>
          </div>
          {d.mx?.length > 0 && (
            <div>
              <p className="mb-1 text-xs text-muted-foreground">MX Records</p>
              {d.mx.slice(0, 3).map((mx) => (
                <div key={mx.exchange} className="font-mono text-xs">
                  {mx.priority} {mx.exchange}
                </div>
              ))}
            </div>
          )}
        </div>
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
              <span className="text-xs text-muted-foreground">{d.urls_count} URL{(d.urls_count ?? 0) !== 1 ? "s" : ""}</span>
              {d.urlhaus_reference && (
                <a href={d.urlhaus_reference} target="_blank" rel="noopener noreferrer" className="ml-auto text-muted-foreground hover:text-foreground">
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            {d.urls?.slice(0, 3).map((u) => (
              <div key={u.id} className="rounded-md border border-border p-2 text-xs">
                <div className="flex items-center gap-1.5 mb-1">
                  <Badge variant={u.url_status === "online" ? "destructive" : "muted"} className="text-[10px]">{u.url_status}</Badge>
                  <span className="text-muted-foreground">{u.threat}</span>
                </div>
                <span className="break-all font-mono text-[11px]">{u.url}</span>
              </div>
            ))}
          </div>
        ) : <div className="flex items-center gap-1.5"><Badge variant="success">Clean</Badge><span className="text-sm text-muted-foreground">No URLhaus records</span></div>
      )}
    </SectionCard>
  );
}
