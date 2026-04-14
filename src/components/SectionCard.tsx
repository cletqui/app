import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface SectionCardProps {
  title: string;
  source?: string;
  loading?: boolean;
  error?: string | null;
  skeletonRows?: number;
  children?: React.ReactNode;
}

export function SectionCard({
  title,
  source,
  loading,
  error,
  skeletonRows = 3,
  children,
}: SectionCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{title}</CardTitle>
          {source && (
            <Badge variant="muted" className="text-xs font-normal">
              {source}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: skeletonRows }).map((_, i) => (
              <Skeleton key={i} className={`h-4 ${i === 0 ? "w-3/4" : i % 2 === 0 ? "w-1/2" : "w-5/6"}`} />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <span>{error}</span>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

// ── Shared primitives ──────────────────────────────────────────────────────

export function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 py-0.5 text-sm">
      <span className="w-28 shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 break-all font-mono text-xs">{children}</span>
    </div>
  );
}

export function NoData({ message = "No data found" }: { message?: string }) {
  return <p className="text-sm text-muted-foreground">{message}</p>;
}
