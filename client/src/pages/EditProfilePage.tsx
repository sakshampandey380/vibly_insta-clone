import { Camera, ImagePlus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Layout } from "../components/layout/Layout";
import { AlertMessage } from "../components/common/AlertMessage";
import { EmptyState } from "../components/common/EmptyState";
import { Avatar } from "../components/common/Avatar";
import { useAuth } from "../contexts/AuthContext";

export function EditProfilePage() {
  const { currentUser, requireAuth, updateProfile, updateProfileMedia } = useAuth();
  const [form, setForm] = useState({
    fullName: currentUser?.fullName ?? "",
    username: currentUser?.username ?? "",
    phone: currentUser?.phone ?? "",
    bio: currentUser?.bio ?? "",
    website: currentUser?.website ?? "",
    location: currentUser?.location ?? ""
  });
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      requireAuth("Please login or create an account to edit your profile.", "/edit-profile");
      return;
    }

    setForm({
      fullName: currentUser.fullName,
      username: currentUser.username,
      phone: currentUser.phone,
      bio: currentUser.bio ?? "",
      website: currentUser.website ?? "",
      location: currentUser.location ?? ""
    });
  }, [currentUser, requireAuth]);

  if (!currentUser) {
    return (
      <Layout>
        <EmptyState
          title="Profile editing is protected"
          description="Login or create an account to update your identity, bio, cover image, and personal details."
        />
      </Layout>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setSuccess(undefined);
    setIsSaving(true);

    try {
      await updateProfile(form);
      setSuccess("Updated successfully.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save profile.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleMediaUpdate(kind: "profile" | "banner", file: File | null) {
    setError(undefined);
    setSuccess(undefined);
    try {
      await updateProfileMedia(kind, file);
      setSuccess(kind === "profile" ? "Profile photo updated successfully." : "Banner updated successfully.");
    } catch (mediaError) {
      setError(mediaError instanceof Error ? mediaError.message : "Unable to update media.");
    }
  }

  function setField<Key extends keyof typeof form>(field: Key, value: (typeof form)[Key]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="glass-panel overflow-hidden rounded-[2rem] shadow-soft">
          <div className={`relative h-52 bg-gradient-to-br ${currentUser.coverGradient}`}>
            {currentUser.bannerImage ? <img src={currentUser.bannerImage} alt={`${currentUser.username} banner`} className="h-full w-full object-cover" /> : null}
            <div className="absolute bottom-4 right-4 flex flex-wrap gap-2">
              <label className="rounded-2xl bg-white/85 px-4 py-3 text-sm font-semibold text-text shadow-soft">
                <span className="inline-flex items-center gap-2">
                  <ImagePlus className="h-4 w-4" />
                  Change Banner
                </span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => void handleMediaUpdate("banner", event.target.files?.[0] ?? null)} />
              </label>
              {currentUser.bannerImage ? (
                <button type="button" onClick={() => void handleMediaUpdate("banner", null)} className="rounded-2xl bg-white/85 px-4 py-3 text-sm font-semibold text-rose-700 shadow-soft">
                  <span className="inline-flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Remove Banner
                  </span>
                </button>
              ) : null}
            </div>
          </div>
          <div className="relative px-6 pb-6">
            <div className="-mt-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex items-end gap-4">
                <Avatar name={currentUser.fullName} gradient={currentUser.avatarGradient} imageUrl={currentUser.profileImage} size="xl" ring />
                <div className="pb-2">
                  <h1 className="headline-font text-2xl font-semibold text-text">{currentUser.fullName}</h1>
                  <p className="text-sm text-primary">@{currentUser.username}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="rounded-2xl bg-white/85 px-4 py-3 text-sm font-semibold text-text shadow-soft">
                  <span className="inline-flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Change Photo
                  </span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => void handleMediaUpdate("profile", event.target.files?.[0] ?? null)} />
                </label>
                {currentUser.profileImage ? (
                  <button type="button" onClick={() => void handleMediaUpdate("profile", null)} className="rounded-2xl bg-white/85 px-4 py-3 text-sm font-semibold text-rose-700 shadow-soft">
                    <span className="inline-flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Remove Photo
                    </span>
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel-strong rounded-[2rem] p-6 shadow-glow sm:p-8">
          <div>
            <h2 className="headline-font text-3xl font-semibold text-text">Edit profile</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Update your public identity and keep uploads, privacy-aware previews, and profile media aligned.
            </p>
          </div>
          {error && <AlertMessage message={error} className="mt-5" />}
          {success && <AlertMessage message={success} tone="success" className="mt-5" />}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <input value={form.fullName} onChange={(event) => setField("fullName", event.target.value)} placeholder="Full name" className="w-full rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none transition focus:border-primary/30 focus:shadow-glow" />
            <input value={form.username} onChange={(event) => setField("username", event.target.value)} placeholder="Username" className="w-full rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none transition focus:border-primary/30 focus:shadow-glow" />
            <input value={form.phone} onChange={(event) => setField("phone", event.target.value)} placeholder="Phone number" className="w-full rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none transition focus:border-primary/30 focus:shadow-glow" />
            <input value={form.location} onChange={(event) => setField("location", event.target.value)} placeholder="Location" className="w-full rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none transition focus:border-primary/30 focus:shadow-glow" />
            <input value={form.website} onChange={(event) => setField("website", event.target.value)} placeholder="Website" className="w-full rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none transition focus:border-primary/30 focus:shadow-glow md:col-span-2" />
          </div>
          <textarea
            value={form.bio}
            onChange={(event) => setField("bio", event.target.value)}
            rows={5}
            placeholder="Bio"
            className="mt-4 w-full rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none transition focus:border-primary/30 focus:shadow-glow"
          />
          <button
            type="submit"
            disabled={isSaving}
            className="mt-6 rounded-[1.6rem] bg-gradient-to-r from-indigo-600 to-pink-500 px-5 py-4 text-sm font-semibold text-white shadow-glow disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
