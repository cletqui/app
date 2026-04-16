import PostalMime from "postal-mime";

// ── Types ──────────────────────────────────────────────────────────────────

export interface MailAddress {
  name?: string;
  address?: string;
  domain?: string;
}

export interface MailLink {
  url: string;
  protocol: string | null;
  domain: string | null;
  nested: boolean;
}

export interface ReceivedHop {
  hop: number;
  delay: string;
  from: string | null;
  by: string | null;
  with: string | null;
  time: string | null;
}

export interface MailAttachment {
  filename?: string;
  mimeType: string;
  size: number;
}

export interface ParsedMail {
  subject?: string;
  messageId?: string;
  date?: string;
  from?: MailAddress;
  to?: MailAddress[];
  headers: { key: string; value: string }[];
  text?: string;
  html?: string;
  links: MailLink[];
  attachments: MailAttachment[];
  received: ReceivedHop[];
}

// ── Parsing ────────────────────────────────────────────────────────────────

function domainFromAddress(address?: string): string | undefined {
  if (!address) return undefined;
  const m = address.match(/@([^\s<>@]+)$/);
  return m?.[1] ?? undefined;
}

function extractUrls(text: string): MailLink[] {
  if (!text) return [];
  const seen = new Set<string>();
  const results: MailLink[] = [];
  const regex = /https?:\/\/[^\s<>"')\]]+/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const raw = match[0].replace(/[.,;!?]+$/, ""); // strip trailing punctuation
    if (seen.has(raw)) continue;
    seen.add(raw);
    try {
      const parsed = new URL(raw);
      results.push({
        url: raw,
        protocol: parsed.protocol.replace(":", ""),
        domain: parsed.hostname || null,
        nested: false,
      });
    } catch {
      // skip malformed
    }
  }
  return results;
}

const RECEIVED_REGEX =
  /from\s(.*?)\s*by\s(.*?)\s*with\s(.*?)\s*;\s*(.*?$)|by\s(.*?)\swith\s(.*?)\s*;\s*(.*?$)|from\s(.*?)\s*;\s*(.*?$)|by\s(.*?)\s*;\s*(.*?$)/;

function parseReceived(headers: { key: string; value: string }[]): ReceivedHop[] {
  const received = headers.filter((h) => h.key === "received");
  let prevTime: string | undefined;

  return received
    .map((h) => {
      const m = h.value.match(RECEIVED_REGEX);
      if (!m) return { from: null, by: null, with: null, time: null };
      return {
        from: m[1] ?? m[8] ?? null,
        by: m[2] ?? m[5] ?? m[10] ?? null,
        with: m[3] ?? m[6] ?? null,
        time: m[4] ?? m[7] ?? m[9] ?? null,
      };
    })
    .reverse()
    .sort((a, b) => {
      if (!a.time || !b.time) return 0;
      return new Date(a.time).getTime() - new Date(b.time).getTime();
    })
    .map((entry, index) => {
      const hop = index + 1;
      let delay: string;
      if (index === 0 || !entry.time) {
        delay = "—";
      } else {
        const ms = new Date(entry.time).getTime() - new Date(prevTime!).getTime();
        delay = `${Math.round(ms / 1000)}s`;
      }
      prevTime = entry.time ?? prevTime;
      return { hop, delay, ...entry };
    });
}

export async function parseMail(data: string | ArrayBuffer): Promise<ParsedMail> {
  const parser = new PostalMime();
  const result = await parser.parse(data);

  const links = extractUrls(result.text ?? result.html ?? "");
  const received = parseReceived(result.headers ?? []);

  return {
    subject: result.subject,
    messageId: result.messageId,
    date: result.date,
    from: result.from
      ? { ...result.from, domain: domainFromAddress(result.from.address) }
      : undefined,
    to: result.to?.map((r) => ({ ...r, domain: domainFromAddress(r.address) })),
    headers: result.headers ?? [],
    text: result.text,
    html: result.html,
    links,
    attachments: (result.attachments ?? []).map((a) => ({
      filename: a.filename ?? undefined,
      mimeType: a.mimeType,
      size: a.content instanceof ArrayBuffer ? a.content.byteLength : (a.content as Uint8Array)?.byteLength ?? 0,
    })),
    received,
  };
}
