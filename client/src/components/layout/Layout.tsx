import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { MobileBottomNav } from "./MobileBottomNav";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface LayoutProps {
  children: ReactNode;
  rightPanel?: ReactNode;
}

export function Layout({ children, rightPanel }: LayoutProps) {
  const { activeAppBackground } = useAuth();

  return (
    <div
      className="mesh-orb min-h-screen"
      style={{
        background: activeAppBackground,
        backgroundAttachment: "fixed"
      }}
    >
      <TopBar />
      <div className="mx-auto flex w-full max-w-[1540px] gap-6 px-3 pb-28 pt-4 sm:px-5 lg:px-6 xl:pt-6">
        <aside className="hidden w-[282px] shrink-0 lg:block">
          <Sidebar />
        </aside>
        <motion.main
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="min-w-0 flex-1"
        >
          {children}
        </motion.main>
        {rightPanel && <aside className="hidden w-[340px] shrink-0 xl:block">{rightPanel}</aside>}
      </div>
      <MobileBottomNav />
    </div>
  );
}
