"use client";

import { Card, CardContent, Button, EmptyState } from "@/components/ui";
import Link from "next/link";
import { FolderIcon, ArrowRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const projects = [
  {
    id: "sample-checkout",
    name: "Sample: TypeScript checkout",
    description: "A TypeScript checkout flow with cart, payment, and order confirmation.",
    updatedAt: "2026-11-20",
    status: "active",
  },
];

export default function ProjectsPage() {
  return (
    <div className="min-h-screen py-12 px-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-text-primary font-heading">Projects</h1>
        <Link
          href="/projects/new"
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] px-4 py-2 text-sm font-medium",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50",
            "transition-base"
          )}
        >
          New project
        </Link>
      </div>

      {projects.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="h-full">
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-[var(--radius-control)] flex items-center justify-center" aria-hidden="true">
                      <FolderIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary">{project.name}</h3>
                      <p className="text-sm text-text-muted">{project.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-[var(--radius-control)] ${
                    project.status === "active" ? "bg-success/10 text-success" : "bg-text-muted/10 text-text-muted"
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-xs text-text-muted">Updated {project.updatedAt}</p>
                <Link
                  href={`/projects/${project.id}`}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] px-4 py-2 text-sm font-medium w-full",
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "disabled:pointer-events-none disabled:opacity-50",
                    "transition-base"
                  )}
                >
                  Open demo
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="folder"
          title="No projects yet"
          description="Create your first project to start building with AI."
          action={{ label: "New project", onClick: () => {} }}
        />
      )}
    </div>
  );
}