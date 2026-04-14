import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionCard, Row } from "@/components/SectionCard";
import { asnInfo, asnPrefixes } from "@/lib/api";
import type { AsnInfo, AsnPrefixes } from "@/lib/api";

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

export function ASNSection({ asn }: { asn: string }) {
  const info = useAsync(() => asnInfo(asn).then((r) => r.data), [asn]);
  const prefixes = useAsync(() => asnPrefixes(asn).then((r) => r.data), [asn]);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <ASNInfoCard state={info} />
      <PrefixesCard state={prefixes} />
    </div>
  );
}

function ASNInfoCard({ state }: { state: { loading: boolean; data: AsnInfo | null; error: string | null } }) {
  const d = state.data;
  return (
    <SectionCard title="ASN Info" source="BGPView" loading={state.loading} error={state.error}>
      {d && (
        <div className="space-y-0.5">
          <Row label="ASN">AS{d.asn}</Row>
          <Row label="Name">{d.name}</Row>
          <Row label="Description">{d.description_short}</Row>
          <Row label="Country">{d.country_code || "—"}</Row>
          {d.website && (
            <Row label="Website">
              <a href={d.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                <Globe className="h-3 w-3" />{d.website.replace(/^https?:\/\//, "")}
              </a>
            </Row>
          )}
          <Row label="RIR">{d.rir_allocation.rir_name}</Row>
          {d.rir_allocation.date_allocated && (
            <Row label="Allocated">{new Date(d.rir_allocation.date_allocated).toLocaleDateString()}</Row>
          )}
          {d.abuse_contacts?.length > 0 && (
            <Row label="Abuse">{d.abuse_contacts.join(", ")}</Row>
          )}
        </div>
      )}
    </SectionCard>
  );
}

function PrefixesCard({ state }: { state: { loading: boolean; data: AsnPrefixes | null; error: string | null } }) {
  const d = state.data;
  const v4 = d?.ipv4_prefixes ?? [];
  const v6 = d?.ipv6_prefixes ?? [];

  return (
    <SectionCard title="Prefixes" source="BGPView" loading={state.loading} error={state.error} skeletonRows={6}>
      {d && (
        <div className="space-y-3">
          {v4.length > 0 && (
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[10px]">IPv4</Badge>
                {v4.length} prefix{v4.length !== 1 ? "es" : ""}
              </p>
              <div className="space-y-1">
                {v4.slice(0, 8).map((p) => (
                  <div key={p.prefix} className="flex items-start gap-2 text-xs">
                    <span className="font-mono">{p.prefix}</span>
                    <span className="text-muted-foreground">{p.name}</span>
                  </div>
                ))}
                {v4.length > 8 && <p className="text-xs text-muted-foreground">+{v4.length - 8} more</p>}
              </div>
            </div>
          )}
          {v6.length > 0 && (
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[10px]">IPv6</Badge>
                {v6.length} prefix{v6.length !== 1 ? "es" : ""}
              </p>
              <div className="space-y-1">
                {v6.slice(0, 4).map((p) => (
                  <div key={p.prefix} className="flex items-start gap-2 text-xs">
                    <span className="font-mono">{p.prefix}</span>
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
