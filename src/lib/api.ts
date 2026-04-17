const API = import.meta.env.VITE_API_URL ?? "https://api.cybai.re";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const clean = text.trim();
    const message = clean && !clean.startsWith("<") ? clean : `HTTP ${res.status}`;
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

// ── IP ─────────────────────────────────────────────────────────────────────

export interface IpInfo {
  query: string;
  status: string;
  continent: string;
  continentCode: string;
  country: string;
  countryCode: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  asname: string;
  mobile: boolean;
  proxy: boolean;
  hosting: boolean;
}

export interface IpReverseDns {
  ip: string;
  reverse_dns: string[];
}

export interface ShodanResult {
  ip: string;
  ports: number[];
  cpes: string[];
  hostnames: string[];
  tags: string[];
  vulns: string[];
}

export interface IpReputation {
  appears: boolean;
  frequency: number;
  confidence: number | null;
  lastseen: string | null;
  torexit: boolean;
  asn: number | null;
  country: string | null;
}

export const ipInfo = (ip: string) =>
  get<IpInfo>(`/cyber/ip/info/${encodeURIComponent(ip)}`);
export const ipReverseDns = (ip: string) =>
  get<IpReverseDns>(`/cyber/ip/reverse-dns/${encodeURIComponent(ip)}`);
export const ipShodan = (ip: string) =>
  get<ShodanResult | null>(`/cyber/ip/shodan/${encodeURIComponent(ip)}`);
export const myIp = () => get<{ ip: string }>("/cyber/ip/me");

export const ipReputation = (ip: string) =>
  get<IpReputation>(`/cyber/ip/reputation/${encodeURIComponent(ip)}`);

// ── Domain ─────────────────────────────────────────────────────────────────

export interface DnsRecord {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

export interface NslookupResult {
  A: DnsRecord[];
  AAAA: DnsRecord[];
  CNAME: DnsRecord[];
  MX: DnsRecord[];
  NS: DnsRecord[];
  TXT: DnsRecord[];
}

export interface CertEntry {
  id: number;
  logged_at: string;
  not_before: string;
  not_after: string;
  common_name: string;
  name_value: string;
  issuer_name: string;
}

export interface MailSecurity {
  domain: string;
  mx: { priority: number; exchange: string }[];
  spf: { record: string | null; valid: boolean; policy: string | null };
  dmarc: { record: string | null; valid: boolean; policy: string | null; pct: number | null; rua: string | null };
  dkim: { selector: string; record: string | null; valid: boolean };
}

export interface DomainWhois {
  name: string;
  registrar?: string;
  registered?: string;
  expires?: string;
  updated?: string;
  status: string[];
  nameservers: string[];
}

export interface IpWhois {
  resource: string;
  records: { key: string; value: string }[];
}

export const domainWhois = (domain: string) =>
  get<DomainWhois>(`/cyber/domain/whois/${encodeURIComponent(domain)}`);
export const domainNslookup = (domain: string) =>
  get<NslookupResult>(`/cyber/domain/nslookup/cloudflare/${encodeURIComponent(domain)}`);
export const domainCerts = (domain: string) =>
  get<CertEntry[]>(`/cyber/domain/certs/${encodeURIComponent(domain)}?exclude=expired&deduplicate=Y`);
export const domainMailSecurity = (domain: string) =>
  get<MailSecurity>(`/cyber/domain/mail-security/${encodeURIComponent(domain)}`);
export const ipWhois = (ip: string) =>
  get<IpWhois>(`/cyber/ip/whois/${encodeURIComponent(ip)}`);

// ── ASN ────────────────────────────────────────────────────────────────────

export interface AsnInfo {
  asn: number;
  holder: string;
  announced: boolean;
  type: string;
}

export interface AsnPrefixes {
  ipv4_prefixes: { prefix: string }[];
  ipv6_prefixes: { prefix: string }[];
}

export const asnInfo = (asn: string) =>
  get<{ data: AsnInfo }>(`/cyber/asn/${encodeURIComponent(asn)}`);
export const asnPrefixes = (asn: string) =>
  get<{ data: AsnPrefixes }>(`/cyber/asn/${encodeURIComponent(asn)}/prefixes`);

// ── CVE ────────────────────────────────────────────────────────────────────

export interface CveResult {
  dataType: string;
  cveMetadata: {
    state: string;
    cveId: string;
    datePublished: string;
    dateUpdated: string;
  };
  containers: {
    cna: {
      title: string;
      descriptions?: { lang: string; value: string }[];
      metrics?: { cvssV3_1?: { baseScore: number; baseSeverity: string } }[];
      references?: { url: string; name?: string }[];
    };
  };
}

export const cveInfo = (id: string) =>
  get<CveResult>(`/cyber/cve/${encodeURIComponent(id)}`);

// ── Hash ───────────────────────────────────────────────────────────────────

export interface HashResult {
  query_status: string;
  sha256_hash?: string;
  file_name?: string;
  file_type_mime?: string;
  file_size?: number;
  first_seen?: string;
  last_seen?: string;
  times_downloaded?: number;
  reporter?: string;
  tags?: string[];
  signature?: string | null;
  intelligence?: { downloads: string; uploads: string; mail: string | null };
}

export const hashInfo = (hash: string) =>
  get<HashResult>(`/cyber/hash/${encodeURIComponent(hash)}`);

// ── URL ────────────────────────────────────────────────────────────────────

export interface RedirectHop {
  url: string;
  status: number;
  location: string | null;
}

export const urlRedirects = (url: string) =>
  get<{ hops: RedirectHop[] }>(`/cyber/url/redirects?url=${encodeURIComponent(url)}`);

// ── User-Agent ──────────────────────────────────────────────────────────────

export interface UaResult {
  ua: string;
  browser: { name?: string; version?: string; major?: string };
  cpu: { architecture?: string };
  device: { type?: string; model?: string; vendor?: string };
  engine: { name?: string; version?: string };
  os: { name?: string; version?: string };
}

export const uaParse = (ua: string) =>
  get<UaResult>(`/cyber/ua?ua=${encodeURIComponent(ua)}`);
