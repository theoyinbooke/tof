export function PrivacyNotice() {
  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] p-4">
      <div className="flex items-start gap-2">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#737373"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-0.5 flex-shrink-0"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        <div>
          <p className="text-xs font-semibold text-[#525252]">
            About Your Results
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#737373]">
            Your results are private. They are shared only with your assigned
            mentor (to support you better) and program administrators (only if
            your score indicates you may need additional support). Your results
            are used to help us support you, never to judge you. If you have
            questions, speak with your mentor.
          </p>
        </div>
      </div>
    </div>
  );
}
