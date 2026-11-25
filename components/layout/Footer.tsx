import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-text-primary">Sinemic</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-[var(--radius-control)] font-medium">
              Prototype
            </span>
          </div>
          <p className="text-sm text-text-muted">
            Build with any AI. Keep the project's memory. Verify every change.
          </p>
          <nav className="flex items-center gap-4" aria-label="Footer navigation">
            <Link href="/about" className="text-sm text-text-muted hover:text-text-primary transition-base">
              About
            </Link>
            <Link href="/roadmap" className="text-sm text-text-muted hover:text-text-primary transition-base">
              Roadmap
            </Link>
            <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm text-text-muted hover:text-text-primary transition-base">
              GitHub
            </Link>
          </nav>
        </div>
        <div className="mt-6 pt-6 border-t border-border text-center text-xs text-text-muted">
          <p>Not production ready. Mocked and limited features are marked clearly.</p>
        </div>
      </div>
    </footer>
  );
}