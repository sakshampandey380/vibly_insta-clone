import { ShieldCheck, Sparkles, UserCog } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AlertMessage } from "../components/common/AlertMessage";
import { EmptyState } from "../components/common/EmptyState";
import { Layout } from "../components/layout/Layout";
import { useAuth } from "../contexts/AuthContext";
import { appBackgroundThemes, chatThemes } from "../lib/themes";
import type { ProfileType, UserPreferences, VerificationDocumentType } from "../types/social";

type SettingsSection = "account" | "security" | "experience";

export function SettingsPage() {
  const {
    currentUser,
    requireAuth,
    updateAccountSettings,
    updatePreferences,
    changePassword,
    submitVerification,
    blockedUsers,
    unblockUser,
    mutualConnections,
    setNickname,
    incomingFollowRequests,
    respondToFollowRequest,
    updateAppTheme,
    updateGlobalChatTheme,
    updateNotificationSettings,
    blockUser,
    findUserByUsername
  } = useAuth();

  const [activeSection, setActiveSection] = useState<SettingsSection>("account");
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);
  const [accountForm, setAccountForm] = useState({
    profileType: (currentUser?.profileType || "public") as ProfileType,
    username: currentUser?.username || ""
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [verificationType, setVerificationType] = useState<VerificationDocumentType>("school_id");
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [preferencesForm, setPreferencesForm] = useState<UserPreferences>(() => currentUser?.preferences ?? {
    hobbies: [],
    favoriteNiche: "",
    favoriteSports: [],
    favoriteShows: [],
    favoriteAnime: [],
    education: "",
    currentLocation: currentUser?.location || "",
    gender: "",
    interestedIn: "",
    socialLinks: {},
    customLinks: []
  });
  const [notificationColor, setNotificationColor] = useState(currentUser?.notificationSettings?.color || "#1d4ed8");
  const [notificationAudioFile, setNotificationAudioFile] = useState<File | null>(null);
  const [blockUsername, setBlockUsername] = useState("");
  const [blockReason, setBlockReason] = useState("");

  useEffect(() => {
    if (!currentUser) {
      requireAuth("Please login or create an account to open settings.", "/settings");
      return;
    }

    setAccountForm({
      profileType: (currentUser.profileType || "public") as ProfileType,
      username: currentUser.username
    });
    setPreferencesForm(currentUser.preferences ?? preferencesForm);
    setNotificationColor(currentUser.notificationSettings?.color || "#1d4ed8");
  }, [currentUser, requireAuth]);

  const socialLinkEntries = useMemo(
    () => [
      "instagram",
      "youtube",
      "linkedin",
      "github",
      "twitter",
      "portfolio"
    ],
    []
  );

  if (!currentUser) {
    return (
      <Layout>
        <EmptyState
          title="Settings are account-specific"
          description="Once you sign in, privacy, account, security, and experience controls will appear here."
        />
      </Layout>
    );
  }

  async function saveAccountSettings() {
    setError(undefined);
    setSuccess(undefined);
    setIsSaving(true);
    try {
      await updateAccountSettings(accountForm);
      setSuccess("Updated successfully.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to update account settings.");
    } finally {
      setIsSaving(false);
    }
  }

  async function savePreferences() {
    setError(undefined);
    setSuccess(undefined);
    setIsSaving(true);
    try {
      await updatePreferences(preferencesForm);
      setSuccess("Updated successfully.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save preferences.");
    } finally {
      setIsSaving(false);
    }
  }

  async function savePassword() {
    setError(undefined);
    setSuccess(undefined);
    setIsSaving(true);
    try {
      await changePassword(passwordForm);
      setSuccess("Password changed successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to change password.");
    } finally {
      setIsSaving(false);
    }
  }

  async function saveVerification() {
    if (!verificationFile) {
      setError("Choose a verification document to upload.");
      return;
    }

    setError(undefined);
    setSuccess(undefined);
    setIsSaving(true);
    try {
      await submitVerification(verificationType, verificationFile);
      setSuccess("Verification submitted.");
      setVerificationFile(null);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit verification.");
    } finally {
      setIsSaving(false);
    }
  }

  async function saveExperienceSettings(themeId?: string, chatThemeId?: string) {
    setError(undefined);
    setSuccess(undefined);
    setIsSaving(true);
    try {
      if (themeId) {
        await updateAppTheme(themeId);
      }
      if (chatThemeId) {
        await updateGlobalChatTheme(chatThemeId);
      }
      await updateNotificationSettings({ color: notificationColor, audioFile: notificationAudioFile });
      setSuccess("Updated successfully.");
      setNotificationAudioFile(null);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save experience settings.");
    } finally {
      setIsSaving(false);
    }
  }

  function updateArrayField(field: keyof UserPreferences, value: string) {
    setPreferencesForm((current) => ({
      ...current,
      [field]: value.split(",").map((item) => item.trim()).filter(Boolean)
    }));
  }

  const sectionButtons = [
    { id: "account" as const, label: "Account", icon: UserCog },
    { id: "security" as const, label: "Security", icon: ShieldCheck },
    { id: "experience" as const, label: "Experience", icon: Sparkles }
  ];

  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="glass-panel rounded-[2rem] p-6 shadow-soft">
          <h1 className="headline-font text-3xl font-semibold text-text">Settings</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Account, privacy, security, personalization, and connected-info controls live here.
          </p>
        </div>

        {error ? <AlertMessage message={error} /> : null}
        {success ? <AlertMessage message={success} tone="success" /> : null}

        <div className="grid gap-5 xl:grid-cols-[280px_1fr]">
          <aside className="glass-panel rounded-[2rem] p-4 shadow-soft">
            <div className="flex gap-2 overflow-x-auto xl:flex-col">
              {sectionButtons.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`flex min-w-[150px] items-center gap-3 rounded-[1.4rem] px-4 py-3 text-left text-sm font-semibold transition ${
                    activeSection === section.id
                      ? "bg-gradient-to-r from-indigo-600 to-pink-500 text-white shadow-glow"
                      : "bg-white/80 text-text"
                  }`}
                >
                  <section.icon className="h-4 w-4" />
                  {section.label}
                </button>
              ))}
            </div>
          </aside>

          <div className="space-y-5">
            {activeSection === "account" ? (
              <>
                <section className="glass-panel rounded-[2rem] p-6 shadow-soft">
                  <h2 className="headline-font text-2xl font-semibold text-text">Privacy and account</h2>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <input value={accountForm.username} onChange={(event) => setAccountForm((current) => ({ ...current, username: event.target.value }))} placeholder="Username" className="rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none transition focus:border-primary/30 focus:shadow-glow" />
                    <select value={accountForm.profileType} onChange={(event) => setAccountForm((current) => ({ ...current, profileType: event.target.value as ProfileType }))} className="rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none transition focus:border-primary/30 focus:shadow-glow">
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                  <button type="button" disabled={isSaving} onClick={() => void saveAccountSettings()} className="mt-5 rounded-[1.6rem] bg-gradient-to-r from-indigo-600 to-pink-500 px-5 py-4 text-sm font-semibold text-white shadow-glow disabled:cursor-not-allowed disabled:opacity-70">
                    {isSaving ? "Saving..." : "Save account settings"}
                  </button>
                </section>

                <section className="glass-panel rounded-[2rem] p-6 shadow-soft">
                  <h2 className="headline-font text-2xl font-semibold text-text">Connected info</h2>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Only mutual connections appear here. Nicknames stay private to your account.
                  </p>
                  <div className="mt-5 space-y-4">
                    {mutualConnections.length ? (
                      mutualConnections.map((user) => (
                        <div key={user.id} className="rounded-[1.6rem] bg-white/75 p-4">
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-text">{user.fullName}</p>
                              <p className="text-sm text-primary">@{user.username}</p>
                            </div>
                            <input
                              defaultValue={user.nickname || ""}
                              placeholder="Set nickname"
                              onBlur={(event) => setNickname(user.id, event.target.value)}
                              className="w-full rounded-[1.2rem] border border-white/70 bg-white px-4 py-3 text-sm outline-none md:max-w-xs"
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted">No mutual connections yet.</p>
                    )}
                  </div>
                </section>

                <section className="glass-panel rounded-[2rem] p-6 shadow-soft">
                  <h2 className="headline-font text-2xl font-semibold text-text">Follow requests</h2>
                  <div className="mt-5 space-y-4">
                    {incomingFollowRequests.length ? (
                      incomingFollowRequests.map((user) => (
                        <div key={user.id} className="flex flex-col gap-3 rounded-[1.6rem] bg-white/75 p-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-text">{user.fullName}</p>
                            <p className="text-sm text-primary">@{user.username}</p>
                          </div>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => respondToFollowRequest(user.id, true)} className="rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white">
                              Accept
                            </button>
                            <button type="button" onClick={() => respondToFollowRequest(user.id, false)} className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-rose-700">
                              Reject
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted">No pending follow requests.</p>
                    )}
                  </div>
                </section>
              </>
            ) : null}

            {activeSection === "security" ? (
              <>
                <section className="glass-panel rounded-[2rem] p-6 shadow-soft">
                  <h2 className="headline-font text-2xl font-semibold text-text">Change password</h2>
                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} placeholder="Current password" className="rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none" />
                    <input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} placeholder="New password" className="rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none" />
                    <input type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} placeholder="Confirm password" className="rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none" />
                  </div>
                  <button type="button" disabled={isSaving} onClick={() => void savePassword()} className="mt-5 rounded-[1.6rem] bg-gradient-to-r from-indigo-600 to-pink-500 px-5 py-4 text-sm font-semibold text-white shadow-glow disabled:cursor-not-allowed disabled:opacity-70">
                    {isSaving ? "Saving..." : "Change password"}
                  </button>
                </section>

                <section className="glass-panel rounded-[2rem] p-6 shadow-soft">
                  <h2 className="headline-font text-2xl font-semibold text-text">Account verification</h2>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Upload either a school ID or Aadhaar ID. Files stay private and the account moves to pending review.
                  </p>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <select value={verificationType} onChange={(event) => setVerificationType(event.target.value as VerificationDocumentType)} className="rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none">
                      <option value="school_id">School ID</option>
                      <option value="aadhaar_id">Aadhaar ID</option>
                    </select>
                    <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => setVerificationFile(event.target.files?.[0] ?? null)} className="rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none" />
                  </div>
                  <p className="mt-4 text-sm text-muted">
                    Current status: <span className="font-semibold capitalize text-text">{currentUser.verification?.status?.replace(/_/g, " ") || "not verified"}</span>
                  </p>
                  <button type="button" disabled={isSaving} onClick={() => void saveVerification()} className="mt-5 rounded-[1.6rem] bg-gradient-to-r from-indigo-600 to-pink-500 px-5 py-4 text-sm font-semibold text-white shadow-glow disabled:cursor-not-allowed disabled:opacity-70">
                    {isSaving ? "Submitting..." : "Submit verification"}
                  </button>
                </section>

                <section className="glass-panel rounded-[2rem] p-6 shadow-soft">
                  <h2 className="headline-font text-2xl font-semibold text-text">Blocked users</h2>
                  <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                    <input value={blockUsername} onChange={(event) => setBlockUsername(event.target.value)} placeholder="Username to block" className="rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none" />
                    <input value={blockReason} onChange={(event) => setBlockReason(event.target.value)} placeholder="Reason (optional)" className="rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none" />
                    <button
                      type="button"
                      onClick={() => {
                        const target = findUserByUsername(blockUsername.trim());
                        if (!target) {
                          setError("User not found.");
                          return;
                        }
                        blockUser(target.id, blockReason);
                        setBlockUsername("");
                        setBlockReason("");
                        setSuccess("User blocked successfully.");
                      }}
                      className="rounded-[1.6rem] bg-rose-500 px-5 py-4 text-sm font-semibold text-white"
                    >
                      Block
                    </button>
                  </div>
                  <div className="mt-5 space-y-4">
                    {blockedUsers.length ? (
                      blockedUsers.map((entry) => (
                        <div key={entry.user.id} className="flex flex-col gap-3 rounded-[1.6rem] bg-white/75 p-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-text">{entry.user.fullName}</p>
                            <p className="text-sm text-primary">@{entry.user.username}</p>
                            {entry.reason ? <p className="mt-1 text-sm text-muted">Reason: {entry.reason}</p> : null}
                          </div>
                          <button type="button" onClick={() => unblockUser(entry.user.id)} className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-text">
                            Unblock
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted">You have not blocked any users.</p>
                    )}
                  </div>
                </section>
              </>
            ) : null}

            {activeSection === "experience" ? (
              <>
                <section className="glass-panel rounded-[2rem] p-6 shadow-soft">
                  <h2 className="headline-font text-2xl font-semibold text-text">App background themes</h2>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Choose from 30+ built-in backgrounds. The selected theme applies across home, explore, profile, chat, settings, uploads, and notifications.
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {appBackgroundThemes.map((theme) => (
                      <button key={theme.id} type="button" onClick={() => void saveExperienceSettings(theme.id)} className="rounded-[1.6rem] border border-white/70 bg-white/80 p-3 text-left">
                        <div className={`h-20 rounded-[1.2rem] bg-gradient-to-br ${theme.preview}`} />
                        <p className="mt-3 text-sm font-semibold text-text">{theme.label}</p>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="glass-panel rounded-[2rem] p-6 shadow-soft">
                  <h2 className="headline-font text-2xl font-semibold text-text">Chat theme</h2>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {chatThemes.map((theme) => (
                      <button key={theme.id} type="button" onClick={() => void saveExperienceSettings(undefined, theme.id)} className="rounded-[1.6rem] border border-white/70 bg-white/80 p-3 text-left">
                        <div className={`h-20 rounded-[1.2rem] bg-gradient-to-br ${theme.preview}`} />
                        <p className="mt-3 text-sm font-semibold text-text">{theme.label}</p>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="glass-panel rounded-[2rem] p-6 shadow-soft">
                  <h2 className="headline-font text-2xl font-semibold text-text">Notification customization</h2>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <input type="color" value={notificationColor} onChange={(event) => setNotificationColor(event.target.value)} className="h-14 w-full rounded-[1.6rem] border border-white/70 bg-white/80 px-3 py-2" />
                    <input type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg" onChange={(event) => setNotificationAudioFile(event.target.files?.[0] ?? null)} className="rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none" />
                  </div>
                  <div className="mt-4 rounded-[1.6rem] p-4 text-sm text-white" style={{ background: notificationColor }}>
                    Notification preview
                  </div>
                  <button type="button" disabled={isSaving} onClick={() => void saveExperienceSettings()} className="mt-5 rounded-[1.6rem] bg-gradient-to-r from-indigo-600 to-pink-500 px-5 py-4 text-sm font-semibold text-white shadow-glow disabled:cursor-not-allowed disabled:opacity-70">
                    {isSaving ? "Saving..." : "Save notification settings"}
                  </button>
                </section>

                <section className="glass-panel rounded-[2rem] p-6 shadow-soft">
                  <h2 className="headline-font text-2xl font-semibold text-text">User preferences</h2>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <input value={preferencesForm.hobbies.join(", ")} onChange={(event) => updateArrayField("hobbies", event.target.value)} placeholder="Hobbies (comma separated)" className="rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none" />
                    <input value={preferencesForm.favoriteNiche} onChange={(event) => setPreferencesForm((current) => ({ ...current, favoriteNiche: event.target.value }))} placeholder="Favorite niche" className="rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none" />
                    <input value={preferencesForm.favoriteSports.join(", ")} onChange={(event) => updateArrayField("favoriteSports", event.target.value)} placeholder="Favorite sports" className="rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none" />
                    <input value={preferencesForm.favoriteShows.join(", ")} onChange={(event) => updateArrayField("favoriteShows", event.target.value)} placeholder="Favorite shows" className="rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none" />
                    <input value={preferencesForm.favoriteAnime.join(", ")} onChange={(event) => updateArrayField("favoriteAnime", event.target.value)} placeholder="Favorite anime" className="rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none" />
                    <input value={preferencesForm.education} onChange={(event) => setPreferencesForm((current) => ({ ...current, education: event.target.value }))} placeholder="Education" className="rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none" />
                    <input value={preferencesForm.currentLocation} onChange={(event) => setPreferencesForm((current) => ({ ...current, currentLocation: event.target.value }))} placeholder="Current location" className="rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none" />
                    <input value={preferencesForm.gender} onChange={(event) => setPreferencesForm((current) => ({ ...current, gender: event.target.value }))} placeholder="Gender" className="rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none" />
                    <input value={preferencesForm.interestedIn} onChange={(event) => setPreferencesForm((current) => ({ ...current, interestedIn: event.target.value }))} placeholder="Interested in" className="rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none md:col-span-2" />
                    {socialLinkEntries.map((key) => (
                      <input
                        key={key}
                        value={preferencesForm.socialLinks[key] || ""}
                        onChange={(event) =>
                          setPreferencesForm((current) => ({
                            ...current,
                            socialLinks: {
                              ...current.socialLinks,
                              [key]: event.target.value
                            }
                          }))
                        }
                        placeholder={`${key[0].toUpperCase()}${key.slice(1)} link`}
                        className="rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none"
                      />
                    ))}
                  </div>
                  <button type="button" disabled={isSaving} onClick={() => void savePreferences()} className="mt-5 rounded-[1.6rem] bg-gradient-to-r from-indigo-600 to-pink-500 px-5 py-4 text-sm font-semibold text-white shadow-glow disabled:cursor-not-allowed disabled:opacity-70">
                    {isSaving ? "Saving..." : "Save preferences"}
                  </button>
                </section>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </Layout>
  );
}
