import { Play } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { Post } from "../../types/social";
import { MediaLightbox } from "../common/MediaLightbox";

export function PostGrid({ posts }: { posts: Post[] }) {
  const [previewPost, setPreviewPost] = useState<Post | null>(null);

  function openPreview(post: Post) {
    if (!post.mediaUrl) {
      return;
    }
    setPreviewPost(post);
  }

  function openHoverPreview(post: Post) {
    if (
      post.mediaType === "image" &&
      post.mediaUrl &&
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover)").matches
    ) {
      setPreviewPost(post);
    }
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <motion.div key={post.id} whileHover={{ y: -4 }} className="glass-panel rounded-[1.8rem] p-3 shadow-soft">
            <button
              type="button"
              onClick={() => openPreview(post)}
              onMouseEnter={() => openHoverPreview(post)}
              className={`relative block h-64 w-full overflow-hidden rounded-[1.4rem] bg-gradient-to-br ${post.mediaGradient} text-left`}
            >
              <div className="absolute inset-0 bg-slate-950/72" />
              {post.mediaType === "image" && post.mediaUrl ? (
                <img src={post.mediaUrl} alt={post.mediaLabel} className="h-full w-full object-contain" />
              ) : null}
              {post.mediaType === "video" && (post.thumbnailUrl || post.mediaUrl) ? (
                <img src={post.thumbnailUrl || post.mediaUrl} alt={post.mediaLabel} className="h-full w-full object-contain" />
              ) : null}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.7),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.24),transparent_30%)]" />
              {post.mediaType === "video" && (
                <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md">
                  <Play className="ml-0.5 h-4 w-4" />
                </div>
              )}
              <div className="absolute inset-x-4 bottom-4">
                <p className="text-xs uppercase tracking-[0.28em] text-white/80">Vibly post</p>
                <p className="headline-font mt-1 text-xl font-semibold text-white">{post.mediaLabel}</p>
              </div>
            </button>
          </motion.div>
        ))}
      </div>
      <MediaLightbox
        open={Boolean(previewPost)}
        onClose={() => setPreviewPost(null)}
        mediaType={previewPost?.mediaType ?? "image"}
        src={previewPost?.mediaUrl}
        poster={previewPost?.thumbnailUrl ?? null}
        title={previewPost?.title || previewPost?.mediaLabel || "Post preview"}
        description={previewPost?.caption}
      />
    </>
  );
}
