import { AnimatePresence, motion } from "framer-motion";
import { Copy, Send, X } from "lucide-react";
import type { Post } from "../../types/social";

interface ShareModalProps {
  post: Post;
  open: boolean;
  onClose: () => void;
}

export function ShareModal({ post, open, onClose }: ShareModalProps) {
  const shareTargets = ["Direct Message", "Close Friends", "Copy Link"];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-slate-900/12 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            className="fixed inset-x-4 top-1/2 z-50 mx-auto w-full max-w-md -translate-y-1/2 rounded-[2rem] p-5 glass-panel-strong"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="headline-font text-lg font-semibold text-text">Share post</h3>
                <p className="text-sm text-muted">Spread this vibe with a quick send.</p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close share modal" className="rounded-full bg-white/70 p-2 text-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="rounded-[1.6rem] bg-white/75 p-4 text-sm text-muted">{post.caption}</div>
            <div className="mt-4 grid gap-3">
              {shareTargets.map((target) => (
                <button
                  key={target}
                  type="button"
                  className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm font-semibold text-text transition hover:-translate-y-0.5"
                >
                  {target}
                  {target === "Copy Link" ? <Copy className="h-4 w-4 text-primary" /> : <Send className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
