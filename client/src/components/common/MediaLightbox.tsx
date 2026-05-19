import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { MediaType } from "../../types/social";

interface MediaLightboxProps {
  open: boolean;
  onClose: () => void;
  mediaType: MediaType;
  src?: string | null;
  poster?: string | null;
  title: string;
  description?: string;
}

const MIN_ZOOM = 0.75;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

export function MediaLightbox({
  open,
  onClose,
  mediaType,
  src,
  poster,
  title,
  description
}: MediaLightboxProps) {
  const [zoom, setZoom] = useState(1);
  const canZoom = mediaType === "image" && Boolean(src);

  useEffect(() => {
    if (!open) {
      return;
    }

    setZoom(1);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, src]);

  function updateZoom(nextZoom: number) {
    const clampedZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
    setZoom(Number(clampedZoom.toFixed(2)));
  }

  return (
    <AnimatePresence>
      {open && src ? (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-slate-950/78 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className="fixed inset-0 z-[71] flex items-center justify-center p-4 sm:p-6"
          >
            <div className="relative flex h-full max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/94 shadow-2xl">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close media preview"
                className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 text-white sm:px-6">
                <div className="pr-12">
                  <p className="headline-font text-xl font-semibold">{title}</p>
                  {description ? <p className="mt-1 max-w-2xl text-sm leading-6 text-white/70">{description}</p> : null}
                </div>
                {canZoom ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateZoom(zoom - ZOOM_STEP)}
                      className="rounded-2xl bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Minus className="h-4 w-4" />
                        Zoom out
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateZoom(1)}
                      className="rounded-2xl bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                      <span className="inline-flex items-center gap-2">
                        <RotateCcw className="h-4 w-4" />
                        Reset
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateZoom(zoom + ZOOM_STEP)}
                      className="rounded-2xl bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Zoom in
                      </span>
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="flex-1 overflow-auto p-4 sm:p-6">
                <div className="flex min-h-full items-center justify-center">
                  {mediaType === "video" ? (
                    <video
                      src={src}
                      poster={poster ?? undefined}
                      controls
                      className="max-h-[78vh] w-full rounded-[1.5rem] bg-black object-contain"
                    />
                  ) : (
                    <img
                      src={src}
                      alt={title}
                      className="max-h-[78vh] w-full rounded-[1.5rem] bg-slate-950 object-contain transition duration-200"
                      style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: "center center"
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
