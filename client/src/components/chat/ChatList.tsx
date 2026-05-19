import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import type { Conversation, User } from "../../types/social";
import { Avatar } from "../common/Avatar";
import { timeAgo } from "../../lib/format";

interface ChatListProps {
  conversations: Conversation[];
  users: User[];
  currentUserId: number;
  activeConversationId?: number;
}

export function ChatList({
  conversations,
  users,
  currentUserId,
  activeConversationId
}: ChatListProps) {
  return (
    <div className="glass-panel rounded-[2rem] p-4 shadow-soft">
      <div className="mb-4">
        <h2 className="headline-font text-xl font-semibold text-text">Messages</h2>
        <p className="text-sm text-muted">Keep the vibe moving in real time.</p>
      </div>
      <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white/75 px-3 py-3">
        <Search className="h-4 w-4 text-muted" />
        <input placeholder="Search chats" className="w-full bg-transparent text-sm outline-none" />
      </div>
      <div className="space-y-2">
        {conversations.map((conversation) => {
          const otherUser = users.find(
            (user) => conversation.participantIds.includes(user.id) && user.id !== currentUserId
          );
          if (!otherUser) {
            return null;
          }
          const isActive = activeConversationId === conversation.id;
          return (
            <Link
              key={conversation.id}
              to={`/messages/${conversation.id}`}
              className={`flex items-center gap-3 rounded-[1.4rem] px-3 py-3 transition ${
                isActive ? "bg-white/85 shadow-soft" : "hover:bg-white/70"
              }`}
            >
              <div className="relative">
                <Avatar name={otherUser.fullName} gradient={otherUser.avatarGradient} imageUrl={otherUser.profileImage} size="md" />
                {otherUser.isOnline && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-text">{otherUser.fullName}</p>
                  <span className="text-[11px] text-muted">{timeAgo(conversation.updatedAt)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm text-muted">{conversation.lastMessage}</p>
                  {conversation.unreadCount ? (
                    <span className="rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {conversation.unreadCount}
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
