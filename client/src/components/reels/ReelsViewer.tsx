import { Bookmark, Heart, MessageCircle, PencilLine, Play, Send, Trash2 } from "lucide-react";
import type { Reel, User } from "../../types/social";
import { formatCompactNumber } from "../../lib/format";
import { Avatar } from "../common/Avatar";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { ProfilePreviewTrigger } from "../profile/ProfilePreviewTrigger";

interface ReelsViewerProps {
  reels: Reel[];
  users: User[];
}

export function ReelsViewer({ reels, users }: ReelsViewerProps) {
  const { requireAuth, deleteReel } = useAuth();

  return (
    <div className="snap-y snap-mandatory space-y-5">
      {reels.map((reel) => {
        const user = users.find((entry) => entry.id === reel.userId);
        if (!user) {
          return null;
        }

        return (
          <section
            key={reel.id}
            className={`glass-panel snap-start overflow-hidden rounded-[2rem] p-4 shadow-soft`}
          >
            <div className={`group relative flex h-[72vh] overflow-hidden rounded-[1.8rem] bg-gradient-to-br ${reel.mediaGradient}`}>
              <div className="absolute inset-0 bg-slate-950/74" />
              {reel.thumbnailUrl ? (
                <img src={reel.thumbnailUrl} alt={reel.title || reel.caption} className="absolute inset-0 h-full w-full object-contain transition duration-300 group-hover:opacity-0" />
              ) : null}
              {reel.videoUrl ? (
                <video
                  src={reel.videoUrl}
                  poster={reel.thumbnailUrl ?? undefined}
                  className="absolute inset-0 h-full w-full object-contain"
                  muted
                  loop
                  playsInline
                  onMouseEnter={(event) => {
                    void event.currentTarget.play().catch(() => undefined);
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.pause();
                    event.currentTarget.currentTime = 0;
                  }}
                />
              ) : null}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.4),transparent_30%),linear-gradient(0deg,rgba(10,15,30,0.55),transparent_55%)]" />
              <ProfilePreviewTrigger user={user}>
                <Link to={`/${user.username}`} className="absolute left-5 top-5 flex items-center gap-3">
                  <Avatar name={user.fullName} gradient={user.avatarGradient} imageUrl={user.profileImage} size="md" ring />
                  <div>
                    <p className="text-sm font-semibold text-white">@{user.username}</p>
                    <p className="text-xs text-white/80">{reel.audioName}</p>
                  </div>
                </Link>
              </ProfilePreviewTrigger>
              <div className="absolute right-5 top-1/2 flex -translate-y-1/2 flex-col gap-3">
                {[
                  { icon: Heart, label: formatCompactNumber(reel.likes) },
                  { icon: MessageCircle, label: formatCompactNumber(reel.comments) },
                  { icon: Send, label: formatCompactNumber(reel.shares) },
                  { icon: Bookmark, label: "Save" }
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => requireAuth()}
                    className="flex flex-col items-center gap-2 rounded-2xl bg-white/14 px-3 py-3 text-white backdrop-blur-lg"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-[11px] font-medium">{item.label}</span>
                  </button>
                ))}
                {reel.isOwn && (
                  <>
                    <Link to={`/create?editReel=${reel.id}`} className="flex flex-col items-center gap-2 rounded-2xl bg-white/14 px-3 py-3 text-white backdrop-blur-lg">
                      <PencilLine className="h-5 w-5" />
                      <span className="text-[11px] font-medium">Edit</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => deleteReel(reel.id)}
                      className="flex flex-col items-center gap-2 rounded-2xl bg-rose-500/30 px-3 py-3 text-white backdrop-blur-lg"
                    >
                      <Trash2 className="h-5 w-5" />
                      <span className="text-[11px] font-medium">Delete</span>
                    </button>
                  </>
                )}
              </div>
              <div className="absolute left-5 right-20 bottom-5">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/18 text-white backdrop-blur-lg">
                  <Play className="ml-1 h-5 w-5" />
                </div>
                <p className="headline-font text-2xl font-semibold text-white">{reel.title || reel.caption}</p>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/85">
                  {reel.caption}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/85">
                  {reel.mediaName ? <span className="rounded-full bg-black/20 px-3 py-1">{reel.mediaName}</span> : null}
                  {reel.mediaSizeLabel ? <span className="rounded-full bg-black/20 px-3 py-1">{reel.mediaSizeLabel}</span> : null}
                  {reel.durationLabel ? <span className="rounded-full bg-black/20 px-3 py-1">{reel.durationLabel}</span> : null}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
