const GITHUB_URL_PATTERN = /^https:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)(\.git)?\/?$/;

export interface ParsedGitHubUrl {
  owner: string;
  repo: string;
}

export function parseGitHubUrl(url: string): ParsedGitHubUrl | null {
  const match = url.match(GITHUB_URL_PATTERN);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}
