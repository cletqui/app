import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchBar } from "@/components/SearchBar";
import { IPSection } from "@/components/sections/IPSection";
import { DomainSection } from "@/components/sections/DomainSection";
import { URLSection } from "@/components/sections/URLSection";
import { CVESection } from "@/components/sections/CVESection";
import { ASNSection } from "@/components/sections/ASNSection";
import { HashSection } from "@/components/sections/HashSection";
import { detect, TYPE_LABELS, type InputType } from "@/lib/detect";

const EXAMPLES: { label: string; value: string }[] = [
  { label: "Domain", value: "cloudflare.com" },
  { label: "IPv4", value: "1.1.1.1" },
  { label: "IPv6", value: "2606:4700:4700::1111" },
  { label: "URL", value: "https://example.com" },
  { label: "CVE", value: "CVE-2021-44228" },
  { label: "ASN", value: "AS13335" },
  { label: "SHA-256", value: "094fd325049b8a9cf6d3e5ef2a6d4cc6a567d7d49c35f8bb8dd9e3c6acf3d78d" },
];

type Search = { query: string; type: InputType } | null;

function Results({ query, type }: { query: string; type: InputType }) {
  if (type === "ipv4" || type === "ipv6") return <IPSection ip={query} />;
  if (type === "domain") return <DomainSection domain={query} />;
  if (type === "url") return <URLSection url={query} />;
  if (type === "cve") return <CVESection id={query} />;
  if (type === "asn") return <ASNSection asn={query} />;
  if (type === "sha256") return <HashSection hash={query} />;
  return (
    <p className="text-xs text-muted-foreground">
      Unrecognized input — try a domain, IP, URL, CVE ID (CVE-YYYY-NNNN), ASN (AS12345), or SHA-256 hash.
    </p>
  );
}

export default function App() {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState<Search>(null);

  function handleSubmit(value: string) {
    setSearch({ query: value, type: detect(value) });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-4">
        {!search ? (
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="w-full max-w-md">
              <SearchBar value={input} onChange={setInput} onSubmit={handleSubmit} />
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-1.5">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => handleSubmit(ex.value)}
                  className="rounded border border-border px-2 py-0.5 text-[10px] text-muted-foreground hover:border-ring hover:text-foreground transition-colors"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-4">
            <SearchBar value={input} onChange={setInput} onSubmit={handleSubmit} compact />
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {TYPE_LABELS[search.type]}
              </span>
              <span className="text-xs">{search.query}</span>
            </div>
            <Results query={search.query} type={search.type} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
