export type InputType =
  | "ipv4"
  | "ipv6"
  | "domain"
  | "url"
  | "cve"
  | "asn"
  | "sha256"
  | "unknown";

export function detect(raw: string): InputType {
  const t = raw.trim();
  if (!t) return "unknown";

  // CVE-YYYY-NNNNN
  if (/^CVE-\d{4}-\d{4,}$/i.test(t)) return "cve";

  // ASN: AS12345 or AS 12345
  if (/^AS\d+$/i.test(t)) return "asn";

  // SHA-256: exactly 64 hex chars
  if (/^[a-f0-9]{64}$/i.test(t)) return "sha256";

  // URL: has scheme
  if (/^https?:\/\/.+/i.test(t)) return "url";

  // IPv4
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(t)) {
    const parts = t.split(".").map(Number);
    if (parts.every((p) => p <= 255)) return "ipv4";
  }

  // IPv6: simplified — two or more colon-separated hex groups
  if (/^([0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}$/i.test(t)) return "ipv6";

  // Domain: labels separated by dots
  if (/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(t)) {
    return "domain";
  }

  return "unknown";
}

export const TYPE_LABELS: Record<InputType, string> = {
  ipv4: "IPv4",
  ipv6: "IPv6",
  domain: "Domain",
  url: "URL",
  cve: "CVE",
  asn: "ASN",
  sha256: "SHA-256",
  unknown: "Unknown",
};
