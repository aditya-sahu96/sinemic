"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuIcon, XIcon } from "@/components/ui/icons";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/roadmap", label: "Roadmap" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="h-16 bg-surface border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-text-primary flex items-center gap-2" aria-label="Sinemic Home">
          <span className="text-primary">Sinemic</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-muted hover:text-text-primary transition-base"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          className="md:hidden p-2 rounded-[var(--radius-control)] text-text-primary hover:bg-background transition-base"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <nav id="mobile-menu" className="md:hidden py-4 border-t border-border bg-surface" aria-label="Mobile navigation">
          <div className="max-w-7xl mx-auto px-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-base font-medium text-text-primary hover:bg-background rounded-[var(--radius-control)] transition-base"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}