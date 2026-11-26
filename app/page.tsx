import Link from "next/link";
import { Button, Card, CardContent, SparklesIcon, ShieldIcon, DatabaseIcon, Reveal } from "@/components/ui";

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
      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <Reveal delay={80}>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-normal tracking-[-0.03em] leading-[0.95] text-text-heading">
              Build with any AI.
              <br />
              <span className="text-text-secondary">Keep the project&apos;s memory.</span>
              <br />
              Verify every change.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-8 text-base md:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
              AI-built projects lose context when you switch models, say &quot;done&quot; without proof, and skip basics like validation and secrets.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-10">
              <Link href="/projects">
                <Button size="lg">Try the demo</Button>
              </Link>
              <Link href="/about">
                <Button variant="secondary" size="lg">Learn more</Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Divider glow */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* How it works */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-20">
              <p className="text-[10px] uppercase tracking-[0.25em] text-text-muted mb-4">How it works</p>
              <h2 className="font-heading text-3xl md:text-5xl font-normal tracking-tight text-text-heading">
                Memory, verification, and model-agnostic execution.
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto mt-6 leading-relaxed">
                Every task runs through context packs, verification gates, and automatic model fallback before you approve.
              </p>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 100}>
                <Card className="h-full">
                  <CardContent className="space-y-5">
                    <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-secondary" aria-hidden="true">
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-heading text-xl font-medium text-text-heading tracking-tight">{feature.title}</h3>
                    <p className="text-text-secondary leading-relaxed text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="font-heading text-3xl md:text-5xl font-normal tracking-tight text-text-heading">
              Ready to try it?
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto leading-relaxed">
              Open the demo project and walk through the full flow: map, describe, review, check, approve.
            </p>
            <div className="pt-4">
              <Link href="/projects">
                <Button size="lg">Open demo project</Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
