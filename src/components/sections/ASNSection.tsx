import { useAsync } from "@/hooks/useAsync";
import { SectionCard, Row, NoData } from "@/components/SectionCard";
import { asnInfo, asnPrefixes } from "@/lib/api";
import type { AsnInfo, AsnPrefixes } from "@/lib/api";

export function ASNSection({ asn }: { asn: string }) {
  const info = useAsync(() => asnInfo(asn).then((r) => r.data), [asn]);
  const prefixes = useAsync(() => asnPrefixes(asn).then((r) => r.data), [asn]);

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <ASNInfoCard state={info} />
      <PrefixesCard state={prefixes} />
    </div>
  );
}

function ASNInfoCard({ state }: { state: ReturnType<typeof useAsync<AsnInfo>> }) {
  const d = state.data;
  return (
    <SectionCard title="ASN Info" source="BGPView" loading={state.loading} error={state.error}>
      {d && (
        <div>
          <Row label="ASN" value={`AS${d.asn}`} />
          <Row label="Name" value={d.name} />
          <Row label="Description" value={d.description_short} />
          <Row label="Country" value={d.country_code || "—"} />
          {d.website && <Row label="Website" value={d.website.replace(/^https?:\/\//, "")} />}
          <Row label="RIR" value={d.rir_allocation.rir_name} />
          {d.rir_allocation.date_allocated && (
            <Row label="Allocated" value={new Date(d.rir_allocation.date_allocated).toLocaleDateString()} />
          )}
          {d.abuse_contacts?.length > 0 && (
            <Row label="Abuse" value={d.abuse_contacts.join(", ")} />
          )}
        </div>
      )}
    </SectionCard>
  );
}

function PrefixesCard({ state }: { state: ReturnType<typeof useAsync<AsnPrefixes>> }) {
  const d = state.data;
  const v4 = d?.ipv4_prefixes ?? [];
  const v6 = d?.ipv6_prefixes ?? [];

  return (
    <SectionCard title="Prefixes" source="BGPView" loading={state.loading} error={state.error} skeletonRows={6}>
      {d && (
        v4.length === 0 && v6.length === 0
          ? <NoData message="No prefixes found" />
          : <div className="space-y-2">
              {v4.length > 0 && (
                <div>
                  <p className="mb-1 text-[10px] text-muted-foreground">IPv4 · {v4.length} prefix{v4.length !== 1 ? "es" : ""}</p>
                  <div className="space-y-0.5">
                    {v4.slice(0, 8).map((p) => (
                      <div key={p.prefix} className="flex items-start gap-2 text-xs">
                        <span className="w-32 shrink-0">{p.prefix}</span>
                        <span className="text-muted-foreground">{p.name}</span>
                      </div>
                    ))}
                    {v4.length > 8 && <p className="text-xs text-muted-foreground">+{v4.length - 8} more</p>}
                  </div>
                </div>
              )}
              {v6.length > 0 && (
                <div>
                  <p className="mb-1 text-[10px] text-muted-foreground">IPv6 · {v6.length} prefix{v6.length !== 1 ? "es" : ""}</p>
                  <div className="space-y-0.5">
                    {v6.slice(0, 4).map((p) => (
                      <div key={p.prefix} className="flex items-start gap-2 text-xs">
                        <span className="w-40 shrink-0">{p.prefix}</span>
                        <span className="text-muted-foreground">{p.name}</span>
                      </div>
                    ))}
                    {v6.length > 4 && <p className="text-xs text-muted-foreground">+{v6.length - 4} more</p>}
                  </div>
                </div>
              )}
            </div>
      )}
    </SectionCard>
  );
}
