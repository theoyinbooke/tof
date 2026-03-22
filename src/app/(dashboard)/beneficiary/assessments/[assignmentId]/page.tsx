"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { use, useState, useCallback } from "react";
import Link from "next/link";

export default function AssessmentCompletionPage({ params }: { params: Promise<{ assignmentId: string }> }) {
  const { assignmentId } = use(params);
  const id = assignmentId as Id<"assessmentAssignments">;

  const assignment = useQuery(api.assessments.assignments.getById, { assignmentId: id });
  const saveProgress = useMutation(api.assessments.responses.saveProgress);
  const submitAssessment = useMutation(api.assessments.responses.submit);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Initialize answers from existing response
  const existingAnswers = assignment?.response?.answers;
  const initialized = useCallback(() => {
    if (existingAnswers && Object.keys(answers).length === 0) {
      setAnswers(existingAnswers);
    }
  }, [existingAnswers, answers]);
  initialized();

  if (assignment === undefined) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" /></div>;
  }

  if (!assignment || !assignment.template) {
    return <div className="p-6 lg:p-10"><Link href="/beneficiary/assessments" className="text-sm text-[#737373]">&larr; Back</Link><p className="mt-8 text-center">Assignment not found.</p></div>;
  }

  const template = assignment.template;
  const items = template.items;
  const totalItems = items.length;
  const currentItem = items[currentIndex];
  const isCompleted = assignment.status === "completed" || submitted;

  if (isCompleted && assignment.score) {
    return (
      <div className="p-6 lg:p-10">
        <Link href="/beneficiary/assessments" className="text-sm text-[#737373] hover:text-[#171717]">&larr; Back to assessments</Link>
        <div className="mx-auto mt-6 max-w-lg">
          <div className="rounded-xl border border-[#E5E5E5] bg-white p-8 text-center">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-[#E6FBF0]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00D632" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
              </svg>
            </div>
            <h1 className="mt-4 text-xl font-semibold text-[#171717]">Assessment Complete</h1>
            <p className="mt-2 text-sm text-[#737373]">{template.name}</p>
            <div className="mt-6 rounded-lg bg-[#F7F7F7] p-4">
              <p className="text-3xl font-semibold text-[#171717]">{assignment.score.totalScore}</p>
              <p className="mt-1 text-sm text-[#737373]">Total Score</p>
              {assignment.score.severityBand && (
                <span className="mt-2 inline-block rounded-full bg-[#F0F0F0] px-3 py-1 text-xs font-medium text-[#525252]">
                  {assignment.score.severityBand}
                </span>
              )}
            </div>
            {assignment.score.interpretation && (
              <p className="mt-4 text-sm text-[#737373]">{assignment.score.interpretation}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleAnswer = async (value: number) => {
    const newAnswers = { ...answers, [String(currentItem.itemNumber)]: value };
    setAnswers(newAnswers);

    // Auto-save progress
    setSaving(true);
    try {
      await saveProgress({
        assignmentId: id,
        answers: { [String(currentItem.itemNumber)]: value },
      });
    } finally {
      setSaving(false);
    }

    // Auto-advance after short delay
    if (currentIndex < totalItems - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await submitAssessment({ assignmentId: id });
      setSubmitted(true);
    } finally {
      setSaving(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / totalItems) * 100);
  const currentAnswer = answers[String(currentItem?.itemNumber)];
  const canSubmit = answeredCount >= totalItems;

  return (
    <div className="p-6 lg:p-10">
      <Link href="/beneficiary/assessments" className="text-sm text-[#737373] hover:text-[#171717]">&larr; Back</Link>

      <div className="mx-auto mt-4 max-w-lg">
        {/* Header */}
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">{template.shortCode}</p>
          <h1 className="mt-1 text-lg font-semibold text-[#171717]">{template.name}</h1>
        </div>

        {/* Progress bar */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-[#E5E5E5]">
            <div className="h-full rounded-full bg-[#00D632] transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-[#737373]">{answeredCount}/{totalItems}</span>
        </div>

        {/* Question card */}
        {currentItem && (
          <div className="mt-6 rounded-xl border border-[#E5E5E5] bg-white p-6">
            <p className="text-xs font-medium text-[#737373]">Question {currentIndex + 1} of {totalItems}</p>
            <p className="mt-3 text-base font-medium text-[#171717]">{currentItem.text}</p>

            <div className="mt-6 space-y-2">
              {currentItem.responseOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  disabled={saving}
                  className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors ${
                    currentAnswer === option.value
                      ? "border-[#00D632] bg-[#E6FBF0] text-[#171717]"
                      : "border-[#E5E5E5] text-[#262626] hover:border-[#D4D4D4] hover:bg-[#F7F7F7]"
                  }`}
                >
                  <span>{option.label}</span>
                  {currentAnswer === option.value && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#00D632" strokeWidth="2" strokeLinecap="round">
                      <path d="M4 8l3 3 5-5" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="rounded-md px-4 py-2 text-sm text-[#737373] hover:text-[#171717] disabled:opacity-30"
          >
            &larr; Previous
          </button>

          {currentIndex < totalItems - 1 ? (
            <button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              className="rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white hover:bg-[#262626]"
            >
              Next &rarr;
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || saving}
              className="rounded-md bg-[#00D632] px-4 py-2 text-sm font-medium text-white hover:bg-[#00C02D] disabled:opacity-50"
            >
              {saving ? "Submitting..." : "Submit Assessment"}
            </button>
          )}
        </div>

        {saving && <p className="mt-2 text-center text-xs text-[#737373]">Saving...</p>}
      </div>
    </div>
  );
}
