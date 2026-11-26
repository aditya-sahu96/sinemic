"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, Button, EmptyState, Input, ToastProvider, useToast } from "@/components/ui";
import Link from "next/link";
import { FolderIcon, ArrowRightIcon, TrashIcon, ExternalLinkIcon, LoaderIcon } from "@/components/ui/icons";

const STORAGE_KEY = "sinemic.projects";

interface Project {
  id: string;
  url: string;
  name: string;
  createdAt: string;
}

export default function ProjectsPage() {
  return (
    <ToastProvider>
      <ProjectsPageInner />
    </ToastProvider>
  );
}

function ProjectsPageInner() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputUrl, setInputUrl] = useState("");
  const [storageBlocked, setStorageBlocked] = useState(false);
  const [error, setError] = useState("");
  const { addToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!cancelled) setProjects(raw ? JSON.parse(raw) : []);
      } catch {
        if (!cancelled) {
          setStorageBlocked(true);
          setProjects([]);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const saveProjects = useCallback(
    (next: Project[]) => {
      setProjects(next);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        setStorageBlocked(true);
      }
    },
    []
  );

  const handleImport = useCallback(async () => {
    const url = inputUrl.trim();
    if (!url) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Import failed.");
        addToast({ type: "error", title: "Import failed", message: data.error || "Unknown error" });
        return;
      }
      const project: Project = {
        id: data.id,
        url,
        name: data.name,
        createdAt: new Date().toISOString(),
      };
      saveProjects([project, ...projects]);
      setInputUrl("");
      addToast({ type: "success", title: "Project imported", message: `${project.name} saved.` });
    } catch {
      setError("Network error. Please try again.");
      addToast({ type: "error", title: "Import failed", message: "Network error." });
    } finally {
      setLoading(false);
    }
  }, [inputUrl, projects, saveProjects, addToast]);

  const handleRemove = useCallback(
    (id: string) => {
      saveProjects(projects.filter((p) => p.id !== id));
      addToast({ type: "info", title: "Removed", message: "Project removed from list." });
    },
    [projects, saveProjects, addToast]
  );

  return (
    <div className="min-h-screen py-24 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-normal tracking-tight text-text-heading">Projects</h1>
          {storageBlocked && (
            <p className="text-sm text-text-muted mt-1">
              Projects will not be saved in this browser.
            </p>
          )}
        </div>
        <div className="flex items-end gap-3 w-full lg:w-auto">
          <Input
            placeholder="Paste a public GitHub link"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleImport();
            }}
            className="lg:w-80"
          />
          <Button
            disabled={loading || !inputUrl.trim()}
            onClick={handleImport}
            className="w-full lg:w-auto"
          >
            {loading ? (
              <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ArrowRightIcon className="w-4 h-4 mr-2" />
            )}
            Import project
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-[var(--radius-control)] border border-danger/20 bg-danger/5 text-danger text-sm">
          {error}
        </div>
      )}

      {projects.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="h-full space-y-4 elevated">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 text-primary-text rounded-[var(--radius-card)] flex items-center justify-center" aria-hidden="true">
                      <FolderIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-text-heading">{project.name}</h3>
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        <ExternalLinkIcon className="w-3 h-3" />
                        View on GitHub
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/projects/${project.id}`}>
                      <Button size="sm" className="w-full">
                        Open
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(project.id)}
                      aria-label="Remove from list"
                      className="w-8 h-9 flex items-center justify-center p-0"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-text-secondary">
                  Added {new Date(project.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="folder"
          title="No projects yet"
          description={storageBlocked ? "Import a project to get started. Changes will not persist after refresh." : "Import your first public GitHub repository to get started."}
          action={{
            label: "New project",
            onClick: () => {},
            variant: "primary",
          }}
        />
      )}
    </div>
  );
}
