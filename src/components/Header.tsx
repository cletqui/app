import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium tracking-tight">cybai.re</span>
          <span className="text-xs text-muted-foreground">/ osint</span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
