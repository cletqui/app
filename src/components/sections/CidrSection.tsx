import { SectionCard, CardGrid, Row, SubLabel } from "@/components/SectionCard";

function numToIp(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
}

interface CidrInfo {
  network: string;
  broadcast: string;
  mask: string;
  firstHost: string;
  lastHost: string;
  totalHosts: number;
  usableHosts: number;
  prefixLen: number;
  ipClass: string;
}

function parseCidr(cidr: string): CidrInfo {
  const [ip, prefix] = cidr.split("/");
  const prefixLen = parseInt(prefix, 10);
  const parts = ip.split(".").map(Number);
  const ipNum = ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;

  const mask = prefixLen === 0 ? 0 : (0xffffffff << (32 - prefixLen)) >>> 0;
  const network = (ipNum & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const total = Math.pow(2, 32 - prefixLen);
  const usable = prefixLen >= 31 ? total : Math.max(0, total - 2);
  const firstHost = prefixLen >= 31 ? network : network + 1;
  const lastHost = prefixLen >= 31 ? broadcast : broadcast - 1;

  const first = (network >>> 24) & 255;
  const ipClass = first < 128 ? "A" : first < 192 ? "B" : first < 224 ? "C" : first < 240 ? "D (Multicast)" : "E (Reserved)";

  return {
    network: numToIp(network),
    broadcast: numToIp(broadcast),
    mask: numToIp(mask),
    firstHost: numToIp(firstHost),
    lastHost: numToIp(lastHost),
    totalHosts: total,
    usableHosts: usable,
    prefixLen,
    ipClass,
  };
}

function isIpv4Cidr(cidr: string): boolean {
  return /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/.test(cidr);
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function CidrSection({ cidr }: { cidr: string }) {
  if (!isIpv4Cidr(cidr)) {
    return (
      <SectionCard title="CIDR Calculator">
        <p className="text-xs text-muted-foreground">IPv6 CIDR display — prefix /{cidr.split("/")[1]}</p>
        <p className="mt-1 text-xs text-muted-foreground">Full IPv6 subnet calculation is not yet supported.</p>
      </SectionCard>
    );
  }

  let info: CidrInfo;
  try {
    info = parseCidr(cidr);
  } catch {
    return <SectionCard title="CIDR Calculator" error="Invalid CIDR notation" />;
  }

  return (
    <CardGrid>
      <SectionCard title="Network">
        <Row label="Network" value={`${info.network}/${info.prefixLen}`} />
        <Row label="Subnet mask" value={info.mask} />
        <Row label="Broadcast" value={info.broadcast} />
        <Row label="IP class" value={info.ipClass} />
      </SectionCard>

      <SectionCard title="Hosts">
        <div className="mb-2">
          <p className="text-2xl font-semibold tabular-nums">{formatCount(info.usableHosts)}</p>
          <p className="text-[10px] text-muted-foreground">usable hosts</p>
        </div>
        <SubLabel>Range</SubLabel>
        <Row label="First" value={info.firstHost} />
        <Row label="Last" value={info.lastHost} />
        {info.prefixLen < 31 && (
          <p className="mt-1 text-[10px] text-muted-foreground">{formatCount(info.totalHosts)} total — 2 reserved (network + broadcast)</p>
        )}
      </SectionCard>
    </CardGrid>
  );
}
