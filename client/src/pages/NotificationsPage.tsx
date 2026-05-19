import { useEffect } from "react";
import { EmptyState } from "../components/common/EmptyState";
import { Layout } from "../components/layout/Layout";
import { NotificationItem } from "../components/notifications/NotificationItem";
import { useAuth } from "../contexts/AuthContext";

export function NotificationsPage() {
  const { currentUser, users, notifications, requireAuth } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      requireAuth("Please login or create an account to view notifications.", "/notifications");
    }
  }, [currentUser, requireAuth]);

  if (!currentUser) {
    return (
      <Layout>
        <EmptyState
          title="Notifications are private"
          description="Likes, follows, and message updates will appear here after you log in."
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="glass-panel rounded-[2rem] p-6 shadow-soft">
          <h1 className="headline-font text-3xl font-semibold text-text">Notifications</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Stay updated with follows, likes, comments, and direct message activity.
          </p>
        </div>
        <div className="space-y-4">
          {notifications.map((notification) => {
            const actor = users.find((user) => user.id === notification.actorId);
            if (!actor) {
              return null;
            }
            return <NotificationItem key={notification.id} notification={notification} actor={actor} />;
          })}
        </div>
      </div>
    </Layout>
  );
}

