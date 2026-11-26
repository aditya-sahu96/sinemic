import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-base font-medium text-text-heading font-heading tracking-tight">Sinemic</span>
            </div>
            <p className="text-sm text-text-secondary max-w-sm">
              Build with any AI. Keep the project&apos;s memory. Verify every change.
            </p>
          </div>
          <nav className="flex items-center gap-6" aria-label="Footer navigation">
            <Link href="/about" className="text-sm text-text-secondary hover:text-text-heading transition-colors">
              About
            </Link>
            <Link href="/roadmap" className="text-sm text-text-secondary hover:text-text-heading transition-colors">
              Roadmap
            </Link>
            <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm text-text-secondary hover:text-text-heading transition-colors">
              GitHub
            </Link>
          </nav>
        </div>
        <div className="mt-8 pt-6 border-t border-border/40 text-xs text-text-muted">
          <p>Not production ready. Mocked and limited features are marked clearly.</p>
        </div>
      </div>
    </footer>
  );
}
