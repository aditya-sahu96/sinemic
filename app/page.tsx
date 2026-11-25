import Link from "next/link";
import { Button, Card, CardContent, ArrowRightIcon, SparklesIcon, ShieldIcon, DatabaseIcon } from "@/components/ui";

const features = [
  {
    icon: DatabaseIcon,
    title: "Project memory",
    description: "Context packs travel with your task. Switch models without losing progress or re-explaining the codebase.",
  },
  {
    icon: ShieldIcon,
    title: "Verified changes",
    description: "Every model patch runs through typecheck, tests, build, and secret scan before you approve. Skipped checks are shown, not hidden.",
  },
  {
    icon: SparklesIcon,
    title: "Switch models freely",
    description: "OpenRouter free models with automatic fallback on quota or errors. Your usage limits are visible in the UI.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <section className="py-20 px-4 max-w-7xl mx-auto text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-[var(--radius-control)]">
            Prototype
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary leading-tight font-heading">
            Build with any AI. Keep the project&apos;s memory. Verify every change.
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            AI-built projects lose context when you switch models, say "done" without proof, and skip basics like validation and secrets.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/projects" className="inline-flex items-center justify-center font-medium transition-base rounded-[var(--radius-control)] min-h-[40px] px-6 py-3 text-lg bg-primary text-white hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              Try the demo
            </Link>
            <Link href="/about" className="inline-flex items-center justify-center font-medium transition-base rounded-[var(--radius-control)] min-h-[40px] px-6 py-3 text-lg bg-surface text-text-primary border border-border hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              Learn more
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-12 font-heading">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={feature.title} className="h-full">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-[var(--radius-control)] flex items-center justify-center" aria-hidden="true">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary font-heading">{feature.title}</h3>
                  <p className="text-text-muted">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-text-primary mb-6 font-heading">Ready to try it?</h2>
        <p className="text-text-muted mb-8 max-w-2xl mx-auto">
          Open the demo project and walk through the full flow: map, describe, review, check, approve.
        </p>
        <Link href="/projects" className="inline-flex items-center justify-center font-medium transition-base rounded-[var(--radius-control)] min-h-[40px] px-6 py-3 text-lg bg-primary text-white hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
          Open demo project
        </Link>
      </section>
    </div>
  );
}