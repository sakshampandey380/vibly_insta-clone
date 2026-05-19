import { Clapperboard, Home, MessageCircle, PlusSquare, Search, User2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "../../lib/cn";

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, requireAuth } = useAuth();

  const items = [
    { label: "Home", icon: Home, action: () => navigate("/"), active: location.pathname === "/" },
    { label: "Search", icon: Search, action: () => navigate("/search"), active: location.pathname.startsWith("/search") },
    { label: "Reels", icon: Clapperboard, action: () => navigate("/reels"), active: location.pathname.startsWith("/reels") },
    {
      label: "Create",
      icon: PlusSquare,
      action: () => {
        if (requireAuth("Please login or create an account to upload a post.", "/create")) {
          navigate("/create");
        }
      },
      active: location.pathname.startsWith("/create")
    },
    {
      label: "Messages",
      icon: MessageCircle,
      action: () => {
        if (requireAuth("Please login or create an account to open messages.", "/messages")) {
          navigate("/messages");
        }
      },
      active: location.pathname.startsWith("/messages")
    },
    {
      label: "Profile",
      icon: User2,
      action: () => {
        if (!currentUser) {
          requireAuth("Please login or create an account to open your profile.", "/profile");
          return;
        }
        navigate(`/${currentUser.username}`);
      },
      active: currentUser ? location.pathname === `/${currentUser.username}` : false
    }
  ];

  return (
    <div className="fixed inset-x-3 bottom-4 z-40 lg:hidden">
      <div className="glass-panel grid grid-cols-6 rounded-[1.8rem] px-2 py-2">
        {items.map((item) => (
          <motion.button
            key={item.label}
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={item.action}
            className={cn(
              "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium text-muted transition",
              item.active && "bg-white/80 text-primary shadow-soft"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
