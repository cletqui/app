import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-10 max-w-5xl items-center justify-between px-4">
        <span className="text-xs tracking-tight">
          <span className="font-medium">cybai.re</span>
          <span className="text-muted-foreground"> / osint</span>
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}
