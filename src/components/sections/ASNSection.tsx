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
    <SectionCard title="ASN Info" source="RIPEstat" loading={state.loading} error={state.error}>
      {d && (
        <div>
          <Row label="ASN" value={`AS${d.asn}`} />
          <Row label="Holder" value={d.holder} />
          <Row label="Type" value={d.type.replace(/_/g, " ")} />
          <Row label="Announced" value={d.announced ? "Yes" : "No"} />
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
    <SectionCard title="Prefixes" source="RIPEstat" loading={state.loading} error={state.error} skeletonRows={6}>
      {d && (
        v4.length === 0 && v6.length === 0
          ? <NoData message="No prefixes announced" />
          : <div className="space-y-2">
              {v4.length > 0 && (
                <div>
                  <p className="mb-1 text-[10px] text-muted-foreground">IPv4 · {v4.length} prefix{v4.length !== 1 ? "es" : ""}</p>
                  <div className="space-y-0.5">
                    {v4.slice(0, 10).map((p) => (
                      <p key={p.prefix} className="text-xs">{p.prefix}</p>
                    ))}
                    {v4.length > 10 && <p className="text-xs text-muted-foreground">+{v4.length - 10} more</p>}
                  </div>
                </div>
              )}
              {v6.length > 0 && (
                <div>
                  <p className="mb-1 text-[10px] text-muted-foreground">IPv6 · {v6.length} prefix{v6.length !== 1 ? "es" : ""}</p>
                  <div className="space-y-0.5">
                    {v6.slice(0, 5).map((p) => (
                      <p key={p.prefix} className="text-xs">{p.prefix}</p>
                    ))}
                    {v6.length > 5 && <p className="text-xs text-muted-foreground">+{v6.length - 5} more</p>}
                  </div>
                </div>
              )}
            </div>
      )}
    </SectionCard>
  );
}
