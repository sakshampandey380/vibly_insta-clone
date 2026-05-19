import { Bookmark, Grid2x2, Video } from "lucide-react";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { EmptyState } from "../components/common/EmptyState";
import { PostGrid } from "../components/profile/PostGrid";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../lib/cn";

type ProfileTab = "posts" | "reels" | "saved";

export function ProfilePage() {
  const { username } = useParams();
  const { currentUser, users, posts, reels } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");

  const profileUser = users.find((user) => user.username === username);
  const isOwnProfile = currentUser?.id === profileUser?.id;
  const canViewFullProfile = Boolean(profileUser?.canViewFullProfile || isOwnProfile);
  const profilePosts = useMemo(() => posts.filter((post) => post.userId === profileUser?.id), [posts, profileUser?.id]);
  const profileReels = useMemo(() => reels.filter((reel) => reel.userId === profileUser?.id), [reels, profileUser?.id]);
  const savedPosts = useMemo(() => posts.filter((post) => post.savedByUser && post.userId !== profileUser?.id), [posts, profileUser?.id]);

  if (!profileUser) {
    return (
      <Layout>
        <EmptyState
          title="Profile not found"
          description="This creator profile does not exist in the current phase-1 dataset."
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-5xl space-y-5">
        <ProfileHeader user={profileUser} isOwnProfile={isOwnProfile} />
        <div className="glass-panel rounded-[2rem] p-3 shadow-soft">
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "posts" as const, label: "Posts", icon: Grid2x2 },
              { key: "reels" as const, label: "Reels", icon: Video },
              { key: "saved" as const, label: "Saved", icon: Bookmark, hidden: !isOwnProfile }
            ]
              .filter((tab) => !tab.hidden)
              .map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-[1.4rem] px-4 py-3 text-sm font-semibold transition",
                    activeTab === tab.key
                      ? "bg-gradient-to-r from-indigo-600 to-pink-500 text-white shadow-glow"
                      : "bg-white/75 text-text"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
          </div>
        </div>
        {!canViewFullProfile && !isOwnProfile ? (
          <EmptyState
            title="This profile is private"
            description="Follow this account and wait for approval to view posts and reels."
          />
        ) : null}
        {activeTab === "posts" && canViewFullProfile && (
          profilePosts.length ? <PostGrid posts={profilePosts} /> : <EmptyState title="No posts yet" description="Uploads from this profile will appear here." />
        )}
        {activeTab === "reels" && (
          canViewFullProfile ? (
            profileReels.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {profileReels.map((reel) => (
                  <div key={reel.id} className="glass-panel rounded-[1.8rem] p-4 shadow-soft">
                    <div className={`relative h-80 overflow-hidden rounded-[1.5rem] bg-gradient-to-br ${reel.mediaGradient}`}>
                      <div className="absolute inset-0 bg-slate-950/72" />
                      {reel.thumbnailUrl ? <img src={reel.thumbnailUrl} alt={reel.title || reel.caption} className="h-full w-full object-contain" /> : null}
                    </div>
                    <p className="headline-font mt-3 text-lg font-semibold text-text">{reel.title || reel.caption}</p>
                    <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted">
                      <span>{reel.audioName}</span>
                      {reel.durationLabel ? <span>{reel.durationLabel}</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No reels yet" description="Reels from this creator will show up here." />
            )
          ) : null
        )}
        {activeTab === "saved" && isOwnProfile && <PostGrid posts={savedPosts} />}
      </div>
    </Layout>
  );
}
