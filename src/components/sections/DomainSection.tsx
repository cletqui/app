import { useAsync } from "@/hooks/useAsync";
import { SectionCard, CardGrid, Row, SubLabel, NoData, Tags, RiskBadge, type RiskLevel } from "@/components/SectionCard";
import { domainWhois, domainNslookup, domainCerts, domainMailSecurity } from "@/lib/api";
import type { DomainWhois, NslookupResult, CertEntry, MailSecurity } from "@/lib/api";

// ── Risk ───────────────────────────────────────────────────────────────────

function computeRisk(mail: MailSecurity | null | undefined): RiskLevel | null {
  if (!mail) return null;
  if (!mail.spf.valid && !mail.dmarc.valid) return "malicious";
  if (!mail.dmarc.valid || mail.dmarc.policy === "none" || !mail.dkim.valid || !mail.spf.valid) return "warning";
  return "clean";
}

// ── DNS propagation ────────────────────────────────────────────────────────

const DOH_RESOLVERS = [
  { name: "Cloudflare", url: "https://cloudflare-dns.com/dns-query" },
  { name: "Google", url: "https://dns.google/resolve" },
  { name: "Quad9", url: "https://dns.quad9.net/dns-query" },
];

interface PropagationRow {
  resolver: string;
  records: string[];
}

async function checkPropagation(domain: string): Promise<PropagationRow[]> {
  return Promise.all(
    DOH_RESOLVERS.map(async (r) => {
      try {
        const res = await fetch(
          `${r.url}?name=${encodeURIComponent(domain)}&type=A`,
          { headers: { Accept: "application/dns-json" } }
        );
        const data = await res.json() as { Answer?: { type: number; data: string }[] };
        const records = data.Answer?.filter((a) => a.type === 1).map((a) => a.data) ?? [];
        return { resolver: r.name, records };
      } catch {
        return { resolver: r.name, records: [] };
      }
    })
  );
}

// ── Section ────────────────────────────────────────────────────────────────

export function DomainSection({ domain }: { domain: string }) {
  const whois = useAsync(() => domainWhois(domain), [domain]);
  const dns = useAsync(() => domainNslookup(domain), [domain]);
  const certs = useAsync(() => domainCerts(domain), [domain]);
  const mail = useAsync(() => domainMailSecurity(domain), [domain]);
  const propagation = useAsync(() => checkPropagation(domain), [domain]);

  const risk = computeRisk(mail.data);

  return (
    <div className="space-y-2">
      {risk && <RiskBadge level={risk} />}
      <CardGrid>
        <WhoisCard state={whois} />
        <DnsCard state={dns} />
        <CertsCard state={certs} />
        <MailCard state={mail} />
        <PropagationCard state={propagation} domain={domain} />
      </CardGrid>
    </div>
  );
}

// ── Sub-cards ──────────────────────────────────────────────────────────────

function WhoisCard({ state }: { state: ReturnType<typeof useAsync<DomainWhois>> }) {
  const d = state.data;
  return (
    <SectionCard title="WHOIS" source="IANA RDAP" loading={state.loading} error={state.error} expandable>
      {d && (
        <div>
          {d.registrar && <Row label="Registrar" value={d.registrar} />}
          {d.registered && <Row label="Created" value={new Date(d.registered).toLocaleDateString()} />}
          {d.expires && <Row label="Expires" value={new Date(d.expires).toLocaleDateString()} />}
          {d.updated && <Row label="Updated" value={new Date(d.updated).toLocaleDateString()} />}
          {d.nameservers.length > 0 && (
            <div className="mt-1.5">
              <SubLabel>Nameservers</SubLabel>
              {d.nameservers.map((ns) => <p key={ns} className="text-xs">{ns}</p>)}
            </div>
          )}
          <Tags tags={d.status} />
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
    <SectionCard title="DNS Records" source="Cloudflare DoH" loading={state.loading} error={state.error} skeletonRows={5} expandable>
      {records.length ? (
        <div className="space-y-1">
          {records.map((r, i) => (
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
    <SectionCard title="Certificates" source="crt.sh" loading={state.loading} error={state.error} skeletonRows={4} expandable>
      {d && (d.length ? (
        <div className="space-y-1.5">
          {d.map((c) => (
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

const spfColor = (p?: string | null) =>
  p === "pass" ? "text-success" : p === "softfail" ? "text-warning" : p === "fail" ? "text-destructive" : "text-muted-foreground";
const dmarcColor = (p?: string | null) =>
  p === "reject" ? "text-success" : p === "quarantine" ? "text-warning" : "text-destructive";

function MailCard({ state }: { state: ReturnType<typeof useAsync<MailSecurity>> }) {
  const d = state.data;
  return (
    <SectionCard title="Mail Security" source="DoH" loading={state.loading} error={state.error} skeletonRows={4} expandable>
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
              <span className="text-[10px] text-warning">{d.dmarc.pct}%</span>
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
              <SubLabel>MX Records</SubLabel>
              {d.mx.map((mx) => (
                <div key={mx.exchange} className="text-xs">{mx.priority} {mx.exchange}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

function PropagationCard({ state, domain }: { state: ReturnType<typeof useAsync<PropagationRow[]>>; domain: string }) {
  const d = state.data;

  const allRecords = d ? d.flatMap((r) => r.records) : [];
  const uniqueRecords = [...new Set(allRecords)];
  const propagated = d && uniqueRecords.length <= 1 && d.every((r) => r.records.length > 0);
  const diverged = d && uniqueRecords.length > 1;

  return (
    <SectionCard title="DNS Propagation" source="Cloudflare · Google · Quad9" loading={state.loading} error={state.error} skeletonRows={3}>
      {d && (
        <div className="space-y-1.5">
          <div className="text-xs">
            {propagated
              ? <span className="text-success">● Propagated ({uniqueRecords[0] ?? "NXDOMAIN"})</span>
              : diverged
              ? <span className="text-warning">● Diverged — resolvers disagree</span>
              : <span className="text-muted-foreground">● No A records found</span>}
          </div>
          <div className="space-y-0.5">
            {d.map((r) => (
              <div key={r.resolver} className="flex items-start gap-2 text-xs">
                <span className="w-20 shrink-0 text-muted-foreground">{r.resolver}</span>
                <span className={r.records.length ? "break-all" : "text-muted-foreground"}>
                  {r.records.length ? r.records.join(", ") : "no result"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}
