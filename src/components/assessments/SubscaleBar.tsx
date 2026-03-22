interface SubscaleBarProps {
  name: string;
  score: number;
  min: number;
  max: number;
}

/**
 * Returns a color based on the score's position within its range.
 * Lower third = amber, Middle = amber/green, Upper third = green.
 */
function getBarColor(score: number, min: number, max: number): string {
  const range = max - min;
  if (range === 0) return "#00D632";
  const fraction = (score - min) / range;
  if (fraction >= 0.66) return "#00D632"; // green
  if (fraction >= 0.33) return "#F59E0B"; // amber
  return "#EF4444"; // red
}

export function SubscaleBar({ name, score, min, max }: SubscaleBarProps) {
  const range = max - min;
  const fraction = range > 0 ? Math.max(0, Math.min(1, (score - min) / range)) : 0;
  const percentage = fraction * 100;
  const displayScore = score % 1 !== 0 ? score.toFixed(2) : String(score);
  const displayMax = max % 1 !== 0 ? max.toFixed(1) : String(max);
  const color = getBarColor(score, min, max);

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-[#262626]">{name}</span>
        <span className="text-sm font-medium text-[#171717]">
          {displayScore} / {displayMax}
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-sm bg-[#F0F0F0]">
        <div
          className="h-full rounded-sm transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
