import { ExternalLink } from "lucide-react";
import { useAsync } from "@/hooks/useAsync";
import { SectionCard, Row } from "@/components/SectionCard";
import { cveInfo } from "@/lib/api";
import type { CveResult } from "@/lib/api";

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: "text-destructive",
  HIGH: "text-destructive",
  MEDIUM: "text-warning",
  LOW: "text-success",
  NONE: "text-muted-foreground",
};

export function CVESection({ id }: { id: string }) {
  const state = useAsync(() => cveInfo(id.toUpperCase()), [id]);
  const d = state.data;
  const cna = d?.containers?.cna;
  const description = cna?.descriptions?.find((d) => d.lang === "en")?.value ?? cna?.descriptions?.[0]?.value;
  const cvss = cna?.metrics?.[0]?.cvssV3_1;

  return (
    <SectionCard title={id.toUpperCase()} source="MITRE CVE" loading={state.loading} error={state.error} skeletonRows={5}>
      {d && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`text-xs ${d.cveMetadata.state === "PUBLISHED" ? "text-success" : "text-muted-foreground"}`}>
              ● {d.cveMetadata.state}
            </span>
            {cvss && (
              <span className={`text-xs font-medium ${SEVERITY_COLOR[cvss.baseSeverity] ?? "text-muted-foreground"}`}>
                {cvss.baseSeverity} {cvss.baseScore}
              </span>
            )}
          </div>

          {cna?.title && <p className="text-xs font-medium">{cna.title}</p>}
          {description && <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>}

          <div>
            <Row label="Published" value={new Date(d.cveMetadata.datePublished).toLocaleDateString()} />
            <Row label="Updated" value={new Date(d.cveMetadata.dateUpdated).toLocaleDateString()} />
          </div>

          {cna?.references?.length ? (
            <div>
              <p className="mb-1 text-[10px] text-muted-foreground">References</p>
              <div className="space-y-0.5">
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
