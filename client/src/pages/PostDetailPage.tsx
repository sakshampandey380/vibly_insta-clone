import { useParams } from "react-router-dom";
import { EmptyState } from "../components/common/EmptyState";
import { Layout } from "../components/layout/Layout";
import { PostCard } from "../components/feed/PostCard";
import { useAuth } from "../contexts/AuthContext";

export function PostDetailPage() {
  const { postId } = useParams();
  const { posts, users } = useAuth();
  const post = posts.find((item) => item.id === Number(postId));

  return (
    <Layout>
      <div className="mx-auto max-w-3xl">
        {post ? (
          <PostCard post={post} users={users} />
        ) : (
          <EmptyState
            title="Post not found"
            description="This post does not exist in the current phase-1 feed dataset."
          />
        )}
      </div>
    </Layout>
  );
}

