import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import type { User } from "../../types/social";
import { useAuth } from "../../contexts/AuthContext";
import { formatCompactNumber } from "../../lib/format";
import { Avatar } from "../common/Avatar";
import { ProfilePreviewTrigger } from "../profile/ProfilePreviewTrigger";

export function UserCard({ user }: { user: User }) {
  const navigate = useNavigate();
  const { currentUser, toggleFollow, requireAuth, getConversationWithUser } = useAuth();
  const isOwnProfile = currentUser?.id === user.id;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass-panel rounded-[1.8rem] p-4 shadow-soft"
    >
      <div className="flex items-start gap-4">
        <ProfilePreviewTrigger user={user}>
          <div>
            <Avatar name={user.fullName} gradient={user.avatarGradient} imageUrl={user.profileImage} size="lg" ring />
          </div>
        </ProfilePreviewTrigger>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <ProfilePreviewTrigger user={user}>
                <Link to={`/${user.username}`} className="headline-font text-lg font-semibold text-text">
                  {user.nickname || user.fullName}
                </Link>
              </ProfilePreviewTrigger>
              <p className="text-sm text-primary">@{user.username}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-text">{formatCompactNumber(user.followers)}</p>
              <p className="text-xs text-muted">followers</p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">
            {user.canViewFullProfile ? user.bio : "This private profile only shares limited info until you are approved."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {!isOwnProfile && (
              <button
                type="button"
                onClick={() => toggleFollow(user.id)}
                className="rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-glow"
              >
                {user.isFollowing ? "Following" : user.hasRequestedFollow ? "Requested" : "Follow"}
              </button>
            )}
            {!isOwnProfile && user.canMessage && (
              <button
                type="button"
                onClick={() => {
                  if (requireAuth("Please login or create an account to send messages.", "/messages")) {
                    const conversation = getConversationWithUser(user.id);
                    navigate(conversation ? `/messages/${conversation.id}` : `/messages?compose=${user.username}`);
                  }
                }}
                className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/75 px-4 py-2 text-sm font-semibold text-text"
              >
                <MessageCircle className="h-4 w-4" />
                Message
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
