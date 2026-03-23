"use client";

interface KPICardProps {
  label: string;
  value: string | number;
  subtext: string;
  accent?: string;
}

export function KPICard({ label, value, subtext, accent }: KPICardProps) {
  return (
    <div
      className="min-w-0 rounded-xl border border-[#E5E5E5] bg-white p-5"
      style={accent ? { borderLeftColor: accent, borderLeftWidth: "3px" } : undefined}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">
        {label}
      </p>
      <p className="mt-2 truncate text-2xl font-semibold text-[#171717]">{value}</p>
      <p className="mt-0.5 text-xs text-[#737373]">{subtext}</p>
    </div>
  );
}
