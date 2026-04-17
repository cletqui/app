import { SectionCard, CardGrid, Row, SubLabel } from "@/components/SectionCard";

function b64urlDecode(s: string): string {
  const padded = s + "=".repeat((4 - (s.length % 4)) % 4);
  return atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
}

function parseJwt(token: string): { header: Record<string, unknown>; payload: Record<string, unknown> } {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT: expected 3 segments");
  try {
    return {
      header: JSON.parse(b64urlDecode(parts[0])),
      payload: JSON.parse(b64urlDecode(parts[1])),
    };
  } catch {
    throw new Error("Failed to decode JWT segments");
  }
}

function formatClaim(value: unknown): string {
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return String(value);
}

function formatTs(unix: number): string {
  return new Date(unix * 1000).toLocaleString();
}

function ExpiryStatus({ exp }: { exp: number | undefined }) {
  if (exp === undefined) return <span className="text-xs text-muted-foreground">● No expiration</span>;
  const now = Date.now() / 1000;
  const diff = exp - now;
  const abs = Math.abs(diff);
  const days = Math.floor(abs / 86400);
  const hours = Math.floor((abs % 86400) / 3600);
  const mins = Math.floor((abs % 3600) / 60);
  const human = days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  return diff < 0
    ? <span className="text-xs text-destructive">● Expired {human} ago</span>
    : <span className="text-xs text-success">● Valid — expires in {human}</span>;
}

const KNOWN_CLAIMS = new Set(["iss", "sub", "aud", "exp", "nbf", "iat", "jti"]);

export function JwtSection({ token }: { token: string }) {
  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;
  let parseError: string | null = null;

  try {
    ({ header, payload } = parseJwt(token));
  } catch (e: any) {
    parseError = e.message;
    header = {};
    payload = {};
  }

  if (parseError) {
    return (
      <SectionCard title="JWT Decoder" error={parseError} />
    );
  }

  const knownClaims = Object.entries(payload).filter(([k]) => KNOWN_CLAIMS.has(k));
  const customClaims = Object.entries(payload).filter(([k]) => !KNOWN_CLAIMS.has(k));
  const exp = typeof payload.exp === "number" ? payload.exp : undefined;

  return (
    <CardGrid>
      <SectionCard title="Header">
        {Object.entries(header).map(([k, v]) => (
          <Row key={k} label={k} value={formatClaim(v)} />
        ))}
        <div className="mt-1.5 text-[10px] text-muted-foreground">Signature not verified — client-side only</div>
      </SectionCard>

      <SectionCard title="Expiry">
        <div className="space-y-1.5">
          <ExpiryStatus exp={exp} />
          {exp !== undefined && <Row label="Expires" value={formatTs(exp)} />}
          {typeof payload.iat === "number" && <Row label="Issued" value={formatTs(payload.iat)} />}
          {typeof payload.nbf === "number" && <Row label="Not before" value={formatTs(payload.nbf)} />}
        </div>
      </SectionCard>

      <SectionCard title="Claims" className="sm:col-span-2" expandable>
        <div>
          {knownClaims.length > 0 && (
            <div className="mb-2">
              <SubLabel>Standard</SubLabel>
              {knownClaims.map(([k, v]) => (
                <Row key={k} label={k} value={formatClaim(v)} />
              ))}
            </div>
          )}
          {customClaims.length > 0 && (
            <div>
              <SubLabel>Custom</SubLabel>
              {customClaims.map(([k, v]) => (
                <Row key={k} label={k} value={formatClaim(v)} />
              ))}
            </div>
          )}
          {knownClaims.length === 0 && customClaims.length === 0 && (
            <p className="text-xs text-muted-foreground">Empty payload</p>
          )}
        </div>
      </SectionCard>
    </CardGrid>
  );
}
