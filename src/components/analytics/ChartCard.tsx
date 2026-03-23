"use client";

import type { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, description, children, className }: ChartCardProps) {
  return (
    <div className={`min-w-0 rounded-xl border border-[#E5E5E5] bg-white ${className || ""}`}>
      <div className="border-b border-[#F0F0F0] px-6 py-4">
        <h3 className="text-sm font-semibold text-[#171717]">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-[#737373]">{description}</p>
        )}
      </div>
      <div className="min-w-0 p-6">{children}</div>
    </div>
  );
}
