"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useRef } from "react";
import { Select } from "@/components/ui/select";

type Category = "identity" | "education" | "support_evidence" | "other";

const CATEGORY_OPTIONS: { label: string; value: Category }[] = [
  { label: "Identity", value: "identity" },
  { label: "Education", value: "education" },
  { label: "Support Evidence", value: "support_evidence" },
  { label: "Other", value: "other" },
];

const FILE_TYPE_ICONS: Record<string, string> = {
  "application/pdf": "PDF",
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const user = useQuery(api.users.currentUser);
  const documents = useQuery(api.documents.getMyDocuments, {});
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const createDocument = useMutation(api.documents.create);
  const deleteDocument = useMutation(api.documents.remove);

  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState<Category>("other");
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (user === undefined || documents === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  if (!user) return null;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await response.json();

      await createDocument({
        ownerId: user._id,
        storageId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        category,
        visibility: "owner_and_admin",
        description: description || undefined,
      });

      setDescription("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: typeof documents[0]["_id"]) => {
    await deleteDocument({ documentId });
  };

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-xl font-semibold text-[#171717]">Documents</h1>
      <p className="mt-1 text-sm text-[#737373]">
        Upload and manage your documents securely.
      </p>

      {/* Upload form */}
      <div className="mt-6 rounded-xl border border-[#E5E5E5] bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">
          Upload Document
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm text-[#262626]">Category</label>
            <Select
              value={category}
              onChange={(val) => setCategory(val as Category)}
              options={CATEGORY_OPTIONS}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-[#262626]">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm text-[#171717] outline-none focus:border-[#171717] placeholder:text-[#D4D4D4]"
            />
          </div>
        </div>
        <div className="mt-4">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleUpload}
            disabled={uploading}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            className="block w-full text-sm text-[#737373] file:mr-3 file:rounded-md file:border-0 file:bg-[#171717] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#262626] disabled:opacity-50"
          />
          {uploading && (
            <p className="mt-2 text-xs text-[#737373]">Uploading...</p>
          )}
        </div>
      </div>

      {/* Document list */}
      {documents.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-white py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E6FBF0]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D632" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
          </div>
          <h2 className="mt-4 text-base font-semibold text-[#171717]">No documents</h2>
          <p className="mt-1 text-sm text-[#737373]">Upload your first document above.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
          {documents.map((doc, i) => (
            <div
              key={doc._id}
              className={`flex items-center justify-between px-4 py-3 ${
                i > 0 ? "border-t border-[#F0F0F0]" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-10 items-center justify-center rounded bg-[#F0F0F0] text-[10px] font-bold text-[#525252]">
                  {FILE_TYPE_ICONS[doc.fileType] || "FILE"}
                </span>
                <div>
                  <p className="text-sm font-medium text-[#171717]">{doc.fileName}</p>
                  <p className="text-xs text-[#737373]">
                    {formatFileSize(doc.fileSize)} &middot; {doc.category.replace("_", " ")}
                    {doc.description && ` &middot; ${doc.description}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-[#E5E5E5] px-2 py-0.5 text-[10px] text-[#737373]">
                  {doc.visibility.replace(/_/g, " ")}
                </span>
                <button
                  onClick={() => handleDelete(doc._id)}
                  className="rounded p-1 text-[#D4D4D4] hover:text-[#EF4444]"
                  aria-label="Delete document"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M2 4h10M5 4V3a1 1 0 011-1h2a1 1 0 011 1v1M11 4v7a1 1 0 01-1 1H4a1 1 0 01-1-1V4" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
