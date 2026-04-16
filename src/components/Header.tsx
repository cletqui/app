import { ThemeToggle } from "@/components/ThemeToggle";
import { navigate } from "@/lib/router";
import { cn } from "@/lib/utils";

export type Tab = "search" | "mail" | "ua" | "myip";

export const TABS: { id: Tab; label: string; path: string; primary?: boolean }[] = [
  { id: "search", label: "Lookup", path: "/", primary: true },
  { id: "mail", label: "Mail", path: "/mail" },
  { id: "ua", label: "User-Agent", path: "/ua" },
  { id: "myip", label: "My IP", path: "/myip" },
];

export function Header({ activeTab }: { activeTab: Tab }) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-10 max-w-5xl items-center justify-between px-4">
        <a
          href="/"
          onClick={(e) => { e.preventDefault(); navigate("/"); }}
          className="text-xs font-medium tracking-tight transition-opacity hover:opacity-75"
        >
          cybai.re
        </a>
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-0.5">
            {TABS.map((tab) => (
              <a
                key={tab.id}
                href={tab.path}
                onClick={(e) => { e.preventDefault(); navigate(tab.path); }}
                className={cn(
                  "rounded px-2 py-1 transition-colors",
                  tab.primary ? "text-[11px] font-semibold tracking-wide" : "text-[11px]",
                  activeTab === tab.id
                    ? "text-foreground shadow-[inset_0_-1.5px_0_currentColor]"
                    : tab.primary
                      ? "text-muted-foreground/80 hover:text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </a>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
