import { ExternalLink } from "lucide-react";
import { useAsync } from "@/hooks/useAsync";
import { SectionCard, CardGrid, Row, StatusRow, Tags } from "@/components/SectionCard";
import { hashInfo } from "@/lib/api";
import type { HashResult } from "@/lib/api";
import { niceBytes } from "@/lib/utils";

const HASH_LABELS: Record<string, string> = {
  sha256: "SHA-256",
  sha1: "SHA-1",
  md5: "MD5",
};

export function HashSection({ hash, hashType = "sha256" }: { hash: string; hashType?: string }) {
  const state = useAsync(() => hashInfo(hash), [hash]);
  const d = state.data;
  const found = d?.query_status === "ok";
  const mbUrl = `https://bazaar.abuse.ch/sample/${hash}/`;

  return (
    <CardGrid>
      <SectionCard title="Hash Info">
        <Row label="Type" value={HASH_LABELS[hashType] ?? hashType.toUpperCase()} />
        <Row label="Length" value={`${hash.length * 4} bits`} />
        <Row label="Value" value={hash} />
      </SectionCard>

      <SectionCard title="MalwareBazaar" source="abuse.ch" loading={state.loading} error={state.error} skeletonRows={4}>
        {d && (
          found
            ? <div>
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-destructive text-xs">● Known malware</span>
                  <a href={mbUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-muted-foreground hover:text-foreground">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                {d.file_name && <Row label="Filename" value={d.file_name} />}
                {d.file_type_mime && <Row label="Type" value={d.file_type_mime} />}
                {d.file_size && <Row label="Size" value={niceBytes(d.file_size)} />}
                {d.signature && <Row label="Signature" value={d.signature} />}
                {d.first_seen && <Row label="First seen" value={new Date(d.first_seen).toLocaleDateString()} />}
                {d.reporter && <Row label="Reporter" value={d.reporter} />}
                {d.intelligence?.downloads && <Row label="Downloads" value={String(d.intelligence.downloads)} />}
                <Tags tags={d.tags ?? []} />
              </div>
            : <StatusRow ok={true} yes="Not found in MalwareBazaar" no="" />
        )}
      </SectionCard>
    </CardGrid>
  );
}
