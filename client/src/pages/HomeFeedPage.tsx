import { Compass, Flame, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { PostCard } from "../components/feed/PostCard";
import { StoryBar } from "../components/feed/StoryBar";
import { Avatar } from "../components/common/Avatar";
import { useAuth } from "../contexts/AuthContext";

export function HomeFeedPage() {
  const { currentUser, users, posts, stories, conversations } = useAuth();

  const rightPanel = (
    <div className="space-y-5">
      <div className="glass-panel rounded-[2rem] p-5 shadow-soft">
        <div className="flex items-center gap-3">
          {currentUser ? (
            <Avatar name={currentUser.fullName} gradient={currentUser.avatarGradient} imageUrl={currentUser.profileImage} size="lg" ring />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-sky-100 to-fuchsia-100 text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
          )}
          <div>
            <p className="headline-font text-lg font-semibold text-text">
              {currentUser ? currentUser.fullName : "Public preview mode"}
            </p>
            <p className="text-sm text-muted">
              {currentUser ? `@${currentUser.username}` : "Browse the vibe before joining."}
            </p>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-[2rem] p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="headline-font text-lg font-semibold text-text">Suggestions</h3>
          <Compass className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-3">
          {users.slice(1, 4).map((user) => (
            <Link key={user.id} to={`/${user.username}`} className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-white/70">
              <Avatar name={user.fullName} gradient={user.avatarGradient} imageUrl={user.profileImage} size="sm" />
              <div>
                <p className="text-sm font-semibold text-text">{user.username}</p>
                <p className="text-xs text-muted">{user.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="glass-panel rounded-[2rem] p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="headline-font text-lg font-semibold text-text">Message preview</h3>
          <MessageCircle className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-3">
          {conversations.slice(0, 3).map((conversation) => {
            const otherUser = users.find(
              (user) => conversation.participantIds.includes(user.id) && user.id !== (currentUser?.id ?? 1)
            );
            if (!otherUser) {
              return null;
            }
            return (
              <div key={conversation.id} className="rounded-2xl bg-white/75 p-3">
                <p className="text-sm font-semibold text-text">{otherUser.fullName}</p>
                <p className="mt-1 text-sm text-muted">{conversation.lastMessage}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-panel rounded-[2rem] p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="headline-font text-lg font-semibold text-text">Trending</h3>
          <Flame className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-3 text-sm text-muted">
          <div className="rounded-2xl bg-white/75 p-3">#GlassVibes</div>
          <div className="rounded-2xl bg-white/75 p-3">#DreamyEdits</div>
          <div className="rounded-2xl bg-white/75 p-3">#PastelCreators</div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout rightPanel={rightPanel}>
      <div className="mx-auto max-w-3xl space-y-5">
        <StoryBar stories={stories} users={users} />
        {posts.map((post) => (
          <PostCard key={post.id} post={post} users={users} />
        ))}
      </div>
    </Layout>
  );
}
