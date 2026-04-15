import { DomainSection } from "./DomainSection";

function extractHostname(url: string): string | null {
  try { return new URL(url).hostname; } catch { return null; }
}

export function URLSection({ url }: { url: string }) {
  const hostname = extractHostname(url);
  if (!hostname) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Host</span>
        <span className="text-xs">{hostname}</span>
      </div>
      <DomainSection domain={hostname} />
    </div>
  );
}
