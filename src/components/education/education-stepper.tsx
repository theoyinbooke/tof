"use client";

import type { Doc } from "../../../convex/_generated/dataModel";

const STAGE_ORDER = [
  { key: "primary", label: "Primary" },
  { key: "jss", label: "JSS" },
  { key: "sss", label: "SSS" },
  { key: "jamb", label: "JAMB" },
  { key: "university", label: "University" },
  { key: "polytechnic", label: "Polytechnic" },
  { key: "coe", label: "COE" },
  { key: "nysc", label: "NYSC" },
  { key: "post_nysc", label: "Post-NYSC" },
] as const;

export function EducationStepper({
  records,
  onSelect,
  selectedStage,
}: {
  records: Doc<"educationRecords">[];
  onSelect: (stage: string) => void;
  selectedStage?: string;
}) {
  const completedStages = new Set(records.map((r) => r.stage));
  const currentStage = records.find((r) => r.isCurrent)?.stage;

  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {STAGE_ORDER.map((stage) => {
        const isCompleted = completedStages.has(stage.key);
        const isCurrent = currentStage === stage.key;
        const isSelected = selectedStage === stage.key;

        return (
          <button
            key={stage.key}
            onClick={() => onSelect(stage.key)}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-medium transition-colors ${
              isSelected
                ? "bg-[#171717] text-white"
                : isCurrent
                  ? "bg-[#00D632] text-white"
                  : isCompleted
                    ? "bg-[#E6FBF0] text-[#00D632]"
                    : "bg-[#F0F0F0] text-[#737373] hover:bg-[#E5E5E5]"
            }`}
          >
            {isCurrent && (
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
            )}
            {stage.label}
          </button>
        );
      })}
    </div>
  );
}

export function EducationStepperReadOnly({
  records,
}: {
  records: Doc<"educationRecords">[];
}) {
  const completedStages = new Set(records.map((r) => r.stage));
  const currentStage = records.find((r) => r.isCurrent)?.stage;

  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {STAGE_ORDER.map((stage) => {
        const isCompleted = completedStages.has(stage.key);
        const isCurrent = currentStage === stage.key;

        return (
          <span
            key={stage.key}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-medium ${
              isCurrent
                ? "bg-[#00D632] text-white"
                : isCompleted
                  ? "bg-[#E6FBF0] text-[#00D632]"
                  : "bg-[#F0F0F0] text-[#D4D4D4]"
            }`}
          >
            {isCurrent && (
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
            )}
            {stage.label}
          </span>
        );
      })}
    </div>
  );
}
