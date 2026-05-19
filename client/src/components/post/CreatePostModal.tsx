import { ImagePlus, MapPin, Sparkles, Video } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

interface CreatePostModalProps {
  onSubmit: (payload: { caption: string; location?: string; mediaType: "image" | "video"; mediaLabel: string }) => void;
}

export function CreatePostModal({ onSubmit }: CreatePostModalProps) {
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");

  const mediaLabel = useMemo(
    () => (caption.trim() ? caption.trim().slice(0, 22) : mediaType === "image" ? "New Photo Drop" : "New Motion Drop"),
    [caption, mediaType]
  );

  return (
    <div className="glass-panel rounded-[2rem] p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="headline-font text-2xl font-semibold text-text">Create a new post</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Upload a dreamy image or a short reel preview. The backend is already structured for file uploads.
          </p>
        </div>
        <Sparkles className="h-5 w-5 text-primary" />
      </div>

      <div className="mt-5 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="rounded-[1.8rem] border border-dashed border-white/80 bg-white/70 p-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-fuchsia-100 text-primary">
              {mediaType === "image" ? <ImagePlus className="h-6 w-6" /> : <Video className="h-6 w-6" />}
            </div>
            <p className="mt-4 text-sm font-semibold text-text">Drag and drop media here</p>
            <p className="mt-2 text-sm text-muted">For phase 1 the uploader is UI-ready, with server multer support prepared.</p>
          </div>
          <textarea
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="Write a caption that matches the mood..."
            rows={5}
            className="w-full rounded-[1.6rem] border border-white/70 bg-white/75 px-4 py-4 text-sm outline-none ring-0 transition focus:border-primary/30 focus:shadow-glow"
          />
          <div className="flex items-center gap-3 rounded-[1.6rem] border border-white/70 bg-white/75 px-4 py-3">
            <MapPin className="h-4 w-4 text-muted" />
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Location"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Image", value: "image" as const },
              { label: "Video", value: "video" as const }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMediaType(option.value)}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  mediaType === option.value
                    ? "bg-gradient-to-r from-indigo-600 to-pink-500 text-white shadow-glow"
                    : "border border-white/70 bg-white/75 text-text"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <motion.div whileHover={{ y: -4 }} className="rounded-[1.8rem] border border-white/70 bg-white/75 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-primary/70">Live preview</p>
          <div
            className={`relative h-[420px] overflow-hidden rounded-[1.6rem] bg-gradient-to-br ${
              mediaType === "image"
                ? "from-cyan-100 via-white to-violet-200"
                : "from-slate-900 via-violet-700 to-pink-500"
            }`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.65),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.2),transparent_28%)]" />
            <div className="absolute inset-x-5 bottom-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">Vibly preview</p>
              <h3 className="headline-font mt-2 text-2xl font-semibold text-white">{mediaLabel}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/90">
                {caption || "Your caption will appear here with the same soft premium presentation as the feed."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSubmit({ caption, location, mediaType, mediaLabel })}
            className="mt-4 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-glow"
          >
            Publish Post
          </button>
        </motion.div>
      </div>
    </div>
  );
}

