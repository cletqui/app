const API = "https://api.cybai.re";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) {
    const text = await res.text().catch(() => `HTTP ${res.status}`);
    const err = new Error(text || `HTTP ${res.status}`);
    (err as Error & { status: number }).status = res.status;
    throw err;
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

export interface IpReputation {
  results: { dataset: string; ipaddress: string; asn: string; cc: string; listed: number }[];
}

export const ipInfo = (ip: string) =>
  get<IpInfo>(`/cyber/ip/info/${encodeURIComponent(ip)}`);
export const ipReverseDns = (ip: string) =>
  get<IpReverseDns>(`/cyber/ip/reverse-dns/${encodeURIComponent(ip)}`);
export const ipReputation = (ip: string) =>
  get<IpReputation>(`/cyber/ip/reputation/${encodeURIComponent(ip)}`);
export const ipThreat = (ip: string) =>
  get<UrlhausHostResult>(`/cyber/ip/threat/${encodeURIComponent(ip)}`);

// ── Domain ─────────────────────────────────────────────────────────────────

export interface WhoisResult {
  ldhName: string;
  handle?: string;
  status: string[];
  events: { eventAction: string; eventDate: string }[];
  entities?: { roles: string[]; handle?: string }[];
  nameservers?: { ldhName: string }[];
  secureDNS?: { delegationSigned: boolean };
}

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

export interface DomainReputation {
  domain: string;
  "last-seen": number;
  tags: string[];
  abused: boolean;
  score: number;
  dimensions: { human: number; identity: number; infra: number; malware: number; smtp: number };
}

export interface MailSecurity {
  domain: string;
  mx: { priority: number; exchange: string }[];
  spf: { record: string | null; valid: boolean; policy: string | null };
  dmarc: { record: string | null; valid: boolean; policy: string | null; pct: number | null; rua: string | null };
  dkim: { selector: string; record: string | null; valid: boolean };
}

export interface UrlhausHostResult {
  query_status: string;
  urlhaus_reference?: string;
  host?: string;
  urls_count?: number;
  blacklists?: { spamhaus_dbl: string; surbl: string };
  urls?: { id: string; url: string; url_status: string; date_added: string; threat: string; reporter: string; tags: string[] | null }[];
  firstseen?: string;
}

export interface UrlhausUrlResult {
  query_status: string;
  urlhaus_reference?: string;
  url?: string;
  url_status?: string;
  date_added?: string;
  threat?: string;
  blacklists?: { gsb: string; surbl: string; spamhaus_dbl: string };
  tags?: string[] | null;
}

export const domainWhois = (domain: string) =>
  get<WhoisResult>(`/cyber/domain/whois/${encodeURIComponent(domain)}`);
export const domainNslookup = (domain: string) =>
  get<NslookupResult>(`/cyber/domain/nslookup/cloudflare/${encodeURIComponent(domain)}`);
export const domainCerts = (domain: string) =>
  get<CertEntry[]>(`/cyber/domain/certs/${encodeURIComponent(domain)}?exclude=expired&deduplicate=Y`);
export const domainReputation = (domain: string) =>
  get<DomainReputation>(`/cyber/domain/reputation/${encodeURIComponent(domain)}`);
export const domainMailSecurity = (domain: string) =>
  get<MailSecurity>(`/cyber/domain/mail-security/${encodeURIComponent(domain)}`);
export const domainThreat = (domain: string) =>
  get<UrlhausHostResult>(`/cyber/domain/threat/${encodeURIComponent(domain)}`);
export const urlThreat = (url: string) =>
  get<UrlhausUrlResult>(`/cyber/domain/url/threat?url=${encodeURIComponent(url)}`);

// ── ASN ────────────────────────────────────────────────────────────────────

export interface AsnInfo {
  asn: number;
  name: string;
  description_short: string;
  description_full: string[];
  country_code: string;
  website: string | null;
  email_contacts: string[];
  abuse_contacts: string[];
  rir_allocation: { rir_name: string; country_code: string | null; date_allocated: string | null; allocation_status: string };
  date_updated: string;
}

export interface AsnPrefixes {
  ipv4_prefixes: { prefix: string; name: string; description: string; country_code: string }[];
  ipv6_prefixes: { prefix: string; name: string; description: string; country_code: string }[];
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
