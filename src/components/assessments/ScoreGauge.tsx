"use client";

interface ScoreGaugeProps {
  score: number;
  min: number;
  max: number;
  label: string;
  type: "bar" | "radial";
  color?: string;
}

/**
 * ScoreGauge — Visual score display.
 *  - "bar" renders a horizontal progress bar (for sum-scored instruments)
 *  - "radial" renders a semi-circle gauge (for mean-scored instruments)
 */
export function ScoreGauge({
  score,
  min,
  max,
  label,
  type,
  color = "#00D632",
}: ScoreGaugeProps) {
  const range = max - min;
  const fraction = range > 0 ? Math.max(0, Math.min(1, (score - min) / range)) : 0;
  const displayScore =
    score % 1 !== 0 ? score.toFixed(2) : String(score);

  if (type === "radial") {
    return <RadialGauge score={score} min={min} max={max} label={label} fraction={fraction} displayScore={displayScore} color={color} />;
  }

  return <BarGauge score={score} min={min} max={max} label={label} fraction={fraction} displayScore={displayScore} color={color} />;
}

function BarGauge({
  min,
  max,
  label,
  fraction,
  displayScore,
  color,
}: {
  score: number;
  min: number;
  max: number;
  label: string;
  fraction: number;
  displayScore: string;
  color: string;
}) {
  const percentage = fraction * 100;

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-[#737373]">{label}</p>
        <p className="text-2xl font-semibold text-[#171717]">{displayScore}</p>
      </div>
      <div className="relative mt-3">
        {/* Track */}
        <div className="h-3 w-full overflow-hidden rounded-full bg-[#F0F0F0]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>
        {/* Min / Max labels */}
        <div className="mt-1 flex justify-between">
          <span className="text-xs text-[#737373]">{min}</span>
          <span className="text-xs text-[#737373]">{max}</span>
        </div>
      </div>
    </div>
  );
}

function RadialGauge({
  min,
  max,
  label,
  fraction,
  displayScore,
  color,
}: {
  score: number;
  min: number;
  max: number;
  label: string;
  fraction: number;
  displayScore: string;
  color: string;
}) {
  // SVG semi-circle gauge
  const size = 180;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2 + 10; // shift down so semicircle is centered

  // Arc from 180deg (left) to 0deg (right) — semicircle
  const startAngle = Math.PI;
  const endAngle = 0;
  const sweepAngle = startAngle - (startAngle - endAngle) * fraction;

  const startX = cx + radius * Math.cos(startAngle);
  const startY = cy - radius * Math.sin(startAngle);
  const endX = cx + radius * Math.cos(endAngle);
  const endY = cy - radius * Math.sin(endAngle);
  const filledX = cx + radius * Math.cos(sweepAngle);
  const filledY = cy - radius * Math.sin(sweepAngle);

  const largeArc = fraction > 0.5 ? 1 : 0;

  const bgPath = `M ${startX} ${startY} A ${radius} ${radius} 0 1 1 ${endX} ${endY}`;
  const fillPath = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${filledX} ${filledY}`;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 30 }}>
        <svg
          width={size}
          height={size / 2 + 30}
          viewBox={`0 0 ${size} ${size / 2 + 30}`}
          className="overflow-visible"
        >
          {/* Background arc */}
          <path
            d={bgPath}
            fill="none"
            stroke="#F0F0F0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Filled arc */}
          {fraction > 0 && (
            <path
              d={fillPath}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          )}
        </svg>
        {/* Score text in center */}
        <div
          className="absolute flex flex-col items-center"
          style={{
            left: "50%",
            bottom: 0,
            transform: "translateX(-50%)",
          }}
        >
          <span className="text-3xl font-semibold text-[#171717]">{displayScore}</span>
        </div>
      </div>
      {/* Min / Max labels below */}
      <div className="flex w-full justify-between px-2" style={{ maxWidth: size }}>
        <span className="text-xs text-[#737373]">{min % 1 !== 0 ? min.toFixed(1) : min}</span>
        <span className="text-sm text-[#737373]">{label}</span>
        <span className="text-xs text-[#737373]">{max % 1 !== 0 ? max.toFixed(1) : max}</span>
      </div>
    </div>
  );
}
