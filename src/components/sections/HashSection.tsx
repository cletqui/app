import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionCard, Row, NoData } from "@/components/SectionCard";
import { hashInfo } from "@/lib/api";
import type { HashResult } from "@/lib/api";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function HashSection({ hash }: { hash: string }) {
  const [state, setState] = useState<{ loading: boolean; data: HashResult | null; error: string | null }>({
    loading: true, data: null, error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, data: null, error: null });
    hashInfo(hash)
      .then((data) => { if (!cancelled) setState({ loading: false, data, error: null }); })
      .catch((e: Error) => { if (!cancelled) setState({ loading: false, data: null, error: e.message }); });
    return () => { cancelled = true; };
  }, [hash]);

  const d = state.data;
  const found = d?.query_status === "ok";
  const mbUrl = `https://bazaar.abuse.ch/sample/${hash}/`;

  return (
    <SectionCard title="Hash Lookup" source="MalwareBazaar" loading={state.loading} error={state.error} skeletonRows={5}>
      {d && (
        found ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="destructive">Known malware</Badge>
              <a href={mbUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-muted-foreground hover:text-foreground">
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            {d.file_name && <Row label="Filename">{d.file_name}</Row>}
            {d.file_type_mime && <Row label="Type">{d.file_type_mime}</Row>}
            {d.file_size && <Row label="Size">{formatBytes(d.file_size)}</Row>}
            {d.signature && <Row label="Signature">{d.signature}</Row>}
            {d.first_seen && <Row label="First seen">{new Date(d.first_seen).toLocaleDateString()}</Row>}
            {d.reporter && <Row label="Reporter">{d.reporter}</Row>}
            {d.intelligence && (
              <Row label="Downloads">{d.intelligence.downloads}</Row>
            )}
            {d.tags?.length ? (
              <div className="flex flex-wrap gap-1 mt-1">
                {d.tags.map((t) => <Badge key={t} variant="muted">{t}</Badge>)}
              </div>
            ) : null}
          </div>
        ) : <NoData message="Hash not found in MalwareBazaar" />
      )}
    </SectionCard>
  );
}
