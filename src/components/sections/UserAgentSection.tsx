import { useState } from "react";
import { SectionCard, CardGrid, Row, NoData } from "@/components/SectionCard";
import { uaParse } from "@/lib/api";
import type { UaResult } from "@/lib/api";

const TEXTAREA_CLASS =
  "w-full resize-none rounded border border-border bg-card px-3 py-2 font-mono text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 transition-shadow";

export function UserAgentSection() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<UaResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const ua = input.trim();
    if (!ua) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await uaParse(ua));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
          placeholder="Paste a user-agent string…"
          rows={3}
          className={TEXTAREA_CLASS}
        />
        <div className="flex gap-2">
          <button
            onClick={() => setInput(navigator.userAgent)}
            className="rounded border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Use mine
          </button>
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || loading}
            className="rounded bg-foreground px-3 py-1.5 text-xs text-background transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            {loading ? "Analyzing…" : "Analyze"}
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {(loading || result) && (
        <CardGrid>
          <SectionCard title="Browser" loading={loading}>
            {result && (result.browser.name ? (
              <div>
                <Row label="Name" value={result.browser.name} />
                {result.browser.version && <Row label="Version" value={result.browser.version} />}
                {result.browser.major && <Row label="Major" value={result.browser.major} />}
              </div>
            ) : <NoData message="Unknown browser" />)}
          </SectionCard>

          <SectionCard title="OS" loading={loading}>
            {result && (result.os.name ? (
              <div>
                <Row label="Name" value={result.os.name} />
                {result.os.version && <Row label="Version" value={result.os.version} />}
              </div>
            ) : <NoData message="Unknown OS" />)}
          </SectionCard>

          <SectionCard title="Device" loading={loading}>
            {result && (result.device.vendor || result.device.model ? (
              <div>
                {result.device.vendor && <Row label="Vendor" value={result.device.vendor} />}
                {result.device.model && <Row label="Model" value={result.device.model} />}
                {result.device.type && <Row label="Type" value={result.device.type} />}
              </div>
            ) : <NoData message="No device info" />)}
          </SectionCard>

          <SectionCard title="Engine" loading={loading}>
            {result && (result.engine.name ? (
              <div>
                <Row label="Name" value={result.engine.name} />
                {result.engine.version && <Row label="Version" value={result.engine.version} />}
                {result.cpu.architecture && <Row label="CPU" value={result.cpu.architecture} />}
              </div>
            ) : <NoData message="Unknown engine" />)}
          </SectionCard>

          <SectionCard title="Raw" className="sm:col-span-2" loading={loading} expandable>
            {result && <p className="break-all font-mono text-[11px] text-muted-foreground">{result.ua}</p>}
          </SectionCard>
        </CardGrid>
      )}
    </div>
  );
}
