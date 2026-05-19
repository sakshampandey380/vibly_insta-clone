import { Layout } from "../components/layout/Layout";
import { ReelsViewer } from "../components/reels/ReelsViewer";
import { useAuth } from "../contexts/AuthContext";

export function ReelsPage() {
  const { reels, users } = useAuth();

  return (
    <Layout>
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="glass-panel rounded-[2rem] p-6 shadow-soft">
          <h1 className="headline-font text-3xl font-semibold text-text">Reels</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Vertical snap-ready reel cards with public viewing and auth-gated reactions.
          </p>
        </div>
        <ReelsViewer reels={reels} users={users} />
      </div>
    </Layout>
  );
}

