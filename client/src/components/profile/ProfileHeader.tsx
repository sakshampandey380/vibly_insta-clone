import { MessageCircle, PencilLine, UserPlus2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import type { User } from "../../types/social";
import { useAuth } from "../../contexts/AuthContext";
import { formatCompactNumber } from "../../lib/format";
import { Avatar } from "../common/Avatar";

interface ProfileHeaderProps {
  user: User;
  isOwnProfile: boolean;
}

export function ProfileHeader({ user, isOwnProfile }: ProfileHeaderProps) {
  const navigate = useNavigate();
  const { toggleFollow, requireAuth, getConversationWithUser } = useAuth();

  return (
    <div className="glass-panel overflow-hidden rounded-[2rem] shadow-soft">
      <div className={`h-40 bg-gradient-to-br ${user.coverGradient}`}>
        {user.bannerImage ? <img src={user.bannerImage} alt={`${user.username} banner`} className="h-full w-full object-cover" /> : null}
      </div>
      <div className="relative px-5 pb-5">
        <div className="-mt-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex items-end gap-4">
            <Avatar name={user.fullName} gradient={user.avatarGradient} imageUrl={user.profileImage} size="xl" ring />
            <div className="pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="headline-font text-2xl font-semibold text-text">{user.nickname || user.fullName}</h1>
                <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-muted">
                  {user.profileType === "private" ? "Private" : "Public"}
                </span>
              </div>
              <p className="text-sm font-medium text-primary">@{user.username}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {isOwnProfile ? (
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => navigate("/edit-profile")}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-glow"
              >
                <PencilLine className="h-4 w-4" />
                Edit Profile
              </motion.button>
            ) : (
              <>
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => toggleFollow(user.id)}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-glow"
                >
                  <UserPlus2 className="h-4 w-4" />
                  {user.isFollowing ? "Following" : user.hasRequestedFollow ? "Requested" : "Follow"}
                </motion.button>
                {user.canMessage && (
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      if (requireAuth("Please login or create an account to send messages.", "/messages")) {
                        const conversation = getConversationWithUser(user.id);
                        navigate(conversation ? `/messages/${conversation.id}` : `/messages?compose=${user.username}`);
                      }
                    }}
                    className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm font-semibold text-text"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </motion.button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto]">
          <div>
            <p className="max-w-2xl text-sm leading-6 text-muted">
              {user.canViewFullProfile ? user.bio : "This private profile is limited until your follow request is accepted."}
            </p>
            {user.tagline && <p className="mt-2 text-sm font-medium text-primary">{user.tagline}</p>}
            {user.canViewFullProfile && (
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
                {user.location ? <span className="rounded-full bg-white/70 px-3 py-1">{user.location}</span> : null}
                {user.website ? <span className="rounded-full bg-white/70 px-3 py-1">{user.website}</span> : null}
                {user.preferences?.education ? <span className="rounded-full bg-white/70 px-3 py-1">{user.preferences.education}</span> : null}
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-white/75 px-4 py-3">
              <p className="text-lg font-semibold text-text">{formatCompactNumber(user.postsCount)}</p>
              <p className="text-xs text-muted">Posts</p>
            </div>
            <div className="rounded-2xl bg-white/75 px-4 py-3">
              <p className="text-lg font-semibold text-text">{formatCompactNumber(user.followers)}</p>
              <p className="text-xs text-muted">Followers</p>
            </div>
            <div className="rounded-2xl bg-white/75 px-4 py-3">
              <p className="text-lg font-semibold text-text">{formatCompactNumber(user.following)}</p>
              <p className="text-xs text-muted">Following</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
