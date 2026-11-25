import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { CheckIcon, ClockIcon, AlertCircleIcon } from "@/components/ui/icons";

type ItemStatus = "implemented" | "planned";

const roadmapItems: Array<{ category: string; items: Array<{ title: string; status: ItemStatus }> }> = [
  { category: "Core", items: [
    { title: "Context pack format v1", status: "implemented" },
    { title: "OpenRouter model switching", status: "implemented" },
    { title: "Gatekeeper: typecheck + lint + test + build + secret scan", status: "implemented" },
    { title: "Project persistence (SQLite)", status: "implemented" },
    { title: "Offline-first context sync", status: "planned" },
    { title: "Multi-repo context linking", status: "planned" },
  ]},
  { category: "UI/UX", items: [
    { title: "Design system (R1)", status: "implemented" },
    { title: "Landing, About, Roadmap pages (R2)", status: "implemented" },
    { title: "Project dashboard", status: "planned" },
    { title: "Task Kanban board", status: "planned" },
    { title: "Diff viewer with inline review", status: "planned" },
    { title: "Terminal emulator in browser", status: "planned" },
  ]},
  { category: "AI Integration", items: [
    { title: "OpenRouter free model routing", status: "implemented" },
    { title: "Automatic fallback on quota/error", status: "implemented" },
    { title: "Usage & cost dashboard", status: "planned" },
    { title: "Custom model endpoints (Ollama, LM Studio)", status: "planned" },
    { title: "Agent mode (multi-step autonomous)", status: "planned" },
    { title: "Voice input for tasks", status: "planned" },
  ]},
  { category: "Verification", items: [
    { title: "TypeScript + ESLint + Prettier", status: "implemented" },
    { title: "Vitest unit tests", status: "implemented" },
    { title: "Next.js production build", status: "implemented" },
    { title: "Gitleaks secret scan", status: "implemented" },
    { title: "Bundle size budget", status: "planned" },
    { title: "axe-core accessibility audit", status: "planned" },
    { title: "Playwright E2E tests", status: "planned" },
    { title: "Mutation testing (Stryker)", status: "planned" },
  ]},
  { category: "Collaboration", items: [
    { title: "GitHub PR integration", status: "planned" },
    { title: "Team workspaces", status: "planned" },
    { title: "Shared context packs", status: "planned" },
    { title: "Audit log & compliance export", status: "planned" },
    { title: "SSO (GitHub, Google, Microsoft)", status: "planned" },
  ]},
  { category: "Infrastructure", items: [
    { title: "Docker image (Node 20 + Bun)", status: "planned" },
    { title: "EAS / Expo native builds", status: "planned" },
    { title: "Vercel / Cloudflare Pages deploy", status: "planned" },
    { title: "Self-hosted (Docker Compose)", status: "planned" },
    { title: "Telemetry (opt-in)", status: "planned" },
  ]},
];

const statusConfig = {
  implemented: { label: "Implemented", variant: "verified" as const, icon: CheckIcon, color: "text-success" },
  planned: { label: "Planned", variant: "proposed" as const, icon: ClockIcon, color: "text-text-muted" },
} as const;

function StatusBadge({ status }: { status: keyof typeof statusConfig }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <Badge variant={config.variant} className="capitalize">
      <Icon className={`w-3 h-3 mr-1 ${config.color}`} aria-hidden="true" />
      {config.label}
    </Badge>
  );
}

export default function RoadmapPage() {
  return (
    <div className="min-h-screen py-20 px-4 max-w-5xl mx-auto space-y-12">
      <section className="space-y-4 text-center">
        <h1 className="text-4xl font-bold text-text-primary font-heading">Roadmap</h1>
        <p className="text-lg text-text-muted max-w-2xl mx-auto">
          Features are grouped by category. <span className="font-medium">Implemented</span> items are in the prototype.
          <span className="font-medium">Planned</span> items are not yet built.
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-text-muted">
          <span className="flex items-center gap-1">
            <CheckIcon className="w-4 h-4 text-success" aria-hidden="true" />
            Implemented in prototype
          </span>
          <span className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4 text-text-muted" aria-hidden="true" />
            Planned
          </span>
        </div>
      </section>

      <div className="space-y-8">
        {roadmapItems.map((category, catIndex) => (
          <Card key={catIndex}>
            <CardHeader>
              <CardTitle className="text-xl">{category.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-start justify-between gap-4 p-3 bg-background rounded-[var(--radius-control)]">
                    <dt className="flex-1 text-text-primary font-medium">{item.title}</dt>
                    <dd className="flex-shrink-0">
                      <StatusBadge status={item.status} />
                    </dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="pt-8 border-t border-border text-center">
        <p className="text-text-muted mb-4">
          This is a prototype. Planned items have no implementation yet.
        </p>
        <a href="/about" className="text-primary hover:underline font-medium">
          ← Back to About
        </a>
      </section>
    </div>
  );
}