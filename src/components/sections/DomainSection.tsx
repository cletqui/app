import { useAsync } from "@/hooks/useAsync";
import { SectionCard, Row, NoData, Tags } from "@/components/SectionCard";
import {
  domainWhois, domainNslookup, domainCerts, domainMailSecurity,
} from "@/lib/api";
import type { DomainWhois, NslookupResult, CertEntry, MailSecurity } from "@/lib/api";

export function DomainSection({ domain }: { domain: string }) {
  const whois = useAsync(() => domainWhois(domain), [domain]);
  const dns = useAsync(() => domainNslookup(domain), [domain]);
  const certs = useAsync(() => domainCerts(domain), [domain]);
  const mail = useAsync(() => domainMailSecurity(domain), [domain]);

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <WhoisCard state={whois} />
      <DnsCard state={dns} />
      <CertsCard state={certs} />
      <MailCard state={mail} />
    </div>
  );
}

function WhoisCard({ state }: { state: ReturnType<typeof useAsync<DomainWhois>> }) {
  const d = state.data;
  return (
    <SectionCard title="WHOIS" source="IANA RDAP" loading={state.loading} error={state.error}>
      {d && (
        <div>
          {d.registrar && <Row label="Registrar" value={d.registrar} />}
          {d.registered && <Row label="Created" value={new Date(d.registered).toLocaleDateString()} />}
          {d.expires && <Row label="Expires" value={new Date(d.expires).toLocaleDateString()} />}
          {d.updated && <Row label="Updated" value={new Date(d.updated).toLocaleDateString()} />}
          {d.nameservers.length > 0 && (
            <div className="mt-1.5">
              <p className="mb-0.5 text-[10px] text-muted-foreground">Nameservers</p>
              {d.nameservers.slice(0, 4).map((ns) => (
                <p key={ns} className="text-xs">{ns}</p>
              ))}
            </div>
          )}
          <Tags tags={d.status.slice(0, 4)} />
        </div>
      )}
    </SectionCard>
  );
}

function DnsCard({ state }: { state: ReturnType<typeof useAsync<NslookupResult>> }) {
  const d = state.data;
  if (!d) return <SectionCard title="DNS Records" source="Cloudflare DoH" loading={state.loading} error={state.error} />;

  const records = [
    ...(d.A ?? []).map((r) => ({ type: "A", data: r.data })),
    ...(d.AAAA ?? []).map((r) => ({ type: "AAAA", data: r.data })),
    ...(d.CNAME ?? []).map((r) => ({ type: "CNAME", data: r.data })),
    ...(d.MX ?? []).map((r) => ({ type: "MX", data: r.data })),
    ...(d.NS ?? []).map((r) => ({ type: "NS", data: r.data })),
    ...(d.TXT ?? []).map((r) => ({ type: "TXT", data: r.data.replace(/^"|"$/g, "") })),
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
          {d.slice(0, 6).map((c) => (
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
