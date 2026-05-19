import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import type { User } from "../../types/social";

interface SearchBarProps {
  query: string;
  onChange: (value: string) => void;
  results: User[];
  onSelect: (username: string) => void;
}

export function SearchBar({ query, onChange, results, onSelect }: SearchBarProps) {
  const showDropdown = query.trim().length > 0;

  return (
    <div className="relative">
      <div className="glass-panel flex items-center gap-3 rounded-[1.8rem] px-4 py-3 shadow-soft">
        <Search className="h-5 w-5 text-muted" />
        <input
          value={query}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search by username..."
          className="w-full bg-transparent text-sm text-text outline-none placeholder:text-muted"
        />
      </div>
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 8 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass-panel-strong absolute inset-x-0 top-full z-20 mt-2 rounded-[1.8rem] p-3 shadow-glow"
          >
            {results.length > 0 ? (
              <div className="space-y-2">
                {results.slice(0, 5).map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => onSelect(user.username)}
                    className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition hover:bg-white/70"
                  >
                    <div>
                      <p className="text-sm font-semibold text-text">@{user.username}</p>
                      <p className="text-xs text-muted">{user.fullName}</p>
                    </div>
                    <span className="text-xs font-medium text-primary">Open</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="px-3 py-4 text-sm text-muted">No matching users yet.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

