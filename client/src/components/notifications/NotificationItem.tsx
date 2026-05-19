import { Bookmark, Heart, MessageCircle, Sparkles, UserPlus2 } from "lucide-react";
import type { Notification, User } from "../../types/social";
import { Avatar } from "../common/Avatar";
import { timeAgo } from "../../lib/format";

const icons = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus2,
  message: MessageCircle,
  save: Bookmark,
  mention: MessageCircle,
  system: Sparkles
};

export function NotificationItem({ notification, actor }: { notification: Notification; actor: User }) {
  const Icon = icons[notification.type];

  return (
    <div className="glass-panel flex items-center gap-4 rounded-[1.8rem] p-4 shadow-soft">
      <Avatar name={actor.fullName} gradient={actor.avatarGradient} size="md" ring />
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-6 text-muted">
          <span className="font-semibold text-text">{actor.username}</span> {notification.text}
        </p>
        <p className="text-xs text-muted">{timeAgo(notification.createdAt)}</p>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-400 text-white">
        <Icon className="h-4 w-4" />
      </div>
    </div>
  );
}
