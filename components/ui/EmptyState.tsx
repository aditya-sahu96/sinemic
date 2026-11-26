"use client";

import { Button } from "./Button";
import {
  FileIcon,
  FolderIcon,
  SearchIcon,
  CodeIcon,
  DatabaseIcon,
  TerminalIcon,
  AlertCircleIcon,
} from "./icons";

export type EmptyStateIcon =
  | "file"
  | "folder"
  | "search"
  | "code"
  | "database"
  | "terminal"
  | "alert";

const icons: Record<EmptyStateIcon, React.ReactNode> = {
  file: <FileIcon className="w-12 h-12 text-text-secondary" />,
  folder: <FolderIcon className="w-12 h-12 text-text-secondary" />,
  search: <SearchIcon className="w-12 h-12 text-text-secondary" />,
  code: <CodeIcon className="w-12 h-12 text-text-secondary" />,
  database: <DatabaseIcon className="w-12 h-12 text-text-secondary" />,
  terminal: <TerminalIcon className="w-12 h-12 text-text-secondary" />,
  alert: <AlertCircleIcon className="w-12 h-12 text-text-secondary" />,
};

interface EmptyStateProps {
  icon: EmptyStateIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "ghost";
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}>
      <div className="mb-4" aria-hidden="true">
        {icons[icon]}
      </div>
      <h3 className="text-lg font-medium text-text-heading mb-2">{title}</h3>
      {description && <p className="text-text-secondary mb-6 max-w-sm">{description}</p>}
      {action && (
        <Button variant={action.variant || "primary"} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}