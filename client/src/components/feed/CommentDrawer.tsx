import { AnimatePresence, motion } from "framer-motion";
import { Send, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Post, User } from "../../types/social";
import { Avatar } from "../common/Avatar";
import { useAuth } from "../../contexts/AuthContext";
import { timeAgo } from "../../lib/format";

interface CommentDrawerProps {
  post: Post;
  users: User[];
  open: boolean;
  onClose: () => void;
}

export function CommentDrawer({ post, users, open, onClose }: CommentDrawerProps) {
  const [comment, setComment] = useState("");
  const { addComment } = useAuth();
  const comments = useMemo(() => post.comments, [post.comments]);

  function submitComment() {
    const didAdd = addComment(post.id, comment);
    if (didAdd) {
      setComment("");
    }
  }

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
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[80vh] w-full max-w-2xl rounded-t-[2rem] bg-white/90 p-5 shadow-2xl backdrop-blur-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="headline-font text-lg font-semibold text-text">Comments</h3>
                <p className="text-sm text-muted">Join the conversation around this post.</p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close comments" className="rounded-full bg-white/80 p-2 text-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 overflow-y-auto pr-1">
              {comments.map((entry) => {
                const user = users.find((item) => item.id === entry.userId);
                if (!user) {
                  return null;
                }
                return (
                  <div key={entry.id} className="flex gap-3 rounded-2xl bg-white/75 p-3">
                    <Avatar name={user.fullName} gradient={user.avatarGradient} imageUrl={user.profileImage} size="sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-text">{user.username}</p>
                        <span className="text-xs text-muted">{timeAgo(entry.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-muted">{entry.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-[1.6rem] bg-white/80 p-2">
              <input
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Write something kind..."
                className="w-full rounded-2xl bg-transparent px-3 py-2 text-sm outline-none"
              />
              <button
                type="button"
                onClick={submitComment}
                aria-label="Send comment"
                className="rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
