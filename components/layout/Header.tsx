"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MenuIcon, XIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/roadmap", label: "Roadmap" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`h-16 sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-xl bg-background/70 border-b border-border"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <Link
          href="/"
          className="text-base font-medium text-text-heading font-heading tracking-tight flex items-center gap-2"
          aria-label="Sinemic Home"
        >
          Sinemic
        </Link>

        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-text-secondary hover:text-text-heading transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/projects">
            <Button size="sm">Try demo</Button>
          </Link>
        </div>

        <button
          className="md:hidden p-2 rounded-[var(--radius-control)] text-text-heading hover:bg-white/5 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <nav
          id="mobile-menu"
          className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl"
          aria-label="Mobile navigation"
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm text-text-secondary hover:text-text-heading hover:bg-white/5 rounded-[var(--radius-control)] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/projects" onClick={() => setMobileMenuOpen(false)}>
              <Button size="sm" className="w-full mt-2">
                Try demo
              </Button>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
