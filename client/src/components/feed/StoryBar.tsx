import { StoryCircle } from "./StoryCircle";
import type { Story, User } from "../../types/social";

interface StoryBarProps {
  stories: Story[];
  users: User[];
}

export function StoryBar({ stories, users }: StoryBarProps) {
  return (
    <div className="glass-panel overflow-hidden rounded-[2rem] p-4 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="headline-font text-lg font-semibold text-text">Stories</h2>
          <p className="text-sm text-muted">Fresh glimpses from creators in your orbit.</p>
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-1">
        {stories.map((story) => {
          const user = users.find((item) => item.id === story.userId);
          if (!user) {
            return null;
          }
          return <StoryCircle key={story.id} story={story} user={user} />;
        })}
      </div>
    </div>
  );
}

