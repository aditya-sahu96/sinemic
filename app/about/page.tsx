import { Card, CardContent, Badge, Button } from "@/components/ui";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon, XIcon, AlertCircleIcon } from "@/components/ui/icons";

const verifiedItems = [
  { label: "TypeScript type-check passes", status: true },
  { label: "ESLint / Prettier clean", status: true },
  { label: "Unit tests pass (Vitest)", status: true },
  { label: "Build succeeds (Next.js)", status: true },
  { label: "Secret scan clean (gitleaks)", status: true },
  { label: "Bundle size within budget", status: false },
  { label: "Accessibility audit (axe-core)", status: false },
  { label: "E2E tests pass (Playwright)", status: false },
];

const freeModelLimits = [
  { model: "Meta: Llama 3.1 8B (free)", limit: "~50 req/min", context: "128k tokens" },
  { model: "Mistral: Mistral 7B (free)", limit: "~50 req/min", context: "32k tokens" },
  { model: "Google: Gemma 2 9B (free)", limit: "~50 req/min", context: "8k tokens" },
  { model: "Microsoft: Phi-3 Mini (free)", limit: "~50 req/min", context: "128k tokens" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen py-20 px-4 max-w-4xl mx-auto space-y-16">
      <section className="space-y-6">
        <h1 className="text-4xl font-bold text-text-primary font-heading">About Sinemic</h1>
        <p className="text-lg text-text-muted">
          A prototype tool that helps you build with AI without losing context, skipping verification, or leaking secrets.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary font-heading">The problem</h2>
        <div className="prose prose-slate max-w-none text-text-muted space-y-4">
          <p>
            AI coding assistants are powerful but they have three systemic problems:
          </p>
          <ul className="list-disc list-inside space-y-3">
            <li>
              <strong>Context loss:</strong> When you switch models (Claude → GPT → Gemini), the new model doesn't know what
              the previous one did. You re-explain the codebase, re-state constraints, re-list decisions.
            </li>
            <li>
              <strong>Unverified "done":</strong> Models claim completion but skip type-check, tests, builds, secret scans.
              Broken code ships because nobody ran the checks.
            </li>
            <li>
              <strong>No model portability:</strong> You're locked into one provider's ecosystem. Quota hits, rate limits,
              or pricing changes stall your work.
            </li>
          </ul>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary font-heading">How Sinemic works</h2>
        <div className="prose prose-slate max-w-none text-text-muted space-y-4">
          <p>
            Sinemic wraps the AI coding loop with three pillars:
          </p>
          <ol className="list-decimal list-inside space-y-4">
            <li>
              <strong>Project memory (Context Packs):</strong> Every task creates a portable context pack — specs, decisions,
              file tree, recent changes, test results. Switch models mid-task and the new model picks up exactly where
              the last one left off.
            </li>
            <li>
              <strong>Verified changes (Gatekeeper):</strong> Before any patch is applied, Sinemic runs typecheck, lint,
              tests, build, and secret scan. Results are shown in the UI. Skipped checks are visible, not hidden.
            </li>
            <li>
              <strong>Model-agnostic runtime:</strong> Uses OpenRouter to access 100+ models. Free tier models have
              automatic fallback on quota errors. Your usage and limits are visible in the header.
            </li>
          </ol>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary font-heading">What is verified (and what is not)</h2>
        <p className="text-text-muted">
          Each verification step is explicit. Green = enforced. Gray = planned / not yet implemented in this prototype.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {verifiedItems.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 bg-surface border border-border rounded-[var(--radius-control)]"
            >
              {item.status ? (
                <CheckIcon className="w-5 h-5 text-success flex-shrink-0" aria-hidden="true" />
              ) : (
                <XIcon className="w-5 h-5 text-text-muted flex-shrink-0" aria-hidden="true" />
              )}
              <span className={item.status ? "text-text-primary" : "text-text-muted"}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary font-heading">Free model limits</h2>
        <p className="text-text-muted">
          Sinemic uses OpenRouter free models. Limits are approximate and enforced by OpenRouter.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 font-medium text-text-primary">Model</th>
                <th className="pb-2 font-medium text-text-primary">Rate limit</th>
                <th className="pb-2 font-medium text-text-primary">Context</th>
              </tr>
            </thead>
            <tbody>
              {freeModelLimits.map((m, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-3 text-text-primary">{m.model}</td>
                  <td className="py-3 text-text-muted">{m.limit}</td>
                  <td className="py-3 text-text-muted">{m.context}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-6 pt-8 border-t border-border">
        <h2 className="text-2xl font-bold text-text-primary font-heading">Next steps</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/roadmap" className="inline-flex items-center justify-center font-medium transition-base rounded-[var(--radius-control)] min-h-[40px] px-6 py-3 text-lg bg-primary text-white hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            View roadmap →
          </Link>
          <Link href="/projects" className="inline-flex items-center justify-center font-medium transition-base rounded-[var(--radius-control)] min-h-[40px] px-6 py-3 text-lg bg-surface text-text-primary border border-border hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            Try the demo →
          </Link>
        </div>
      </section>
    </div>
  );
}