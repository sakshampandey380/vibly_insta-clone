import { MoreHorizontal, PencilLine, Play, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Post, User } from "../../types/social";
import { useAuth } from "../../contexts/AuthContext";
import { formatCompactNumber, timeAgo } from "../../lib/format";
import { Avatar } from "../common/Avatar";
import { MediaLightbox } from "../common/MediaLightbox";
import { CommentDrawer } from "./CommentDrawer";
import { ProfilePreviewTrigger } from "../profile/ProfilePreviewTrigger";
import { ReactionBar } from "./ReactionBar";
import { ShareModal } from "./ShareModal";

interface PostCardProps {
  post: Post;
  users: User[];
}

export function PostCard({ post, users }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toggleLike, toggleSave, deletePost } = useAuth();

  const user = useMemo(() => users.find((entry) => entry.id === post.userId), [users, post.userId]);
  if (!user) {
    return null;
  }

  function handleOpenPreview() {
    if (!post.mediaUrl) {
      return;
    }
    setShowPreview(true);
  }

  function handleHoverPreview() {
    if (
      post.mediaType === "image" &&
      post.mediaUrl &&
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover)").matches
    ) {
      setShowPreview(true);
    }
  }

  return (
    <>
      <motion.article
        layout
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        className="glass-panel group relative overflow-hidden rounded-[2rem] p-4 shadow-soft"
      >
        <div className="mb-4 flex items-center justify-between">
          <ProfilePreviewTrigger user={user}>
            <Link to={`/${user.username}`} className="flex items-center gap-3">
              <Avatar name={user.fullName} gradient={user.avatarGradient} imageUrl={user.profileImage} size="md" ring />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-text">{user.username}</p>
                  {user.isVerified && <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-700">Verified</span>}
                  {user.profileType === "private" && <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-muted">Private</span>}
                </div>
                <p className="text-xs text-muted">
                  {post.location ?? user.location} - {timeAgo(post.createdAt)}
                </p>
              </div>
            </Link>
          </ProfilePreviewTrigger>
          <button
            type="button"
            aria-label="Open post options"
            onClick={() => setShowManage((value) => !value)}
            className="rounded-full bg-white/75 p-2 text-muted transition hover:text-text"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleOpenPreview}
          onMouseEnter={handleHoverPreview}
          aria-label="Open post preview"
          className={`relative block h-[320px] w-full overflow-hidden rounded-[1.7rem] bg-gradient-to-br ${post.mediaGradient} text-left transition duration-500 group-hover:scale-[1.01] md:h-[420px]`}
        >
          <div className="absolute inset-0 bg-slate-950/72" />
          {post.mediaType === "image" && post.mediaUrl ? (
            <img src={post.mediaUrl} alt={post.mediaLabel} className="h-full w-full object-contain" />
          ) : null}
          {post.mediaType === "video" && post.mediaUrl ? (
            <video
              src={post.mediaUrl}
              poster={post.thumbnailUrl ?? undefined}
              className="h-full w-full object-contain"
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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.72),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.22),transparent_30%)]" />
          {post.mediaType === "image" && (
            <div className="absolute right-5 top-5 rounded-full bg-black/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-md">
              Hover to preview
            </div>
          )}
          <div className="absolute inset-x-5 bottom-5 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">Vibly capture</p>
              <h3 className="headline-font mt-2 text-2xl font-semibold text-white">{post.mediaLabel}</h3>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-white/85">
                {post.mediaName ? <span className="rounded-full bg-black/20 px-3 py-1">{post.mediaName}</span> : null}
                {post.mediaSizeLabel ? <span className="rounded-full bg-black/20 px-3 py-1">{post.mediaSizeLabel}</span> : null}
                {post.durationLabel ? <span className="rounded-full bg-black/20 px-3 py-1">{post.durationLabel}</span> : null}
              </div>
            </div>
            {post.mediaType === "video" && (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                <Play className="ml-1 h-5 w-5 text-white" />
              </div>
            )}
          </div>
        </button>

        <div className="mt-4 flex items-center justify-between gap-3">
          <ReactionBar
            liked={post.likedByUser}
            saved={post.savedByUser}
            onLike={() => toggleLike(post.id)}
            onComment={() => setShowComments(true)}
            onShare={() => setShowShare(true)}
            onSave={() => toggleSave(post.id)}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowReactions((value) => !value)}
              className="rounded-2xl border border-white/70 bg-white/75 px-4 py-2 text-sm font-medium text-muted transition hover:-translate-y-0.5 hover:text-text"
            >
              Reactions
            </button>
            <Link
              to={`/posts/${post.id}`}
              className="rounded-2xl border border-white/70 bg-white/75 px-4 py-2 text-sm font-medium text-muted transition hover:-translate-y-0.5 hover:text-text"
            >
              View
            </Link>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-sm font-semibold text-text">{formatCompactNumber(post.likes)} likes</p>
          <p className="text-sm leading-6 text-muted">
            <span className="mr-2 font-semibold text-text">{user.username}</span>
            {post.caption}
          </p>
          {post.comments[0] && (
            <button
              type="button"
              onClick={() => setShowComments(true)}
              className="text-left text-sm text-muted transition hover:text-text"
            >
              View comments - "{post.comments[0].text}"
            </button>
          )}
        </div>

        {post.isOwn && showManage && (
          <div className="mt-4 flex flex-wrap gap-2 rounded-[1.4rem] border border-white/70 bg-white/80 p-3">
            <Link
              to={`/create?editPost=${post.id}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-text shadow-soft"
            >
              <PencilLine className="h-4 w-4" />
              Edit
            </Link>
            <button
              type="button"
              onClick={() => deletePost(post.id)}
              className="inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        )}

        {showReactions && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-x-4 bottom-24 hidden rounded-[1.6rem] border border-white/70 bg-white/82 p-3 shadow-glow backdrop-blur-xl md:block"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">Quick reactions</p>
              <ReactionBar
                liked={post.likedByUser}
                saved={post.savedByUser}
                onLike={() => toggleLike(post.id)}
                onComment={() => setShowComments(true)}
                onShare={() => setShowShare(true)}
                onSave={() => toggleSave(post.id)}
              />
            </motion.div>
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              className="fixed inset-x-0 bottom-0 z-30 rounded-t-[2rem] bg-white/92 p-4 shadow-2xl backdrop-blur-xl md:hidden"
            >
              <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">Quick reactions</p>
              <ReactionBar
                liked={post.likedByUser}
                saved={post.savedByUser}
                onLike={() => toggleLike(post.id)}
                onComment={() => setShowComments(true)}
                onShare={() => setShowShare(true)}
                onSave={() => toggleSave(post.id)}
              />
              <button type="button" onClick={() => setShowReactions(false)} className="mt-3 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm font-semibold text-text">
                Close
              </button>
            </motion.div>
          </>
        )}
      </motion.article>
      <MediaLightbox
        open={showPreview}
        onClose={() => setShowPreview(false)}
        mediaType={post.mediaType}
        src={post.mediaUrl}
        poster={post.thumbnailUrl ?? null}
        title={post.title || post.mediaLabel}
        description={post.caption}
      />
      <CommentDrawer post={post} users={users} open={showComments} onClose={() => setShowComments(false)} />
      <ShareModal post={post} open={showShare} onClose={() => setShowShare(false)} />
    </>
  );
}
