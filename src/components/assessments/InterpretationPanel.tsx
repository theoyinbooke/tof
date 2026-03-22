interface InterpretationPanelProps {
  displayText: string;
  instrumentName: string;
  isClinicalInstrument: boolean;
  sessionTitle?: string;
  sessionPillar?: string;
}

export function InterpretationPanel({
  displayText,
  instrumentName,
  isClinicalInstrument,
  sessionTitle,
  sessionPillar,
}: InterpretationPanelProps) {
  return (
    <div className="space-y-4">
      {/* Main interpretation card */}
      <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
        <h3 className="text-sm font-semibold text-[#171717]">
          What This Means
        </h3>

        {displayText && (
          <p className="mt-3 text-sm leading-relaxed text-[#262626]">
            {displayText}
          </p>
        )}

        {/* Session connection */}
        {sessionTitle && (
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">
              Connection to your session
            </p>
            <p className="mt-1 text-sm text-[#262626]">
              This assessment relates to your{" "}
              <span className="font-medium">{sessionTitle}</span>
              {sessionPillar ? ` (${sessionPillar} pillar)` : ""} session.
              The skills and insights covered in the session are designed to
              support growth in the areas this assessment measures.
            </p>
          </div>
        )}

        {/* Encouragement */}
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">
            Next steps
          </p>
          <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-[#262626]">
            <li>Reflect on the session materials and how they connect to your results</li>
            <li>Talk with your mentor about areas you want to develop further</li>
            <li>Remember that growth takes time &mdash; every step counts</li>
          </ul>
        </div>
      </div>

      {/* Clinical disclaimer */}
      {isClinicalInstrument && (
        <div className="flex gap-3 rounded-xl border-l-4 border-[#3B82F6] bg-blue-50 p-4">
          <div className="mt-0.5 flex-shrink-0">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#262626]">
              Important Note
            </p>
            <p className="mt-1 text-sm text-[#262626]">
              The {instrumentName} is a screening tool, not a diagnosis. Your
              score indicates areas where additional support may be helpful. If
              you are struggling, please reach out to your mentor or a
              professional counselor. You are not alone.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
