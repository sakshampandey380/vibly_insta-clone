import { getInitials } from "../../lib/format";
import { cn } from "../../lib/cn";

interface AvatarProps {
  name: string;
  gradient: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  ring?: boolean;
}

const sizes = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl"
};

export function Avatar({ name, gradient, imageUrl, size = "md", ring = false }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br font-semibold text-white shadow-lg",
        sizes[size],
        gradient,
        ring && "ring-2 ring-white/80 ring-offset-2 ring-offset-transparent"
      )}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}
