import { SVGAttributes, forwardRef } from "react";

interface IconProps extends SVGAttributes<SVGSVGElement> {
  size?: number | string;
}

function createIcon(paths: React.ReactNode) {
  return forwardRef<SVGSVGElement, IconProps>(
    ({ size = 24, className = "", children, ...props }, ref) => (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
      >
        {paths}
        {children}
      </svg>
    )
  );
}

export const XIcon = createIcon([
  <line key="1" x1="18" y1="6" x2="6" y2="18" />,
  <line key="2" x1="6" y1="6" x2="18" y2="18" />,
]);

export const CheckIcon = createIcon([
  <polyline key="1" points="20 6 9 17 4 12" />,
]);

export const AlertCircleIcon = createIcon([
  <circle key="1" cx="12" cy="12" r="10" />,
  <line key="2" x1="12" y1="8" x2="12" y2="12" />,
  <line key="3" x1="12" y1="16" x2="12.01" y2="16" />,
]);

export const InfoIcon = createIcon([
  <circle key="1" cx="12" cy="12" r="10" />,
  <line key="2" x1="12" y1="16" x2="12" y2="12" />,
  <line key="3" x1="12" y1="8" x2="12.01" y2="8" />,
]);

export const ChevronDownIcon = createIcon([
  <polyline key="1" points="6 9 12 15 18 9" />,
]);

export const ChevronRightIcon = createIcon([
  <polyline key="1" points="9 18 15 12 9 6" />,
]);

export const LoaderIcon = createIcon([
  <path key="1" d="M21 12a9 9 0 11-6.219-8.56" />,
]);

export const FileIcon = createIcon([
  <path key="1" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />,
  <polyline key="2" points="14 2 14 8 20 8" />,
]);

export const FolderIcon = createIcon([
  <path key="1" d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />,
]);

export const SearchIcon = createIcon([
  <circle key="1" cx="11" cy="11" r="8" />,
  <line key="2" x1="21" y1="21" x2="16.65" y2="16.65" />,
]);

export const SettingsIcon = createIcon([
  <circle key="1" cx="12" cy="12" r="3" />,
  <path key="2" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />,
]);

export const PlayIcon = createIcon([
  <polygon key="1" points="5 3 19 12 5 21 5 3" />,
]);

export const PauseIcon = createIcon([
  <rect key="1" x="6" y="4" width="4" height="16" />,
  <rect key="2" x="14" y="4" width="4" height="16" />,
]);

export const ArrowRightIcon = createIcon([
  <line key="1" x1="5" y1="12" x2="19" y2="12" />,
  <polyline key="2" points="12 5 19 12 12 19" />,
]);

export const CopyIcon = createIcon([
  <rect key="1" x="9" y="9" width="13" height="13" rx="2" ry="2" />,
  <path key="2" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />,
]);

export const EyeIcon = createIcon([
  <path key="1" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />,
  <circle key="2" cx="12" cy="12" r="3" />,
]);

export const EyeOffIcon = createIcon([
  <path key="1" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />,
  <line key="2" x1="1" y1="1" x2="23" y2="23" />,
]);

export const TrashIcon = createIcon([
  <polyline key="1" points="3 6 5 6 21 6" />,
  <path key="2" d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />,
]);

export const EditIcon = createIcon([
  <path key="1" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />,
  <path key="2" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />,
]);

export const DownloadIcon = createIcon([
  <path key="1" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />,
  <polyline key="2" points="7 10 12 15 17 10" />,
  <line key="3" x1="12" y1="15" x2="12" y2="3" />,
]);

export const UploadIcon = createIcon([
  <path key="1" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />,
  <polyline key="2" points="17 8 12 3 7 8" />,
  <line key="3" x1="12" y1="3" x2="12" y2="15" />,
]);

export const GitBranchIcon = createIcon([
  <line key="1" x1="6" y1="3" x2="6" y2="15" />,
  <circle key="2" cx="18" cy="6" r="3" />,
  <circle key="3" cx="6" cy="18" r="3" />,
  <path key="4" d="M18 9a9 9 0 01-9 9" />,
]);

export const TerminalIcon = createIcon([
  <polyline key="1" points="4 17 10 11 4 5" />,
  <line key="2" x1="12" y1="19" x2="20" y2="19" />,
]);

export const DatabaseIcon = createIcon([
  <ellipse key="1" cx="12" cy="5" rx="9" ry="3" />,
  <path key="2" d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />,
  <path key="3" d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />,
]);

export const CodeIcon = createIcon([
  <polyline key="1" points="16 18 22 12 16 6" />,
  <polyline key="2" points="8 6 2 12 8 18" />,
]);

export const GlobeIcon = createIcon([
  <circle key="1" cx="12" cy="12" r="10" />,
  <line key="2" x1="2" y1="12" x2="22" y2="12" />,
  <path key="3" d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />,
]);

export const BellIcon = createIcon([
  <path key="1" d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />,
  <path key="2" d="M13.73 21a2 2 0 01-3.46 0" />,
]);

export const UserIcon = createIcon([
  <path key="1" d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" />,
  <circle key="2" cx="12" cy="7" r="4" />,
]);

export const MenuIcon = createIcon([
  <line key="1" x1="3" y1="12" x2="21" y2="12" />,
  <line key="2" x1="3" y1="6" x2="21" y2="6" />,
  <line key="3" x1="3" y1="18" x2="21" y2="18" />,
]);

export const SunIcon = createIcon([
  <circle key="1" cx="12" cy="12" r="5" />,
  <line key="2" x1="12" y1="1" x2="12" y2="3" />,
  <line key="3" x1="12" y1="21" x2="12" y2="23" />,
  <line key="4" x1="4.22" y1="4.22" x2="5.64" y2="5.64" />,
  <line key="5" x1="18.36" y1="18.36" x2="19.78" y2="19.78" />,
  <line key="6" x1="1" y1="12" x2="3" y2="12" />,
  <line key="7" x1="21" y1="12" x2="23" y2="12" />,
  <line key="8" x1="4.22" y1="19.78" x2="5.64" y2="18.36" />,
  <line key="9" x1="18.36" y1="5.64" x2="19.78" y2="4.22" />,
]);

export const MoonIcon = createIcon([
  <path key="1" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />,
]);

export const SparklesIcon = createIcon([
  <path key="1" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />,
]);

export const ShieldIcon = createIcon([
  <path key="1" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
]);

export const KeyIcon = createIcon([
  <path key="1" d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3" />,
]);

export const LockIcon = createIcon([
  <rect key="1" x="3" y="11" width="18" height="11" rx="2" ry="2" />,
  <path key="2" d="M7 11V7a5 5 0 0110 0v4" />,
]);

export const UnlockIcon = createIcon([
  <rect key="1" x="3" y="11" width="18" height="11" rx="2" ry="2" />,
  <path key="2" d="M7 11V7a5 5 0 0110 0v4" />,
  <line key="3" x1="9.12" y1="9.12" x2="14.88" y2="14.88" />,
]);

export const LinkIcon = createIcon([
  <path key="1" d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />,
  <path key="2" d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />,
]);

export const ExternalLinkIcon = createIcon([
  <path key="1" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />,
  <polyline key="2" points="15 3 21 3 21 9" />,
  <line key="3" x1="10" y1="14" x2="21" y2="3" />,
]);

export const ShareIcon = createIcon([
  <circle key="1" cx="18" cy="5" r="3" />,
  <circle key="2" cx="6" cy="12" r="3" />,
  <circle key="3" cx="18" cy="19" r="3" />,
  <line key="4" x1="8.59" y1="13.51" x2="15.42" y2="6.49" />,
  <line key="5" x1="15.41" y1="6.51" x2="8.59" y2="13.49" />,
]);

export const GithubIcon = createIcon([
  <path key="1" d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />,
]);

export const ArrowLeftIcon = createIcon([
  <line key="1" x1="19" y1="12" x2="5" y2="12" />,
  <polyline key="2" points="12 19 5 12 12 5" />,
]);

export const MinusIcon = createIcon([
  <line key="1" x1="5" y1="12" x2="19" y2="12" />,
]);

export const PlusIcon = createIcon([
  <line key="1" x1="12" y1="5" x2="12" y2="19" />,
  <line key="2" x1="5" y1="12" x2="19" y2="12" />,
]);

export const CircleIcon = createIcon([
  <circle key="1" cx="12" cy="12" r="10" />,
]);

export const CheckCircleIcon = createIcon([
  <path key="1" d="M22 11.08V12a10 10 0 11-5.93-9.14" />,
  <polyline key="2" points="22 4 12 14.01 9 11.01" />,
]);

export const AlertTriangleIcon = createIcon([
  <path key="1" d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />,
  <line key="2" x1="12" y1="9" x2="12" y2="13" />,
  <line key="3" x1="12" y1="17" x2="12.01" y2="17" />,
]);

export const ClockIcon = createIcon([
  <circle key="1" cx="12" cy="12" r="10" />,
  <polyline key="2" points="12 6 12 12 16 14" />,
]);