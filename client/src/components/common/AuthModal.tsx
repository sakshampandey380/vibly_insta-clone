import { AnimatePresence, motion } from "framer-motion";
import { Lock, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { AlertMessage } from "./AlertMessage";
import { Logo } from "./Logo";

export function AuthModal() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthModalOpen, closeAuthModal, authReason } = useAuth();

  function goTo(path: "/login" | "/signup") {
    closeAuthModal();
    navigate(path, {
      state: {
        from: location.pathname
      }
    });
  }

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-slate-900/18 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuthModal}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <div className="glass-panel-strong relative w-full max-w-lg rounded-[2rem] p-6">
              <button
                type="button"
                onClick={closeAuthModal}
                aria-label="Close authentication modal"
                className="absolute right-5 top-5 rounded-full bg-white/70 p-2 text-muted transition hover:text-text"
              >
                <X className="h-4 w-4" />
              </button>
              <Logo showTagline className="mb-6" />
              <AlertMessage message={authReason ?? "Please login or create an account to continue."} />
              <div className="mt-6 rounded-[1.6rem] bg-white/70 p-5">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-400 text-white shadow-glow">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="headline-font text-2xl font-semibold text-text">Unlock your full vibe</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Public visitors can explore the feed, reels, and profiles. To like, comment, save,
                  follow, message, or create content, you'll need an account.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => goTo("/login")}
                    className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo("/signup")}
                    className="rounded-2xl border border-white/70 bg-white/75 px-4 py-3 text-sm font-semibold text-text transition hover:-translate-y-0.5"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
