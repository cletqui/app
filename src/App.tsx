import { useState } from "react";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { IPSection } from "@/components/sections/IPSection";
import { DomainSection } from "@/components/sections/DomainSection";
import { URLSection } from "@/components/sections/URLSection";
import { CVESection } from "@/components/sections/CVESection";
import { ASNSection } from "@/components/sections/ASNSection";
import { HashSection } from "@/components/sections/HashSection";
import { detect, TYPE_LABELS, type InputType } from "@/lib/detect";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

type SearchState = {
  query: string;
  type: InputType;
} | null;

function Results({ query, type }: { query: string; type: InputType }) {
  if (type === "ipv4" || type === "ipv6") return <IPSection ip={query} />;
  if (type === "domain") return <DomainSection domain={query} />;
  if (type === "url") return <URLSection url={query} />;
  if (type === "cve") return <CVESection id={query} />;
  if (type === "asn") return <ASNSection asn={query} />;
  if (type === "sha256") return <HashSection hash={query} />;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border p-4 text-sm text-muted-foreground">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>
        Unrecognized input. Try a domain, IP, URL (with <code className="font-mono text-xs">https://</code>), CVE ID, ASN, or SHA-256 hash.
      </span>
    </div>
  );
}

export default function App() {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState<SearchState>(null);

  function handleSubmit(value: string) {
    const type = detect(value);
    setSearch({ query: value, type });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 pb-16">
        {!search ? (
          /* ── Landing ── */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <h1 className="mb-2 font-mono text-2xl font-medium tracking-tight">OSINT Lookup</h1>
            <p className="mb-8 max-w-sm text-sm text-muted-foreground">
              Investigate domains, IPs, URLs, CVEs, ASNs, and malware hashes from a single interface.
            </p>
            <div className="w-full max-w-xl">
              <SearchBar value={input} onChange={setInput} onSubmit={handleSubmit} />
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-1.5">
              {(["ipv4", "ipv6", "domain", "url", "cve", "asn", "sha256"] as InputType[]).map((t) => (
                <Badge key={t} variant="outline" className="text-xs text-muted-foreground">
                  {TYPE_LABELS[t]}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          /* ── Results ── */
          <div className="pt-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <SearchBar value={input} onChange={setInput} onSubmit={handleSubmit} compact />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{TYPE_LABELS[search.type]}</Badge>
              <span className="font-mono text-sm">{search.query}</span>
            </div>
            <Results query={search.query} type={search.type} />
          </div>
        )}
      </main>
    </div>
  );
}
