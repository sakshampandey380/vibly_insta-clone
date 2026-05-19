import { cn } from "../../lib/cn";

interface LogoProps {
  compact?: boolean;
  showTagline?: boolean;
  className?: string;
}

export function Logo({ compact = false, showTagline = false, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="glass-panel-strong relative flex h-14 w-14 items-center justify-center rounded-[1.6rem]">
        <div className="absolute inset-1 rounded-[1.35rem] bg-gradient-to-br from-white/80 via-sky-100/70 to-fuchsia-100/80" />
        <div className="relative flex items-center justify-center">
          <div className="absolute -left-3 -top-3 h-2 w-2 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500" />
          <div className="absolute -right-3 -top-1 h-2 w-2 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-500" />
          <div className="absolute top-[-0.7rem] h-2 w-2 rotate-45 rounded-sm bg-gradient-to-br from-violet-400 to-indigo-500" />
          <div className="h-8 w-5 -rotate-[28deg] rounded-full bg-gradient-to-b from-sky-300 to-indigo-600 opacity-90 blur-[0.2px]" />
          <div className="-ml-1 h-8 w-5 rotate-[28deg] rounded-full bg-gradient-to-b from-pink-300 to-fuchsia-500 opacity-90 blur-[0.2px]" />
        </div>
      </div>
      {!compact && (
        <div>
          <div className="headline-font bg-gradient-to-r from-indigo-600 via-violet-500 to-pink-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
            Vibly
          </div>
          {showTagline && <p className="text-xs text-muted">Share your vibe. Find your people.</p>}
        </div>
      )}
    </div>
  );
}

