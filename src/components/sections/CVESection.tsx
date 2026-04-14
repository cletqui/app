import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionCard, Row } from "@/components/SectionCard";
import { cveInfo } from "@/lib/api";
import type { CveResult } from "@/lib/api";

const SEVERITY_VARIANT: Record<string, "destructive" | "warning" | "success" | "muted"> = {
  CRITICAL: "destructive",
  HIGH: "destructive",
  MEDIUM: "warning",
  LOW: "success",
  NONE: "muted",
};

export function CVESection({ id }: { id: string }) {
  const [state, setState] = useState<{ loading: boolean; data: CveResult | null; error: string | null }>({
    loading: true, data: null, error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, data: null, error: null });
    cveInfo(id.toUpperCase())
      .then((data) => { if (!cancelled) setState({ loading: false, data, error: null }); })
      .catch((e: Error) => { if (!cancelled) setState({ loading: false, data: null, error: e.message }); });
    return () => { cancelled = true; };
  }, [id]);

  const d = state.data;
  const cna = d?.containers?.cna;
  const description = cna?.descriptions?.find((d) => d.lang === "en")?.value ?? cna?.descriptions?.[0]?.value;
  const cvss = cna?.metrics?.[0]?.cvssV3_1;

  return (
    <SectionCard title={id.toUpperCase()} source="MITRE CVE" loading={state.loading} error={state.error} skeletonRows={5}>
      {d && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={d.cveMetadata.state === "PUBLISHED" ? "success" : "muted"}>
              {d.cveMetadata.state}
            </Badge>
            {cvss && (
              <Badge variant={SEVERITY_VARIANT[cvss.baseSeverity] ?? "muted"}>
                {cvss.baseSeverity} {cvss.baseScore}
              </Badge>
            )}
          </div>

          {cna?.title && <p className="text-sm font-medium">{cna.title}</p>}
          {description && <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>}

          <div className="space-y-0.5">
            <Row label="Published">{new Date(d.cveMetadata.datePublished).toLocaleDateString()}</Row>
            <Row label="Updated">{new Date(d.cveMetadata.dateUpdated).toLocaleDateString()}</Row>
          </div>

          {cna?.references?.length ? (
            <div>
              <p className="mb-1.5 text-xs text-muted-foreground">References</p>
              <div className="space-y-1">
                {cna.references.slice(0, 5).map((r, i) => (
                  <a
                    key={i}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground break-all"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    {r.name ?? r.url}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </SectionCard>
  );
}
