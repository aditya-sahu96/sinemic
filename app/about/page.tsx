import { Card, CardContent, Button } from "@/components/ui";
import Link from "next/link";
import { CheckIcon, XIcon } from "@/components/ui/icons";

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
    <div className="min-h-screen py-24 px-6 max-w-4xl mx-auto space-y-24">
      <section className="space-y-6">
        <h1 className="font-heading text-4xl md:text-5xl font-normal tracking-tight text-text-heading">About Sinemic</h1>
        <p className="text-lg text-text-body max-w-xl leading-relaxed">
          A prototype tool that helps you build with AI without losing context, skipping verification, or leaking secrets.
        </p>
      </section>

      <section className="space-y-10">
        <h2 className="font-heading text-2xl font-medium tracking-tight text-text-heading">The problem</h2>
        <div className="space-y-6">
          <p className="text-text-body leading-relaxed">
            AI coding assistants are powerful but they have three systemic problems:
          </p>
          <ul className="list-disc list-inside space-y-4 text-text-body">
            <li className="leading-relaxed">
              <strong className="text-text-heading">Context loss:</strong> When you switch models (Claude → GPT → Gemini), the new model doesn&apos;t know what
              the previous one did. You re-explain the codebase, re-state constraints, re-list decisions.
            </li>
            <li className="leading-relaxed">
              <strong className="text-text-heading">Unverified &quot;done&quot;:</strong> Models claim completion but skip type-check, tests, builds, secret scans.
              Broken code ships because nobody ran the checks.
            </li>
            <li className="leading-relaxed">
              <strong className="text-text-heading">No model portability:</strong> You&apos;re locked into one provider&apos;s ecosystem. Quota hits, rate limits,
              or pricing changes stall your work.
            </li>
          </ul>
        </div>
      </section>

      <section className="space-y-10">
        <h2 className="font-heading text-2xl font-medium tracking-tight text-text-heading">How Sinemic works</h2>
        <div className="space-y-6">
          <p className="text-text-body leading-relaxed">
            Sinemic wraps the AI coding loop with three pillars:
          </p>
          <ol className="list-decimal list-inside space-y-6 text-text-body">
            <li className="leading-relaxed">
              <strong className="text-text-heading">Project memory (Context Packs):</strong> Every task creates a portable context pack — specs, decisions,
              file tree, recent changes, test results. Switch models mid-task and the new model picks up exactly where
              the last one left off.
            </li>
            <li className="leading-relaxed">
              <strong className="text-text-heading">Verified changes (Gatekeeper):</strong> Before any patch is applied, Sinemic runs typecheck, lint,
              tests, build, and secret scan. Results are shown in the UI. Skipped checks are visible, not hidden.
            </li>
            <li className="leading-relaxed">
              <strong className="text-text-heading">Model-agnostic runtime:</strong> Uses OpenRouter to access 100+ models. Free tier models have
              automatic fallback on quota errors. Your usage and limits are visible in the header.
            </li>
          </ol>
        </div>
      </section>

      <Card className="space-y-6">
        <CardContent className="space-y-4">
          <h2 className="font-heading text-2xl font-medium tracking-tight text-text-heading">What is verified (and what is not)</h2>
          <p className="text-text-body leading-relaxed">
            Each verification step is explicit. Green = enforced. Gray = planned / not yet implemented in this prototype.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {verifiedItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-card border border-border rounded-[var(--radius-control)]"
              >
                {item.status ? (
                  <CheckIcon className="w-5 h-5 text-success flex-shrink-0" aria-hidden="true" />
                ) : (
                  <XIcon className="w-5 h-5 text-text-muted flex-shrink-0" aria-hidden="true" />
                )}
                <span className={item.status ? "text-text-heading" : "text-text-muted"}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="space-y-6">
        <CardContent className="space-y-4">
          <h2 className="font-heading text-2xl font-medium tracking-tight text-text-heading">Free model limits</h2>
          <p className="text-text-body leading-relaxed">
            Sinemic uses OpenRouter free models. Limits are approximate and enforced by OpenRouter.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 font-medium text-text-heading">Model</th>
                  <th className="pb-2 font-medium text-text-heading">Rate limit</th>
                  <th className="pb-2 font-medium text-text-heading">Context</th>
                </tr>
              </thead>
              <tbody>
                {freeModelLimits.map((m, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-3 text-text-body">{m.model}</td>
                    <td className="py-3 text-text-secondary">{m.limit}</td>
                    <td className="py-3 text-text-secondary">{m.context}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 pt-8 border-t border-border">
        <h2 className="font-heading text-2xl font-medium tracking-tight text-text-heading">Next steps</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/roadmap">
              <Button size="lg">View roadmap →</Button>
            </Link>
            <Link href="/projects">
              <Button variant="secondary" size="lg">Try the demo →</Button>
            </Link>
          </div>
      </section>
    </div>
  );
}
