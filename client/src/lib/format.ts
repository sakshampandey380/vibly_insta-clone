export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(
    value
  );
}

export function timeAgo(input: string): string {
  const now = new Date();
  const target = new Date(input);
  const diffSeconds = Math.max(1, Math.floor((now.getTime() - target.getTime()) / 1000));

  const units = [
    { limit: 60, name: "s", size: 1 },
    { limit: 3600, name: "m", size: 60 },
    { limit: 86400, name: "h", size: 3600 },
    { limit: 604800, name: "d", size: 86400 }
  ];

  const match = units.find((unit) => diffSeconds < unit.limit);
  if (match) {
    return `${Math.floor(diffSeconds / match.size)}${match.name}`;
  }

  return target.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

