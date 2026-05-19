import { motion } from "framer-motion";
import type { ConversationMessage, User } from "../../types/social";
import { timeAgo } from "../../lib/format";

interface MessageBubbleProps {
  message: ConversationMessage;
  isOwn: boolean;
  sender: User;
}

export function MessageBubble({ message, isOwn, sender }: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: isOwn ? 14 : -14 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] rounded-[1.6rem] px-4 py-3 text-sm shadow-soft ${
          isOwn
            ? "bg-gradient-to-r from-indigo-600 to-pink-500 text-white"
            : "border border-white/70 bg-white/80 text-text"
        }`}
      >
        {!isOwn && <p className="mb-1 text-xs font-semibold text-primary">{sender.username}</p>}
        {message.text ? <p className="leading-6">{message.text}</p> : null}
        {message.mediaUrl ? (
          <div className="mt-2 overflow-hidden rounded-[1.2rem] bg-black/10">
            {message.mediaType === "video" ? (
              <video src={message.mediaUrl} controls className="max-h-72 w-full object-cover" />
            ) : (
              <img src={message.mediaUrl} alt="Shared message media" className="max-h-72 w-full object-cover" />
            )}
          </div>
        ) : null}
        <p className={`mt-1 text-[11px] ${isOwn ? "text-white/80" : "text-muted"}`}>
          {timeAgo(message.createdAt)}
          {isOwn && message.status ? ` • ${message.status}` : ""}
        </p>
      </div>
    </motion.div>
  );
}
