"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useEffect, useState } from "react";

const PILLARS = [
  { label: "All", value: "" },
  { label: "Spiritual Development", value: "spiritual_development" },
  { label: "Emotional Development", value: "emotional_development" },
  { label: "Financial & Career", value: "financial_career" },
  { label: "Discipleship & Leadership", value: "discipleship_leadership" },
];

const TYPE_ICONS: Record<string, string> = {
  pdf: "PDF",
  docx: "DOC",
  youtube: "YT",
  link: "URL",
  audio: "AUD",
};

const FILE_TYPES = new Set(["pdf", "docx", "audio"]);

function formatPillar(pillar: string): string {
  return pillar
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function LibraryPage() {
  const [pillar, setPillar] = useState("");
  const [categoryId, setCategoryId] = useState<
    Id<"libraryCategories"> | ""
  >("");
  const [search, setSearch] = useState("");
  const [downloadingId, setDownloadingId] = useState<
    Id<"materials"> | null
  >(null);

  const categories = useQuery(api.libraryCategories.list, {});

  const materials = useQuery(api.library.userList, {
    categoryId: categoryId || undefined,
    pillar: pillar || undefined,
  });

  const fileUrl = useQuery(
    api.library.getFileUrl,
    downloadingId ? { materialId: downloadingId } : "skip",
  );

  // When the file URL arrives, open it and reset the downloading state
  useEffect(() => {
    if (fileUrl && downloadingId) {
      window.open(fileUrl, "_blank");
      setDownloadingId(null);
    }
  }, [fileUrl, downloadingId]);

  const handleDownload = (materialId: Id<"materials">) => {
    setDownloadingId(materialId);
  };

  // Loading state
  if (materials === undefined || categories === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  // Client-side search filtering
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
        Browse learning materials and resources available to you.
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

      {/* Category filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryId("")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            categoryId === ""
              ? "bg-[#171717] text-white"
              : "bg-[#F0F0F0] text-[#525252] hover:bg-[#E5E5E5]"
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() =>
              setCategoryId(cat._id === categoryId ? "" : cat._id)
            }
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              categoryId === cat._id
                ? "bg-[#171717] text-white"
                : "bg-[#F0F0F0] text-[#525252] hover:bg-[#E5E5E5]"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Pillar filters */}
      <div className="mt-3 flex flex-wrap gap-2">
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

      {/* Materials grid */}
      {filtered.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-white py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E6FBF0]">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00D632"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 3h5l2 2h9v14H2V3z" />
            </svg>
          </div>
          <h2 className="mt-4 text-base font-semibold text-[#171717]">
            {materials.length === 0
              ? "No resources available yet"
              : "No materials match your search"}
          </h2>
          <p className="mt-1 text-sm text-[#737373]">
            {materials.length === 0
              ? "Resources will appear here once they are shared with you."
              : "Try adjusting your search or filters."}
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <div
              key={m._id}
              className="rounded-xl border border-[#E5E5E5] bg-white p-4 transition-colors hover:border-[#D4D4D4]"
            >
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

              <h3 className="mt-3 text-sm font-medium text-[#171717]">
                {m.title}
              </h3>
              {m.description && (
                <p className="mt-1 line-clamp-2 text-xs text-[#737373]">
                  {m.description}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {m.categoryName && (
                  <span className="rounded-full bg-[#F0F0F0] px-2 py-0.5 text-[10px] text-[#737373]">
                    {m.categoryName}
                  </span>
                )}
                {m.pillar && (
                  <span className="rounded-full bg-[#F0F0F0] px-2 py-0.5 text-[10px] text-[#737373]">
                    {formatPillar(m.pillar)}
                  </span>
                )}
              </div>

              <div className="mt-3">
                {FILE_TYPES.has(m.type) ? (
                  <button
                    onClick={() => handleDownload(m._id)}
                    disabled={downloadingId === m._id}
                    className="text-xs text-[#3B82F6] hover:underline disabled:opacity-50"
                  >
                    {downloadingId === m._id ? "Downloading..." : "Download"}
                  </button>
                ) : m.url ? (
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#3B82F6] hover:underline"
                  >
                    Open
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
