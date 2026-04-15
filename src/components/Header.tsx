import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-10 max-w-5xl items-center justify-between px-4">
        <a href="/" className="text-xs tracking-tight hover:opacity-75 transition-opacity">
          <span className="font-medium">cybai.re</span>
          <span className="text-muted-foreground"> / osint</span>
        </a>
        <ThemeToggle />
      </div>
    </header>
  );
}
