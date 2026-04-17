import { useRef, useState } from "react";
import { SectionCard, CardGrid, Row, SubLabel, NoData } from "@/components/SectionCard";
import { parseMail } from "@/lib/mail";
import { niceBytes } from "@/lib/utils";
import type { ParsedMail } from "@/lib/mail";

const TEXTAREA_CLASS =
  "w-full resize-none rounded border border-border bg-card px-3 py-2 font-mono text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 transition-shadow";

function openSearch(value: string) {
  window.open(`${window.location.origin}/?q=${encodeURIComponent(value)}`, "_blank");
}

function Clickable({ value }: { value: string }) {
  return (
    <button
      onClick={() => openSearch(value)}
      className="break-all text-left underline decoration-dotted hover:text-foreground text-muted-foreground transition-colors"
      title={`Analyze ${value}`}
    >
      {value}
    </button>
  );
}

// ── Sub-cards ─────────────────────────────────────────────────────────────

function GeneralCard({ mail }: { mail: ParsedMail }) {
  return (
    <SectionCard title="General">
      {mail.subject || mail.messageId || mail.date ? (
        <div>
          {mail.subject && <Row label="Subject" value={mail.subject} />}
          {mail.date && <Row label="Date" value={mail.date} />}
          {mail.messageId && <Row label="Message-ID" value={mail.messageId} />}
        </div>
      ) : <NoData />}
    </SectionCard>
  );
}

function ParticipantsCard({ mail }: { mail: ParsedMail }) {
  return (
    <SectionCard title="Participants">
      {mail.from || mail.to?.length ? (
        <div className="space-y-1.5">
          {mail.from && (
            <div>
              <SubLabel>From</SubLabel>
              {mail.from.name && <p className="text-xs">{mail.from.name}</p>}
              {mail.from.address && (
                <p className="text-xs">
                  <Clickable value={mail.from.address} />
                </p>
              )}
              {mail.from.domain && (
                <p className="text-xs text-muted-foreground">
                  domain: <Clickable value={mail.from.domain} />
                </p>
              )}
            </div>
          )}
          {mail.to?.map((t, i) => (
            <div key={i}>
              <SubLabel>To {mail.to!.length > 1 ? i + 1 : ""}</SubLabel>
              {t.name && <p className="text-xs">{t.name}</p>}
              {t.address && <p className="text-xs"><Clickable value={t.address} /></p>}
              {t.domain && (
                <p className="text-xs text-muted-foreground">
                  domain: <Clickable value={t.domain} />
                </p>
              )}
            </div>
          ))}
        </div>
      ) : <NoData />}
    </SectionCard>
  );
}

function RoutingCard({ mail }: { mail: ParsedMail }) {
  if (!mail.received.length) return null;
  return (
    <SectionCard title="Routing" className="sm:col-span-2" expandable>
      <div className="space-y-2">
        {mail.received.map((r) => (
          <div key={r.hop} className="rounded border border-border/50 p-2 text-xs">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="whitespace-nowrap font-medium">Hop {r.hop}</span>
              {r.delay && <span className="text-muted-foreground">{r.delay}</span>}
              {r.with && <span className="ml-auto text-[10px] text-muted-foreground">{r.with}</span>}
            </div>
            {r.from && (
              <div className="flex items-baseline gap-2">
                <span className="w-8 shrink-0 text-[10px] text-muted-foreground">From</span>
                <span className="break-all">{r.from}</span>
              </div>
            )}
            {r.by && (
              <div className="flex items-baseline gap-2">
                <span className="w-8 shrink-0 text-[10px] text-muted-foreground">By</span>
                <span className="break-all">{r.by}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function LinksCard({ mail }: { mail: ParsedMail }) {
  if (!mail.links.length) return null;
  return (
    <SectionCard title={`Links (${mail.links.length})`} className="sm:col-span-2" expandable>
      <div className="space-y-1">
        {mail.links.map((link, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <span className="w-10 shrink-0 text-muted-foreground">{link.protocol}</span>
            <span className="min-w-0">
              {link.domain && (
                <span className="mr-1 text-muted-foreground">
                  <Clickable value={link.domain} />
                </span>
              )}
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all opacity-60 hover:opacity-100 transition-opacity"
              >
                {link.url}
              </a>
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function AttachmentsCard({ mail }: { mail: ParsedMail }) {
  if (!mail.attachments.length) return null;
  return (
    <SectionCard title={`Attachments (${mail.attachments.length})`}>
      <div className="space-y-1">
        {mail.attachments.map((a, i) => (
          <div key={i} className="text-xs">
            <span className="font-medium">{a.filename ?? `attachment-${i + 1}`}</span>
            <span className="ml-2 text-muted-foreground">{a.mimeType}</span>
            <span className="ml-2 text-muted-foreground">{niceBytes(a.size)}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function HeadersCard({ mail }: { mail: ParsedMail }) {
  return (
    <SectionCard title={`Headers (${mail.headers.length})`} className="sm:col-span-2" expandable>
      <div className="space-y-0.5">
        {mail.headers.map((h, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <span className="w-32 shrink-0 text-muted-foreground">{h.key}</span>
            <span className="break-all">{h.value}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function MailSection() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"file" | "text">("file");
  const [text, setText] = useState("");
  const [filename, setFilename] = useState<string | null>(null);
  const [fileData, setFileData] = useState<ArrayBuffer | null>(null);
  const [result, setResult] = useState<ParsedMail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFileData(ev.target?.result as ArrayBuffer);
    };
    reader.readAsArrayBuffer(file);
    setMode("file");
  }

  async function handleSubmit() {
    const data = mode === "file" ? fileData : text.trim();
    if (!data) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await parseMail(data));
    } catch (e: any) {
      setError(e.message ?? "Failed to parse email");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = mode === "file" ? !!fileData : !!text.trim();

  return (
    <div className="space-y-3">
      {/* Input area */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            onClick={() => setMode("file")}
            className={`rounded border px-3 py-1.5 text-xs transition-colors ${mode === "file" ? "border-ring text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            Upload file
          </button>
          <button
            onClick={() => setMode("text")}
            className={`rounded border px-3 py-1.5 text-xs transition-colors ${mode === "text" ? "border-ring text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            Paste raw
          </button>
        </div>

        {mode === "file" ? (
          <div
            className="flex cursor-pointer items-center gap-2 rounded border border-dashed border-border px-3 py-4 text-xs text-muted-foreground hover:border-ring transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".eml,message/rfc822"
              onChange={handleFile}
              className="hidden"
            />
            {filename
              ? <span className="text-foreground">{filename}</span>
              : <span>Click to select .eml file</span>}
          </div>
        ) : (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste raw email content (headers + body)…"
            rows={6}
            className={TEXTAREA_CLASS}
          />
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          className="rounded bg-foreground px-3 py-1.5 text-xs text-background disabled:opacity-40 hover:opacity-80 transition-opacity"
        >
          {loading ? "Analyzing…" : "Analyze"}
        </button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {result && (
        <CardGrid>
          <GeneralCard mail={result} />
          <ParticipantsCard mail={result} />
          <RoutingCard mail={result} />
          <LinksCard mail={result} />
          <AttachmentsCard mail={result} />
          <HeadersCard mail={result} />
        </CardGrid>
      )}
    </div>
  );
}
