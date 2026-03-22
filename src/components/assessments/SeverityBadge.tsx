interface SeverityBadgeProps {
  band: string;
  flagBehavior?: "none" | "mentor_notify" | "admin_review";
}

const FLAG_STYLES: Record<string, string> = {
  admin_review: "bg-red-50 text-red-600",
  mentor_notify: "bg-orange-50 text-orange-600",
  none: "bg-[#E6FBF0] text-[#00D632]",
};

/**
 * Determines badge style from the flag behavior.
 * Falls back to heuristic based on band label keywords.
 */
function getStyle(
  flagBehavior?: string,
  band?: string,
): string {
  if (flagBehavior && flagBehavior in FLAG_STYLES) {
    return FLAG_STYLES[flagBehavior];
  }

  // Heuristic fallback based on common band label keywords
  const lower = (band || "").toLowerCase();
  if (
    lower.includes("severe") ||
    lower.includes("crisis") ||
    lower.includes("very low") ||
    lower.includes("high anxiety")
  ) {
    return FLAG_STYLES.admin_review;
  }
  if (
    lower.includes("moderate") ||
    lower.includes("below average") ||
    lower.includes("low ")
  ) {
    return "bg-yellow-50 text-yellow-600";
  }
  if (
    lower.includes("mild") ||
    lower.includes("average") ||
    lower.includes("developing")
  ) {
    return "bg-yellow-50 text-yellow-600";
  }

  // Default: green for positive / healthy
  return FLAG_STYLES.none;
}

export function SeverityBadge({ band, flagBehavior }: SeverityBadgeProps) {
  const style = getStyle(flagBehavior, band);

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {band}
    </span>
  );
}
