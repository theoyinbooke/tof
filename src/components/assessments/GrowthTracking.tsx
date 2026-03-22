"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ScoreDataPoint {
  totalScore?: number;
  subscaleScores?: Record<string, number>;
  severityBand?: string;
  scoredAt: number;
}

interface GrowthTrackingProps {
  currentScore: ScoreDataPoint;
  previousScores: ScoreDataPoint[];
  instrumentName: string;
  subscaleOnly?: boolean;
  /** For instruments like GAD-7 where lower is better */
  lowerIsBetter?: boolean;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatShortDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

// Instruments where lower scores are better
const LOWER_IS_BETTER = ["GAD-7"];

export function GrowthTracking({
  currentScore,
  previousScores,
  instrumentName,
  subscaleOnly,
  lowerIsBetter: lowerIsBetterProp,
}: GrowthTrackingProps) {
  const allScores = [...previousScores, currentScore];

  if (allScores.length < 2) return null;

  const lowerIsBetter =
    lowerIsBetterProp ?? LOWER_IS_BETTER.includes(instrumentName);

  if (subscaleOnly) {
    return (
      <SubscaleGrowth
        allScores={allScores}
        lowerIsBetter={lowerIsBetter}
      />
    );
  }

  // Total score growth
  const dataPoints = allScores
    .filter((s) => s.totalScore !== undefined)
    .map((s, i) => ({
      name: i === allScores.length - 1 ? "Now" : formatShortDate(s.scoredAt),
      score: s.totalScore!,
      date: formatDate(s.scoredAt),
    }));

  if (dataPoints.length < 2) return null;

  const latest = dataPoints[dataPoints.length - 1].score;
  const previous = dataPoints[dataPoints.length - 2].score;
  const diff = latest - previous;
  const absDiff =
    Math.abs(diff) % 1 !== 0 ? Math.abs(diff).toFixed(2) : String(Math.abs(diff));

  const improved = lowerIsBetter ? diff < 0 : diff > 0;
  const unchanged = diff === 0;

  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
      <h3 className="text-sm font-semibold text-[#171717]">Your Growth</h3>

      <div className="mt-4 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dataPoints}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#737373" }}
              axisLine={{ stroke: "#E5E5E5" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#737373" }}
              axisLine={{ stroke: "#E5E5E5" }}
              tickLine={false}
              width={35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #E5E5E5",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: unknown) => [String(value), "Score"]}
              labelFormatter={(label: unknown, payload: unknown) => {
                const items = payload as Array<{ payload?: { date?: string } }> | undefined;
                const item = items?.[0]?.payload;
                return item?.date || String(label);
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#00D632"
              strokeWidth={2}
              dot={{ fill: "#00D632", r: 5, strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 7, stroke: "#00D632", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Change indicator */}
      <div className="mt-4 flex items-center gap-2">
        {unchanged ? (
          <>
            <ArrowSideways />
            <span className="text-sm text-[#737373]">
              Your score stayed consistent
            </span>
          </>
        ) : improved ? (
          <>
            <ArrowUp />
            <span className="text-sm text-[#00D632]">
              Improved by {absDiff} since your last assessment
            </span>
          </>
        ) : (
          <>
            <ArrowDown />
            <span className="text-sm text-[#F59E0B]">
              Changed by {absDiff} since your last assessment
            </span>
          </>
        )}
      </div>

      {improved && (
        <p className="mt-2 text-sm text-[#262626]">
          Great progress! Keep up the effort you have been putting in.
        </p>
      )}
    </div>
  );
}

/**
 * For subscale-only instruments, show growth per subscale.
 */
function SubscaleGrowth({
  allScores,
  lowerIsBetter,
}: {
  allScores: ScoreDataPoint[];
  lowerIsBetter: boolean;
}) {
  // Collect all subscale names
  const subscaleNames = new Set<string>();
  for (const s of allScores) {
    if (s.subscaleScores) {
      for (const name of Object.keys(s.subscaleScores)) {
        subscaleNames.add(name);
      }
    }
  }

  if (subscaleNames.size === 0) return null;

  const latest = allScores[allScores.length - 1];
  const previous = allScores[allScores.length - 2];

  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
      <h3 className="text-sm font-semibold text-[#171717]">Your Growth</h3>

      <div className="mt-4 space-y-3">
        {Array.from(subscaleNames).map((name) => {
          const currentVal = latest.subscaleScores?.[name];
          const prevVal = previous?.subscaleScores?.[name];

          if (currentVal === undefined || prevVal === undefined) return null;

          const diff = currentVal - prevVal;
          const absDiff =
            Math.abs(diff) % 1 !== 0
              ? Math.abs(diff).toFixed(2)
              : String(Math.abs(diff));
          const improved = lowerIsBetter ? diff < 0 : diff > 0;
          const unchanged = diff === 0;
          const displayCurrent =
            currentVal % 1 !== 0 ? currentVal.toFixed(2) : String(currentVal);
          const displayPrev =
            prevVal % 1 !== 0 ? prevVal.toFixed(2) : String(prevVal);

          return (
            <div
              key={name}
              className="flex items-center justify-between rounded-lg bg-[#F7F7F7] px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-[#171717]">{name}</p>
                <p className="text-xs text-[#737373]">
                  {displayPrev} &rarr; {displayCurrent}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {unchanged ? (
                  <ArrowSideways />
                ) : improved ? (
                  <ArrowUp />
                ) : (
                  <ArrowDown />
                )}
                <span
                  className={`text-sm font-medium ${
                    unchanged
                      ? "text-[#737373]"
                      : improved
                        ? "text-[#00D632]"
                        : "text-[#F59E0B]"
                  }`}
                >
                  {unchanged ? "Same" : `${improved ? "+" : "-"}${absDiff}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ArrowUp() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="#00D632"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 12V4" />
      <path d="M4 8l4-4 4 4" />
    </svg>
  );
}

function ArrowDown() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="#F59E0B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 4v8" />
      <path d="M4 8l4 4 4-4" />
    </svg>
  );
}

function ArrowSideways() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="#737373"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8h10" />
      <path d="M10 5l3 3-3 3" />
    </svg>
  );
}
