import { useAsync } from "@/hooks/useAsync";
import { IPSection } from "@/components/sections/IPSection";
import { Skeleton } from "@/components/ui/skeleton";
import { myIp } from "@/lib/api";

async function fetchMyIp(): Promise<string> {
  const { ip } = await myIp();
  return ip;
}

export function MyIPSection() {
  const { loading, data: ip, error } = useAsync(fetchMyIp, []);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded border" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-xs text-destructive">{error}</p>;
  }

  if (!ip) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Your IP</span>
        <span className="font-mono text-sm">{ip}</span>
      </div>
      <IPSection ip={ip} />
    </div>
  );
}
