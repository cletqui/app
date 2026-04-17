export type InputType =
  | "ipv4"
  | "ipv6"
  | "domain"
  | "url"
  | "cve"
  | "asn"
  | "sha256"
  | "sha1"
  | "md5"
  | "jwt"
  | "cidr"
  | "unknown";

export function detect(raw: string): InputType {
  const t = raw.trim();
  if (!t) return "unknown";

  // CVE-YYYY-NNNNN
  if (/^CVE-\d{4}-\d{4,}$/i.test(t)) return "cve";

  // ASN: AS12345
  if (/^AS\d+$/i.test(t)) return "asn";

  // JWT: three base64url segments, first starting with eyJ (base64 of '{"')
  if (/^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/.test(t)) return "jwt";

  // Hashes — check longest first to avoid ambiguity
  if (/^[a-f0-9]{64}$/i.test(t)) return "sha256";
  if (/^[a-f0-9]{40}$/i.test(t)) return "sha1";
  if (/^[a-f0-9]{32}$/i.test(t)) return "md5";

  // URL: has scheme
  if (/^https?:\/\/.+/i.test(t)) return "url";

  // CIDR: IPv4/prefix
  if (/^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/.test(t)) {
    const [ip, prefix] = t.split("/");
    const parts = ip.split(".").map(Number);
    if (parts.every((p) => p <= 255) && Number(prefix) <= 32) return "cidr";
  }
  // CIDR: IPv6/prefix
  if (/^[0-9a-f:]+\/\d{1,3}$/i.test(t)) return "cidr";

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
  sha1: "SHA-1",
  md5: "MD5",
  jwt: "JWT",
  cidr: "CIDR",
  unknown: "Unknown",
};
