import { ImagePlus, Send, Wallpaper } from "lucide-react";
import { useMemo, useState } from "react";
import type { Conversation, User } from "../../types/social";
import { chatThemes, findChatTheme } from "../../lib/themes";
import { Avatar } from "../common/Avatar";
import { MessageBubble } from "./MessageBubble";

interface ChatWindowProps {
  conversation: Conversation;
  users: User[];
  currentUserId: number;
  globalThemeId?: string;
  globalThemeBackground?: string | null;
  onSend: (text: string, file?: File | null) => Promise<void> | void;
  onSeen: () => void;
  onThemeChange: (themeId: string) => Promise<void> | void;
}

export function ChatWindow({
  conversation,
  users,
  currentUserId,
  globalThemeId,
  globalThemeBackground,
  onSend,
  onSeen,
  onThemeChange
}: ChatWindowProps) {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showThemes, setShowThemes] = useState(false);
  const otherUser = useMemo(
    () => users.find((user) => conversation.participantIds.includes(user.id) && user.id !== currentUserId),
    [users, conversation.participantIds, currentUserId]
  );

  const resolvedTheme =
    conversation.customThemeUrl?.trim()
      ? { ...findChatTheme(conversation.themeId), background: conversation.customThemeUrl }
      : globalThemeBackground?.trim()
        ? { ...findChatTheme(globalThemeId), background: globalThemeBackground }
        : findChatTheme(conversation.themeId || globalThemeId || chatThemes[0].id);

  if (!otherUser) {
    return null;
  }

  async function submitMessage() {
    if (!message.trim() && !selectedFile) {
      return;
    }
    await onSend(message, selectedFile);
    setMessage("");
    setSelectedFile(null);
  }

  return (
    <div className="glass-panel flex h-[72vh] flex-col rounded-[2rem] shadow-soft">
      <div className="flex items-center justify-between gap-3 border-b border-white/60 px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={otherUser.fullName} gradient={otherUser.avatarGradient} imageUrl={otherUser.profileImage} size="md" ring />
          <div>
            <p className="text-sm font-semibold text-text">{otherUser.nickname || otherUser.fullName}</p>
            <p className="text-xs text-muted">
              {conversation.status === "pending" ? "Message request pending" : otherUser.isOnline ? "Online now" : "Last seen recently"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowThemes((value) => !value)}
          className="rounded-2xl border border-white/70 bg-white/80 p-3 text-text"
        >
          <Wallpaper className="h-4 w-4" />
        </button>
      </div>
      {showThemes ? (
        <div className="flex gap-2 overflow-x-auto border-b border-white/60 px-5 py-3">
          {chatThemes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => {
                void onThemeChange(theme.id);
                setShowThemes(false);
              }}
              className="min-w-[110px] rounded-2xl border border-white/70 bg-white/80 p-2 text-left"
            >
              <div className={`h-12 rounded-xl bg-gradient-to-br ${theme.preview}`} />
              <p className="mt-2 text-xs font-semibold text-text">{theme.label}</p>
            </button>
          ))}
        </div>
      ) : null}
      <div
        className="flex-1 space-y-4 overflow-y-auto px-5 py-5"
        style={{ background: resolvedTheme.background }}
        onMouseEnter={onSeen}
      >
        {conversation.messages.map((entry) => {
          const sender = users.find((user) => user.id === entry.senderId);
          if (!sender) {
            return null;
          }
          return (
            <MessageBubble
              key={entry.id}
              message={entry}
              sender={sender}
              isOwn={entry.senderId === currentUserId}
            />
          );
        })}
        {message.trim() ? (
          <div className="flex justify-end">
            <div className="rounded-full border border-white/70 bg-white/70 px-3 py-2 text-xs text-muted">
              typing...
            </div>
          </div>
        ) : null}
      </div>
      <div className="border-t border-white/60 px-5 py-4">
        {selectedFile ? (
          <div className="mb-3 flex items-center justify-between rounded-[1.4rem] bg-white/80 px-4 py-3 text-sm">
            <span className="truncate text-muted">{selectedFile.name}</span>
            <button type="button" onClick={() => setSelectedFile(null)} className="text-primary">
              Remove
            </button>
          </div>
        ) : null}
        <div className="flex items-center gap-3 rounded-[1.6rem] bg-white/80 p-2">
          <label className="rounded-2xl border border-white/70 bg-white px-3 py-3 text-text">
            <ImagePlus className="h-4 w-4" />
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={conversation.status === "pending" ? "Send a first message request..." : "Type a message..."}
            className="w-full rounded-2xl bg-transparent px-3 py-2 text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => void submitMessage()}
            aria-label="Send message"
            className="rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-500 px-4 py-3 text-white shadow-glow"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
