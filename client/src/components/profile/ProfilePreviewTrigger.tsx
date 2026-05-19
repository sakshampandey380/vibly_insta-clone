import type { ReactNode } from "react";
import type { User } from "../../types/social";
import { ProfilePreviewCard } from "./ProfilePreviewCard";

interface ProfilePreviewTriggerProps {
  user: User;
  children: ReactNode;
}

export function ProfilePreviewTrigger({ user, children }: ProfilePreviewTriggerProps) {
  return (
    <div className="group/preview relative">
      {children}
      <div className="pointer-events-none absolute left-0 top-full z-30 hidden pt-3 opacity-0 transition duration-200 group-hover/preview:pointer-events-auto group-hover/preview:opacity-100 md:block">
        <ProfilePreviewCard user={user} />
      </div>
    </div>
  );
}
