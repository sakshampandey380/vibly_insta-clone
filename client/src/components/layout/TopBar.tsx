import { Bell, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Logo } from "../common/Logo";

export function TopBar() {
  const navigate = useNavigate();
  const { requireAuth } = useAuth();

  return (
    <div className="sticky top-0 z-40 border-b border-white/50 bg-white/45 px-4 py-4 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <button type="button" onClick={() => navigate("/")}>
          <Logo compact />
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/search")}
            aria-label="Open search"
            className="glass-panel flex h-11 w-11 items-center justify-center rounded-2xl text-muted"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (requireAuth("Please login or create an account to view notifications.", "/notifications")) {
                navigate("/notifications");
              }
            }}
            aria-label="Open notifications"
            className="glass-panel flex h-11 w-11 items-center justify-center rounded-2xl text-muted"
          >
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
