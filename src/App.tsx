import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchBar } from "@/components/SearchBar";
import { IPSection } from "@/components/sections/IPSection";
import { DomainSection } from "@/components/sections/DomainSection";
import { URLSection } from "@/components/sections/URLSection";
import { CVESection } from "@/components/sections/CVESection";
import { ASNSection } from "@/components/sections/ASNSection";
import { HashSection } from "@/components/sections/HashSection";
import { MailSection } from "@/components/sections/MailSection";
import { UserAgentSection } from "@/components/sections/UserAgentSection";
import { MyIPSection } from "@/components/sections/MyIPSection";
import { JwtSection } from "@/components/sections/JwtSection";
import { CidrSection } from "@/components/sections/CidrSection";
import { detect, TYPE_LABELS, type InputType } from "@/lib/detect";
import { navigate } from "@/lib/router";
import { getHistory, pushHistory, removeHistory, clearHistory, type HistoryEntry } from "@/lib/history";
import { TABS } from "@/components/Header";
import type { Tab } from "@/components/Header";

// ── Rotating hero word ────────────────────────────────────────────────────

const HERO_WORDS = ["domains", "IP addresses", "CVEs", "hashes", "emails", "JWTs", "ASNs", "CIDRs"];

function RotatingWord() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx((i) => (i + 1) % HERO_WORDS.length); setVisible(true); }, 320);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="text-foreground/70"
      style={{
        display: "inline-block",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-5px)",
        transition: "opacity 0.32s ease, transform 0.32s ease",
      }}
    >
      {HERO_WORDS[idx]}
    </span>
  );
}

// ── Routing ────────────────────────────────────────────────────────────────

function parseLocation(): { tab: Tab; query: string } {
  const path = window.location.pathname;
  const q = new URLSearchParams(window.location.search).get("q") ?? "";
  const tab: Tab =
    path === "/mail" ? "mail" :
    path === "/ua" ? "ua" :
    path === "/myip" ? "myip" :
    "search";
  return { tab, query: q };
}

// ── Lookup tab ─────────────────────────────────────────────────────────────

const EXAMPLES: { label: string; value: string }[] = [
  { label: "Domain", value: "cloudflare.com" },
  { label: "IPv4", value: "1.1.1.1" },
  { label: "IPv6", value: "2606:4700:4700::1111" },
  { label: "URL", value: "https://example.com" },
  { label: "CVE", value: "CVE-2021-44228" },
  { label: "ASN", value: "AS13335" },
  { label: "SHA-256", value: "094fd325049b8a9cf6d3e5ef2a6d4cc6a567d7d49c35f8bb8dd9e3c6acf3d78d" },
  { label: "JWT", value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c" },
  { label: "CIDR", value: "192.168.0.0/24" },
];

type Search = { query: string; type: InputType } | null;

function Results({ query, type }: { query: string; type: InputType }) {
  if (type === "ipv4" || type === "ipv6") return <IPSection ip={query} />;
  if (type === "domain") return <DomainSection domain={query} />;
  if (type === "url") return <URLSection url={query} />;
  if (type === "cve") return <CVESection id={query} />;
  if (type === "asn") return <ASNSection asn={query} />;
  if (type === "sha256") return <HashSection hash={query} hashType="sha256" />;
  if (type === "sha1") return <HashSection hash={query} hashType="sha1" />;
  if (type === "md5") return <HashSection hash={query} hashType="md5" />;
  if (type === "jwt") return <JwtSection token={query} />;
  if (type === "cidr") return <CidrSection cidr={query} />;
  return (
    <p className="text-xs text-muted-foreground">
      Unrecognized input — try a domain, IP, URL, CVE, ASN, hash, JWT, or CIDR.
    </p>
  );
}

function LookupTab({ initialQuery }: { initialQuery: string }) {
  const [input, setInput] = useState(initialQuery);
  const [search, setSearch] = useState<Search>(
    initialQuery ? { query: initialQuery, type: detect(initialQuery) } : null
  );
  const [history, setHistory] = useState<HistoryEntry[]>(() => getHistory());

  useEffect(() => {
    if (initialQuery) {
      setInput(initialQuery);
      setSearch({ query: initialQuery, type: detect(initialQuery) });
    }
  }, [initialQuery]);

  function handleSubmit(value: string) {
    const type = detect(value);
    setSearch({ query: value, type });
    pushHistory(value, type);
    setHistory(getHistory());
  }

  function handleRemoveHistory(query: string) {
    removeHistory(query);
    setHistory(getHistory());
  }

  function handleClearHistory() {
    clearHistory();
    setHistory([]);
  }

  return (
    <>
      {!search ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="mb-6 text-center">
            <h1 className="mb-2 bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-sm font-semibold tracking-tight text-transparent">
              Inspect anything.
            </h1>
            <p className="text-xs text-muted-foreground">
              Lookup <RotatingWord />.
            </p>
          </div>
          <div className="w-full max-w-md">
            <SearchBar value={input} onChange={setInput} onSubmit={handleSubmit} />
          </div>

          {history.length > 0 && (
            <div className="mt-5 w-full max-w-md">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Recent</span>
                <button
                  onClick={handleClearHistory}
                  className="text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {history.map((entry) => (
                  <div key={entry.query} className="flex items-center gap-0.5 rounded border border-border bg-card pl-2 text-[10px] transition-colors hover:border-ring/40">
                    <button
                      onClick={() => handleSubmit(entry.query)}
                      className="max-w-[160px] truncate py-1 text-left text-muted-foreground hover:text-foreground transition-colors"
                      title={entry.query}
                    >
                      {entry.query}
                    </button>
                    <span className="px-1 text-muted-foreground/40">{TYPE_LABELS[entry.type as InputType] ?? entry.type}</span>
                    <button
                      onClick={() => handleRemoveHistory(entry.query)}
                      className="px-1.5 py-1 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                      aria-label="Remove"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                onClick={() => handleSubmit(ex.value)}
                className="rounded border border-border px-2 py-0.5 text-[10px] text-muted-foreground transition-colors hover:border-ring/50 hover:text-foreground"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="animate-fade-in space-y-3 pt-4">
          <SearchBar value={input} onChange={setInput} onSubmit={handleSubmit} compact />
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground">
              {TYPE_LABELS[search.type]}
            </span>
            <span className="truncate text-xs">{search.query}</span>
          </div>
          <Results query={search.query} type={search.type} />
        </div>
      )}
    </>
  );
}

// ── App ────────────────────────────────────────────────────────────────────

export default function App() {
  const [{ tab, query }, setRoute] = useState(parseLocation);

  useEffect(() => {
    function onPop() { setRoute(parseLocation()); }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header activeTab={tab} />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-4">
        {tab === "search" ? (
          <LookupTab initialQuery={query} />
        ) : (
          <div className="animate-fade-in space-y-3 pt-4">
            <h2 className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {TABS.find((t) => t.id === tab)?.label}
            </h2>
            {tab === "mail" && <MailSection />}
            {tab === "ua" && <UserAgentSection />}
            {tab === "myip" && <MyIPSection />}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
