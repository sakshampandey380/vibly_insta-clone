import { MessageCircle, UserPlus2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { User } from "../../types/social";
import { useAuth } from "../../contexts/AuthContext";
import { formatCompactNumber } from "../../lib/format";
import { Avatar } from "../common/Avatar";

interface ProfilePreviewCardProps {
  user: User;
}

export function ProfilePreviewCard({ user }: ProfilePreviewCardProps) {
  const navigate = useNavigate();
  const { currentUser, toggleFollow, requireAuth, getConversationWithUser } = useAuth();
  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="glass-panel-strong w-[320px] rounded-[1.8rem] p-4 shadow-2xl">
      <div className={`h-24 overflow-hidden rounded-[1.3rem] bg-gradient-to-br ${user.coverGradient}`}>
        {user.bannerImage ? <img src={user.bannerImage} alt={`${user.username} banner`} className="h-full w-full object-cover" /> : null}
      </div>
      <div className="-mt-9 flex items-end gap-3 px-2">
        <Avatar name={user.fullName} gradient={user.avatarGradient} imageUrl={user.profileImage} size="lg" ring />
        <div className="pb-1">
          <p className="headline-font text-lg font-semibold text-text">{user.nickname || user.fullName}</p>
          <p className="text-sm text-primary">@{user.username}</p>
        </div>
      </div>
      <p className="mt-3 px-2 text-sm leading-6 text-muted">
        {user.canViewFullProfile ? user.bio : "This private profile only shares limited details until you are approved."}
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2 px-2 text-center">
        <div className="rounded-2xl bg-white/75 px-3 py-2">
          <p className="text-sm font-semibold text-text">{formatCompactNumber(user.postsCount)}</p>
          <p className="text-[11px] text-muted">Posts</p>
        </div>
        <div className="rounded-2xl bg-white/75 px-3 py-2">
          <p className="text-sm font-semibold text-text">{formatCompactNumber(user.followers)}</p>
          <p className="text-[11px] text-muted">Followers</p>
        </div>
        <div className="rounded-2xl bg-white/75 px-3 py-2">
          <p className="text-sm font-semibold text-text">{formatCompactNumber(user.following)}</p>
          <p className="text-[11px] text-muted">Following</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 px-2">
        {!isOwnProfile && (
          <button
            type="button"
            onClick={() => toggleFollow(user.id)}
            className="rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-glow"
          >
            <span className="inline-flex items-center gap-2">
              <UserPlus2 className="h-4 w-4" />
              {user.isFollowing ? "Following" : user.hasRequestedFollow ? "Requested" : "Follow"}
            </span>
          </button>
        )}
        {!isOwnProfile && user.canMessage && (
          <button
            type="button"
            onClick={() => {
              if (!requireAuth("Please login or create an account to send messages.", "/messages")) {
                return;
              }

              const conversation = getConversationWithUser(user.id);
              navigate(conversation ? `/messages/${conversation.id}` : `/messages?compose=${user.username}`);
            }}
            className="rounded-2xl border border-white/70 bg-white/80 px-4 py-2 text-sm font-semibold text-text"
          >
            <span className="inline-flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Message
            </span>
          </button>
        )}
        <Link
          to={`/${user.username}`}
          className="rounded-2xl border border-white/70 bg-white/80 px-4 py-2 text-sm font-semibold text-text"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
