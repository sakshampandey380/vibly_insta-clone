import { motion } from "framer-motion";
import type { Story, User } from "../../types/social";
import { Avatar } from "../common/Avatar";

interface StoryCircleProps {
  story: Story;
  user: User;
}

export function StoryCircle({ story, user }: StoryCircleProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="flex min-w-[84px] flex-col items-center gap-2 text-center"
    >
      <div className={`rounded-full bg-gradient-to-br p-[2px] ${story.gradient} animate-pulseRing`}>
        <div className="rounded-full bg-white p-[3px]">
          <Avatar name={user.fullName} gradient={user.avatarGradient} size="md" />
        </div>
      </div>
      <div>
        <p className="max-w-[82px] truncate text-xs font-semibold text-text">{user.username}</p>
        <p className="max-w-[82px] truncate text-[11px] text-muted">{story.caption}</p>
      </div>
    </motion.button>
  );
}

