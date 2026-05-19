import { Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../../lib/cn";

interface ReactionBarProps {
  liked?: boolean;
  saved?: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
}

const buttonClass =
  "flex items-center gap-2 rounded-2xl border border-white/70 bg-white/75 px-3 py-2 text-sm font-medium text-muted transition hover:-translate-y-0.5 hover:text-text";

export function ReactionBar({
  liked,
  saved,
  onLike,
  onComment,
  onShare,
  onSave
}: ReactionBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={onLike}
        className={cn(buttonClass, liked && "bg-rose-50 text-rose-500")}
      >
        <motion.span animate={liked ? { scale: [1, 1.22, 1] } : { scale: 1 }}>
          <Heart className={cn("h-4 w-4", liked && "fill-current")} />
        </motion.span>
        Like
      </motion.button>
      <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} type="button" onClick={onComment} className={buttonClass}>
        <MessageCircle className="h-4 w-4" />
        Comment
      </motion.button>
      <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} type="button" onClick={onShare} className={buttonClass}>
        <Send className="h-4 w-4" />
        Share
      </motion.button>
      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={onSave}
        className={cn(buttonClass, saved && "bg-amber-50 text-amber-600")}
      >
        <motion.span animate={saved ? { scale: [1, 1.16, 1] } : { scale: 1 }}>
          <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
        </motion.span>
        Save
      </motion.button>
    </div>
  );
}

