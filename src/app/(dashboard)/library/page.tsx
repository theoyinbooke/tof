"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";

const PILLARS = [
  { label: "All", value: "" },
  { label: "Personal Development", value: "personal_development" },
  { label: "Academic Excellence", value: "academic_excellence" },
  { label: "Career Readiness", value: "career_readiness" },
  { label: "Financial Literacy", value: "financial_literacy" },
  { label: "Health & Wellness", value: "health_wellness" },
  { label: "Leadership", value: "leadership" },
];

const TYPE_ICONS: Record<string, string> = {
  pdf: "PDF",
  docx: "DOC",
  youtube: "YT",
  link: "URL",
  audio: "AUD",
};

export default function LibraryPage() {
  const [pillar, setPillar] = useState("");
  const [search, setSearch] = useState("");

  const materials = useQuery(api.materials.list, {
    pillar: pillar || undefined,
  });

  if (materials === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  const filtered = search
    ? materials.filter(
        (m) =>
          m.title.toLowerCase().includes(search.toLowerCase()) ||
          m.description?.toLowerCase().includes(search.toLowerCase()),
      )
    : materials;

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-xl font-semibold text-[#171717]">Resource Library</h1>
      <p className="mt-1 text-sm text-[#737373]">
        Browse learning materials by pillar.
      </p>

      {/* Search */}
      <div className="mt-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search materials..."
          className="h-11 w-full max-w-md rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm text-[#171717] outline-none focus:border-[#171717] placeholder:text-[#D4D4D4]"
        />
      </div>

      {/* Pillar filter */}
      <div className="mt-4 flex flex-wrap gap-2">
        {PILLARS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPillar(p.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              pillar === p.value
                ? "bg-[#171717] text-white"
                : "bg-[#F0F0F0] text-[#525252] hover:bg-[#E5E5E5]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Materials */}
      {filtered.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-white py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E6FBF0]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D632" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h5l2 2h9v14H2V3z" />
            </svg>
          </div>
          <h2 className="mt-4 text-base font-semibold text-[#171717]">No materials</h2>
          <p className="mt-1 text-sm text-[#737373]">
            {search ? "No materials match your search." : "No materials available in this category."}
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <div key={m._id} className="rounded-xl border border-[#E5E5E5] bg-white p-4 transition-colors hover:border-[#D4D4D4]">
              <div className="flex items-start justify-between">
                <span className="inline-flex h-8 w-10 items-center justify-center rounded bg-[#F0F0F0] text-[10px] font-bold text-[#525252]">
                  {TYPE_ICONS[m.type] || m.type.toUpperCase()}
                </span>
                {m.isRequired && (
                  <span className="rounded-full bg-[#00D632] px-2 py-0.5 text-[10px] font-medium text-white">
                    Required
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-sm font-medium text-[#171717]">{m.title}</h3>
              {m.description && (
                <p className="mt-1 line-clamp-2 text-xs text-[#737373]">{m.description}</p>
              )}
              <div className="mt-3 flex items-center gap-2">
                {m.pillar && (
                  <span className="rounded-full bg-[#F0F0F0] px-2 py-0.5 text-[10px] text-[#737373]">
                    {m.pillar.replace("_", " ")}
                  </span>
                )}
                {m.url && (
                  <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#3B82F6] hover:underline">
                    Open
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
