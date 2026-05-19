import { FileImage, Film, ImagePlus, MoveLeft, UploadCloud, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertMessage } from "../components/common/AlertMessage";
import { EmptyState } from "../components/common/EmptyState";
import { Layout } from "../components/layout/Layout";
import { useAuth } from "../contexts/AuthContext";
import { formatBytes, formatDuration, readVideoDuration, uploadRules, validateImageFile, validateVideoFile } from "../lib/upload";
import type { ContentVisibility } from "../types/social";

type UploadTab = "post" | "reel";

interface UploadFormState {
  title: string;
  caption: string;
  location: string;
  visibility: ContentVisibility;
  file: File | null;
  thumbnailFile: File | null;
  durationSeconds?: number;
}

const emptyForm: UploadFormState = {
  title: "",
  caption: "",
  location: "",
  visibility: "public",
  file: null,
  thumbnailFile: null,
  durationSeconds: undefined
};

export function CreatePostPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    currentUser,
    requireAuth,
    createPost,
    createReel,
    posts,
    reels,
    updatePost,
    updateReel
  } = useAuth();

  const editPostId = Number(searchParams.get("editPost") ?? "");
  const editReelId = Number(searchParams.get("editReel") ?? "");
  const existingPost = posts.find((post) => post.id === editPostId && post.isOwn);
  const existingReel = reels.find((reel) => reel.id === editReelId && reel.isOwn);

  const [activeTab, setActiveTab] = useState<UploadTab>(existingReel ? "reel" : "post");
  const [postForm, setPostForm] = useState<UploadFormState>(emptyForm);
  const [reelForm, setReelForm] = useState<UploadFormState>(emptyForm);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draggingTab, setDraggingTab] = useState<UploadTab | null>(null);

  useEffect(() => {
    if (!currentUser) {
      requireAuth("Please login or create an account to upload posts or reels.", "/create");
    }
  }, [currentUser, requireAuth]);

  useEffect(() => {
    if (existingPost) {
      setPostForm({
        title: existingPost.title || existingPost.mediaLabel,
        caption: existingPost.caption,
        location: existingPost.location || "",
        visibility: existingPost.visibility || "public",
        file: null,
        thumbnailFile: null,
        durationSeconds: existingPost.durationSeconds
      });
    }
  }, [existingPost]);

  useEffect(() => {
    if (existingReel) {
      setReelForm({
        title: existingReel.title || existingReel.caption,
        caption: existingReel.caption,
        location: existingReel.location || "",
        visibility: existingReel.visibility || "public",
        file: null,
        thumbnailFile: null,
        durationSeconds: existingReel.durationSeconds
      });
    }
  }, [existingReel]);

  const postPreviewUrl = useMemo(() => (postForm.file ? URL.createObjectURL(postForm.file) : existingPost?.mediaUrl), [postForm.file, existingPost?.mediaUrl]);
  const reelPreviewUrl = useMemo(() => (reelForm.file ? URL.createObjectURL(reelForm.file) : existingReel?.videoUrl), [reelForm.file, existingReel?.videoUrl]);
  const reelThumbnailPreviewUrl = useMemo(
    () => (reelForm.thumbnailFile ? URL.createObjectURL(reelForm.thumbnailFile) : existingReel?.thumbnailUrl || null),
    [reelForm.thumbnailFile, existingReel?.thumbnailUrl]
  );

  useEffect(
    () => () => {
      if (postForm.file) {
        URL.revokeObjectURL(postPreviewUrl || "");
      }
      if (reelForm.file) {
        URL.revokeObjectURL(reelPreviewUrl || "");
      }
      if (reelForm.thumbnailFile) {
        URL.revokeObjectURL(reelThumbnailPreviewUrl || "");
      }
    },
    [postForm.file, reelForm.file, reelForm.thumbnailFile, postPreviewUrl, reelPreviewUrl, reelThumbnailPreviewUrl]
  );

  if (!currentUser) {
    return (
      <Layout>
        <EmptyState
          title="Creation unlocks after login"
          description="Login to upload posts, reels, thumbnails, and custom media from your device."
        />
      </Layout>
    );
  }

  async function handlePostFile(file: File | null) {
    if (!file) {
      return;
    }

    if (file.type.startsWith("video/")) {
      validateVideoFile(file, uploadRules.postMaxBytes);
    } else {
      validateImageFile(file, uploadRules.postMaxBytes);
    }

    setPostForm((current) => ({ ...current, file }));
  }

  async function handleReelFile(file: File | null) {
    if (!file) {
      return;
    }

    validateVideoFile(file, uploadRules.reelMaxBytes);
    const duration = await readVideoDuration(file);
    if (duration > uploadRules.reelMaxDurationSeconds) {
      throw new Error("Reel must be 3 minutes or less.");
    }

    setReelForm((current) => ({ ...current, file, durationSeconds: duration }));
  }

  function handleDrop(tab: UploadTab, event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDraggingTab(null);
    const file = event.dataTransfer.files?.[0];
    if (!file) {
      return;
    }

    void (tab === "post" ? handlePostFile(file) : handleReelFile(file)).catch((uploadError) => {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to use that file.");
    });
  }

  async function submitActiveForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setSuccess(undefined);
    setIsSubmitting(true);

    try {
      if (activeTab === "post") {
        if (existingPost) {
          await updatePost(existingPost.id, {
            title: postForm.title,
            caption: postForm.caption,
            location: postForm.location,
            visibility: postForm.visibility,
            file: postForm.file,
            thumbnailFile: postForm.thumbnailFile
          });
          setSuccess("Updated successfully.");
        } else if (postForm.file) {
          const didCreate = await createPost({
            title: postForm.title,
            caption: postForm.caption,
            location: postForm.location,
            visibility: postForm.visibility,
            mediaType: postForm.file.type.startsWith("video/") ? "video" : "image",
            file: postForm.file,
            thumbnailFile: postForm.thumbnailFile
          });
          if (didCreate) {
            setSuccess("Uploaded successfully.");
            setPostForm(emptyForm);
            navigate("/");
          }
        } else {
          throw new Error("Choose a file to upload.");
        }
      } else {
        if (existingReel) {
          await updateReel(existingReel.id, {
            title: reelForm.title,
            caption: reelForm.caption,
            location: reelForm.location,
            visibility: reelForm.visibility,
            file: reelForm.file,
            thumbnailFile: reelForm.thumbnailFile
          });
          setSuccess("Updated successfully.");
        } else if (reelForm.file) {
          const didCreate = await createReel({
            title: reelForm.title,
            caption: reelForm.caption,
            location: reelForm.location,
            visibility: reelForm.visibility,
            file: reelForm.file,
            thumbnailFile: reelForm.thumbnailFile
          });
          if (didCreate) {
            setSuccess("Uploaded successfully.");
            setReelForm(emptyForm);
            navigate("/reels");
          }
        } else {
          throw new Error("Choose a reel file to upload.");
        }
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit upload.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const currentForm = activeTab === "post" ? postForm : reelForm;
  const currentPreviewUrl = activeTab === "post" ? postPreviewUrl : reelPreviewUrl;
  const isExistingPostVideo = existingPost?.mediaType === "video";
  const isExistingPostImage = existingPost?.mediaType === "image";
  const isCurrentPostVideo = Boolean(postForm.file?.type.startsWith("video/") || (!postForm.file && isExistingPostVideo));
  const isCurrentPostImage = Boolean(postForm.file?.type.startsWith("image/") || (!postForm.file && isExistingPostImage));

  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="glass-panel rounded-[2rem] p-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="headline-font text-3xl font-semibold text-text">
                {existingPost || existingReel ? "Manage your upload" : "Create post or reel"}
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted">
                Upload from device, preview before publishing, and keep ownership controls limited to your account.
              </p>
            </div>
            {(existingPost || existingReel) ? (
              <button type="button" onClick={() => navigate(-1)} className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm font-semibold text-text">
                <span className="inline-flex items-center gap-2">
                  <MoveLeft className="h-4 w-4" />
                  Back
                </span>
              </button>
            ) : null}
          </div>
        </div>

        <div className="glass-panel rounded-[2rem] p-3 shadow-soft">
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "post" as const, label: existingPost ? "Edit Post" : "Post", icon: FileImage },
              { key: "reel" as const, label: existingReel ? "Edit Reel" : "Reel", icon: Film }
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center justify-center gap-2 rounded-[1.4rem] px-4 py-3 text-sm font-semibold transition ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-indigo-600 to-pink-500 text-white shadow-glow"
                    : "bg-white/80 text-text"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={submitActiveForm} className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="glass-panel rounded-[2rem] p-6 shadow-soft">
            {error ? <AlertMessage message={error} /> : null}
            {success ? <AlertMessage message={success} tone="success" className="mt-3" /> : null}

            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDraggingTab(activeTab);
              }}
              onDragLeave={() => setDraggingTab(null)}
              onDrop={(event) => handleDrop(activeTab, event)}
              className={`mt-4 rounded-[1.8rem] border border-dashed p-6 text-center transition ${
                draggingTab === activeTab ? "border-primary bg-primary/5" : "border-white/80 bg-white/70"
              }`}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-fuchsia-100 text-primary">
                {activeTab === "post" ? <ImagePlus className="h-6 w-6" /> : <Video className="h-6 w-6" />}
              </div>
              <p className="mt-4 text-sm font-semibold text-text">Drag and drop {activeTab === "post" ? "post" : "reel"} media here</p>
              <p className="mt-2 text-sm text-muted">
                {activeTab === "post" ? "Images or videos up to 20MB." : "Videos up to 20MB and 3 minutes."}
              </p>
              <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-glow">
                <UploadCloud className="h-4 w-4" />
                Select file
                <input
                  type="file"
                  accept={activeTab === "post" ? "image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime" : "video/mp4,video/webm,video/quicktime"}
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    if (!file) {
                      return;
                    }
                    void (activeTab === "post" ? handlePostFile(file) : handleReelFile(file)).catch((uploadError) => {
                      setError(uploadError instanceof Error ? uploadError.message : "Unable to use that file.");
                    });
                  }}
                />
              </label>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input value={currentForm.title} onChange={(event) => (activeTab === "post" ? setPostForm((current) => ({ ...current, title: event.target.value })) : setReelForm((current) => ({ ...current, title: event.target.value })))} placeholder="Title" className="w-full rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none transition focus:border-primary/30 focus:shadow-glow" />
              <input value={currentForm.location} onChange={(event) => (activeTab === "post" ? setPostForm((current) => ({ ...current, location: event.target.value })) : setReelForm((current) => ({ ...current, location: event.target.value })))} placeholder="Location" className="w-full rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none transition focus:border-primary/30 focus:shadow-glow" />
            </div>

            <textarea
              value={currentForm.caption}
              onChange={(event) => (activeTab === "post" ? setPostForm((current) => ({ ...current, caption: event.target.value })) : setReelForm((current) => ({ ...current, caption: event.target.value })))}
              rows={5}
              placeholder={activeTab === "post" ? "Write a caption..." : "Write a reel description..."}
              className="mt-4 w-full rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none transition focus:border-primary/30 focus:shadow-glow"
            />

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <select
                value={currentForm.visibility}
                onChange={(event) => {
                  const value = event.target.value as ContentVisibility;
                  activeTab === "post"
                    ? setPostForm((current) => ({ ...current, visibility: value }))
                    : setReelForm((current) => ({ ...current, visibility: value }));
                }}
                className="rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none transition focus:border-primary/30 focus:shadow-glow"
              >
                <option value="public">Public</option>
                <option value="followers">Followers</option>
                <option value="private">Private</option>
              </select>
              <label className="rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm text-muted">
                <span className="inline-flex items-center gap-2 font-semibold text-text">
                  <ImagePlus className="h-4 w-4" />
                  {activeTab === "post" ? "Optional thumbnail" : "Custom reel thumbnail"}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="mt-2 block w-full text-sm"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    if (!file) {
                      return;
                    }
                    try {
                      validateImageFile(file);
                      activeTab === "post"
                        ? setPostForm((current) => ({ ...current, thumbnailFile: file }))
                        : setReelForm((current) => ({ ...current, thumbnailFile: file }));
                    } catch (thumbError) {
                      setError(thumbError instanceof Error ? thumbError.message : "Invalid file type.");
                    }
                  }}
                />
              </label>
            </div>

            <div className="mt-4 grid gap-3 rounded-[1.8rem] bg-white/75 p-4 text-sm text-muted md:grid-cols-3">
              <div>
                <p className="font-semibold text-text">File</p>
                <p className="mt-1 truncate">{currentForm.file?.name || (activeTab === "post" ? existingPost?.mediaName || "Not selected" : existingReel?.mediaName || "Not selected")}</p>
              </div>
              <div>
                <p className="font-semibold text-text">Size</p>
                <p className="mt-1">{currentForm.file ? formatBytes(currentForm.file.size) : activeTab === "post" ? existingPost?.mediaSizeLabel || "0 B" : existingReel?.mediaSizeLabel || "0 B"}</p>
              </div>
              <div>
                <p className="font-semibold text-text">Duration</p>
                <p className="mt-1">{currentForm.durationSeconds ? formatDuration(currentForm.durationSeconds) : activeTab === "reel" ? existingReel?.durationLabel || "Auto" : "Optional"}</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-5 w-full rounded-[1.6rem] bg-gradient-to-r from-indigo-600 to-pink-500 px-5 py-4 text-sm font-semibold text-white shadow-glow disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Saving..." : existingPost || existingReel ? "Save changes" : activeTab === "post" ? "Publish post" : "Publish reel"}
            </button>
          </div>

          <div className="glass-panel rounded-[2rem] p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/70">Preview</p>
            <div className={`mt-4 relative overflow-hidden rounded-[1.8rem] bg-gradient-to-br ${activeTab === "post" ? (isCurrentPostVideo ? "from-slate-900 via-violet-700 to-pink-500" : "from-cyan-100 via-white to-violet-200") : "from-slate-900 via-violet-700 to-pink-500"}`}>
              <div className="h-[520px]">
                <div className="absolute inset-0 bg-slate-950/72" />
                {activeTab === "post" && currentPreviewUrl && isCurrentPostImage ? (
                  <img src={currentPreviewUrl} alt="Post preview" className="h-full w-full object-contain" />
                ) : null}
                {activeTab === "post" && currentPreviewUrl && isCurrentPostVideo ? (
                  <video src={currentPreviewUrl} poster={postForm.thumbnailFile ? URL.createObjectURL(postForm.thumbnailFile) : existingPost?.thumbnailUrl || undefined} controls className="h-full w-full object-contain" />
                ) : null}
                {activeTab === "reel" && reelThumbnailPreviewUrl ? (
                  <img src={reelThumbnailPreviewUrl} alt="Reel thumbnail preview" className="h-full w-full object-contain" />
                ) : activeTab === "reel" && reelPreviewUrl ? (
                  <video src={reelPreviewUrl} controls className="h-full w-full object-contain" />
                ) : null}
                {!currentPreviewUrl && !(activeTab === "reel" && reelThumbnailPreviewUrl) ? (
                  <div className="flex h-full items-center justify-center text-center text-white/85">
                    <div>
                      <p className="headline-font text-2xl font-semibold">Upload preview</p>
                      <p className="mt-3 px-6 text-sm leading-6">
                        The selected media, thumbnail, file name, size, and duration will appear here before publish.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="absolute inset-x-5 bottom-5 rounded-[1.4rem] bg-black/20 p-4 text-white backdrop-blur-md">
                <p className="headline-font text-2xl font-semibold">{currentForm.title || "Untitled upload"}</p>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/90">
                  {currentForm.caption || "Your description will appear here."}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/85">
                  {currentForm.location ? <span className="rounded-full bg-white/20 px-3 py-1">{currentForm.location}</span> : null}
                  {currentForm.visibility ? <span className="rounded-full bg-white/20 px-3 py-1">{currentForm.visibility}</span> : null}
                  {currentForm.file?.name ? <span className="rounded-full bg-white/20 px-3 py-1">{currentForm.file.name}</span> : null}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
