import { Bell, Clapperboard, Home, LogOut, MessageCircle, PlusSquare, Search, Settings, User2 } from "lucide-react";
import { motion } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import { Logo } from "../common/Logo";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "../../lib/cn";

const publicItems = [
  { label: "Home", icon: Home, to: "/" },
  { label: "Search", icon: Search, to: "/search" },
  { label: "Reels", icon: Clapperboard, to: "/reels" }
];

const protectedItems = [
  { label: "Messages", icon: MessageCircle, to: "/messages" },
  { label: "Notifications", icon: Bell, to: "/notifications" },
  { label: "Create", icon: PlusSquare, to: "/create" },
  { label: "Profile", icon: User2, to: "/profile" },
  { label: "Settings", icon: Settings, to: "/settings" }
];

export function Sidebar() {
  const navigate = useNavigate();
  const { currentUser, logout, requireAuth } = useAuth();

  function handleProtectedNavigate(path: string) {
    if (path === "/profile") {
      if (!currentUser) {
        requireAuth("Please login or create an account to open your profile.", "/profile");
        return;
      }
      navigate(`/${currentUser.username}`);
      return;
    }

    if (!currentUser && requireAuth(undefined, path) === false) {
      return;
    }

    navigate(path);
  }

  return (
    <div className="glass-panel sticky top-6 flex h-[calc(100vh-3rem)] flex-col rounded-[2rem] p-5">
      <Logo showTagline />
      <div className="mt-8 space-y-2">
        {publicItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted transition hover:bg-white/70 hover:text-text",
                isActive && "bg-white/80 text-text shadow-soft"
              )
            }
          >
            <item.icon className="h-5 w-5 transition group-hover:scale-110 group-hover:text-primary" />
            {item.label}
          </NavLink>
        ))}
        {protectedItems.map((item) => (
          <motion.button
            key={item.label}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => handleProtectedNavigate(item.to)}
            className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-muted transition hover:bg-white/70 hover:text-text"
          >
            <item.icon className="h-5 w-5 transition group-hover:scale-110 group-hover:text-primary" />
            {item.label}
          </motion.button>
        ))}
      </div>

      <div className="mt-auto space-y-4">
        {currentUser ? (
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/75 px-4 py-3 text-sm font-semibold text-text transition hover:-translate-y-0.5"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        ) : (
          <div className="rounded-[1.8rem] bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-400 p-[1px]">
            <div className="rounded-[1.72rem] bg-white/85 p-4">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
              >
                Login to create
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
