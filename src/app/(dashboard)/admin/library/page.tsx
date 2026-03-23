"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useState, useRef } from "react";
import { Select } from "@/components/ui/select";
import {
  SuccessToast,
  ErrorToast,
  useMutationWithError,
} from "@/components/ui/mutation-error-toast";

const TYPE_OPTIONS = [
  { label: "PDF", value: "pdf" },
  { label: "Document", value: "docx" },
  { label: "YouTube", value: "youtube" },
  { label: "Link", value: "link" },
  { label: "Audio", value: "audio" },
];

const VISIBILITY_OPTIONS = [
  { label: "Public", value: "public" },
  { label: "Restricted", value: "restricted" },
];

const PILLAR_OPTIONS = [
  { label: "None", value: "" },
  { label: "Spiritual Development", value: "spiritual_development" },
  { label: "Emotional Development", value: "emotional_development" },
  { label: "Financial & Career", value: "financial_career" },
  { label: "Discipleship & Leadership", value: "discipleship_leadership" },
];

const TYPE_LABELS: Record<string, string> = {
  pdf: "PDF",
  docx: "DOC",
  youtube: "YT",
  link: "URL",
  audio: "AUD",
};

type Tab = "resources" | "categories";

export default function AdminLibraryPage() {
  const [tab, setTab] = useState<Tab>("resources");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { error, clearError, handleError } = useMutationWithError();

  return (
    <div className="p-6 lg:p-10">
      {successMsg && (
        <SuccessToast
          message={successMsg}
          onClose={() => setSuccessMsg(null)}
        />
      )}
      {error && <ErrorToast message={error} onClose={clearError} />}

      <h1 className="text-xl font-semibold text-[#171717]">
        Library Management
      </h1>
      <p className="mt-1 text-sm text-[#737373]">
        Upload resources, manage categories, and control access.
      </p>

      {/* Tabs */}
      <div className="mt-4 flex gap-4 border-b border-[#E5E5E5]">
        {(["resources", "categories"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
              tab === t
                ? "border-[#171717] text-[#171717]"
                : "border-transparent text-[#737373] hover:text-[#525252]"
            }`}
          >
            {t === "resources" ? "Resources" : "Categories"}
          </button>
        ))}
      </div>

      {tab === "resources" ? (
        <ResourcesTab onSuccess={setSuccessMsg} onError={handleError} />
      ) : (
        <CategoriesTab onSuccess={setSuccessMsg} onError={handleError} />
      )}
    </div>
  );
}

// ─── Resources Tab ───

function ResourcesTab({
  onSuccess,
  onError,
}: {
  onSuccess: (msg: string) => void;
  onError: (err: unknown) => void;
}) {
  const [filterCategory, setFilterCategory] = useState("");
  const [filterVisibility, setFilterVisibility] = useState("");
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [accessMaterialId, setAccessMaterialId] = useState<
    Id<"materials"> | null
  >(null);

  const categories = useQuery(api.libraryCategories.list, {});
  const materials = useQuery(api.library.adminList, {
    categoryId: filterCategory
      ? (filterCategory as Id<"libraryCategories">)
      : undefined,
    visibility: filterVisibility
      ? (filterVisibility as "public" | "restricted")
      : undefined,
  });

  const removeMaterial = useMutation(api.materials.remove);

  if (materials === undefined || categories === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  const categoryOptions = [
    { label: "All Categories", value: "" },
    ...categories.map((c) => ({ label: c.name, value: c._id })),
  ];

  const visibilityOptions = [
    { label: "All Visibility", value: "" },
    ...VISIBILITY_OPTIONS,
  ];

  const filtered = search
    ? materials.filter(
        (m) =>
          m.title.toLowerCase().includes(search.toLowerCase()) ||
          m.description?.toLowerCase().includes(search.toLowerCase()),
      )
    : materials;

  const handleDelete = async (
    materialId: Id<"materials">,
    title: string,
  ) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await removeMaterial({ materialId });
      onSuccess(`"${title}" deleted.`);
    } catch (err) {
      onError(err);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filterCategory}
            onChange={setFilterCategory}
            options={categoryOptions}
            placeholder="All Categories"
          />
          <Select
            value={filterVisibility}
            onChange={setFilterVisibility}
            options={visibilityOptions}
            placeholder="All Visibility"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="h-11 w-full sm:w-48 rounded-lg border border-[#E5E5E5] px-3 text-sm outline-none focus:border-[#171717] placeholder:text-[#D4D4D4]"
          />
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white hover:bg-[#262626]"
        >
          {showUpload ? "Cancel" : "+ Upload Resource"}
        </button>
      </div>

      {showUpload && (
        <UploadForm
          categories={categories}
          onSuccess={(msg) => {
            onSuccess(msg);
            setShowUpload(false);
          }}
          onError={onError}
        />
      )}

      {accessMaterialId && (
        <AccessDialog
          materialId={accessMaterialId}
          onClose={() => setAccessMaterialId(null)}
          onSuccess={onSuccess}
          onError={onError}
        />
      )}

      {/* Resources Table */}
      {filtered.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-white py-16">
          <h2 className="text-base font-semibold text-[#171717]">
            No resources
          </h2>
          <p className="mt-1 text-sm text-[#737373]">
            {materials.length === 0
              ? "Upload your first resource."
              : "No resources match your filters."}
          </p>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-[#E5E5E5] bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA]">
                <th className="px-4 py-3 text-xs font-medium text-[#737373]">
                  Title
                </th>
                <th className="px-4 py-3 text-xs font-medium text-[#737373]">
                  Type
                </th>
                <th className="px-4 py-3 text-xs font-medium text-[#737373]">
                  Category
                </th>
                <th className="px-4 py-3 text-xs font-medium text-[#737373]">
                  Visibility
                </th>
                <th className="px-4 py-3 text-xs font-medium text-[#737373]">
                  Access
                </th>
                <th className="px-4 py-3 text-xs font-medium text-[#737373]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr
                  key={m._id}
                  className="border-b border-[#F0F0F0] last:border-0"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#171717]">{m.title}</p>
                    {m.description && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-[#737373]">
                        {m.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex h-6 w-8 items-center justify-center rounded bg-[#F0F0F0] text-[10px] font-bold text-[#525252]">
                      {TYPE_LABELS[m.type] || m.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#737373]">
                    {m.categoryName || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        m.visibility === "restricted"
                          ? "bg-[#FEF3C7] text-[#D97706]"
                          : "bg-[#E6FBF0] text-[#00D632]"
                      }`}
                    >
                      {m.visibility === "restricted" ? "Restricted" : "Public"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {m.visibility === "restricted" ? (
                      <button
                        onClick={() => setAccessMaterialId(m._id)}
                        className="text-xs text-[#3B82F6] hover:underline"
                      >
                        {m.accessGrantCount} grant
                        {m.accessGrantCount !== 1 ? "s" : ""}
                      </button>
                    ) : (
                      <span className="text-xs text-[#A3A3A3]">All users</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAccessMaterialId(m._id)}
                        className="text-xs text-[#3B82F6] hover:underline"
                      >
                        Access
                      </button>
                      <button
                        onClick={() => handleDelete(m._id, m.title)}
                        className="text-xs text-[#DC2626] hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ─── Upload Form ───

function UploadForm({
  categories,
  onSuccess,
  onError,
}: {
  categories: { _id: Id<"libraryCategories">; name: string }[];
  onSuccess: (msg: string) => void;
  onError: (err: unknown) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("pdf");
  const [url, setUrl] = useState("");
  const [pillar, setPillar] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [isRequired, setIsRequired] = useState(false);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const createMaterial = useMutation(api.materials.create);
  const generateUploadUrl = useMutation(api.library.generateUploadUrl);

  const isFileType = type === "pdf" || type === "docx" || type === "audio";
  const isLinkType = type === "youtube" || type === "link";

  const categoryOptions = [
    { label: "No Category", value: "" },
    ...categories.map((c) => ({ label: c.name, value: c._id })),
  ];

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      let storageId: Id<"_storage"> | undefined;

      if (isFileType && file) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const json = await result.json();
        storageId = json.storageId;
      }

      await createMaterial({
        title: title.trim(),
        description: description.trim() || undefined,
        type: type as "pdf" | "docx" | "youtube" | "link" | "audio",
        url: isLinkType && url.trim() ? url.trim() : undefined,
        storageId,
        pillar: pillar || undefined,
        categoryId: categoryId
          ? (categoryId as Id<"libraryCategories">)
          : undefined,
        visibility: visibility as "public" | "restricted",
        isRequired,
      });

      onSuccess(`"${title}" uploaded successfully.`);
      setTitle("");
      setDescription("");
      setType("pdf");
      setUrl("");
      setPillar("");
      setCategoryId("");
      setVisibility("public");
      setIsRequired(false);
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      onError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-[#E5E5E5] bg-white p-6">
      <h2 className="text-sm font-semibold text-[#171717]">Upload Resource</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm text-[#262626]">
            Title *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm outline-none focus:border-[#171717]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-[#262626]">Type</label>
          <Select value={type} onChange={setType} options={TYPE_OPTIONS} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-[#262626]">
            Visibility
          </label>
          <Select
            value={visibility}
            onChange={setVisibility}
            options={VISIBILITY_OPTIONS}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-[#262626]">
            Category
          </label>
          <Select
            value={categoryId}
            onChange={setCategoryId}
            options={categoryOptions}
            placeholder="No Category"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-[#262626]">Pillar</label>
          <Select
            value={pillar}
            onChange={setPillar}
            options={PILLAR_OPTIONS}
            placeholder="None"
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="mb-1.5 block text-sm text-[#262626]">
            Description
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm outline-none focus:border-[#171717]"
            placeholder="Optional description"
          />
        </div>

        {isLinkType && (
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="mb-1.5 block text-sm text-[#262626]">
              URL *
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={
                type === "youtube"
                  ? "https://youtube.com/watch?v=..."
                  : "https://..."
              }
              className="h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm outline-none focus:border-[#171717]"
            />
          </div>
        )}

        {isFileType && (
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="mb-1.5 block text-sm text-[#262626]">
              File *
            </label>
            <input
              ref={fileRef}
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              accept={
                type === "pdf"
                  ? ".pdf"
                  : type === "docx"
                    ? ".doc,.docx"
                    : ".mp3,.wav,.ogg,.m4a"
              }
              className="h-11 w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm text-[#525252] file:mr-3 file:rounded file:border-0 file:bg-[#F0F0F0] file:px-3 file:py-1 file:text-xs file:font-medium file:text-[#525252]"
            />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-[#525252]">
          <input
            type="checkbox"
            checked={isRequired}
            onChange={(e) => setIsRequired(e.target.checked)}
            className="h-4 w-4 rounded border-[#E5E5E5]"
          />
          Mark as required
        </label>
        <button
          onClick={handleSubmit}
          disabled={
            saving ||
            !title.trim() ||
            (isLinkType && !url.trim()) ||
            (isFileType && !file)
          }
          className="rounded-md bg-[#00D632] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}

// ─── Access Management Dialog ───

function AccessDialog({
  materialId,
  onClose,
  onSuccess,
  onError,
}: {
  materialId: Id<"materials">;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (err: unknown) => void;
}) {
  const [targetType, setTargetType] = useState<"cohort" | "user">("cohort");
  const [selectedCohort, setSelectedCohort] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [granting, setGranting] = useState(false);

  const accessList = useQuery(api.library.getAccessList, { materialId });
  const cohorts = useQuery(api.cohorts.listActive);
  const allUsers = useQuery(api.users.listByRole, { role: "beneficiary" });

  const grantAccess = useMutation(api.library.grantAccess);
  const revokeAccess = useMutation(api.library.revokeAccess);

  const handleGrant = async () => {
    setGranting(true);
    try {
      if (targetType === "cohort" && selectedCohort) {
        await grantAccess({
          materialId,
          targetType: "cohort",
          cohortId: selectedCohort as Id<"cohorts">,
        });
        onSuccess("Access granted to cohort.");
        setSelectedCohort("");
      } else if (targetType === "user" && selectedUser) {
        await grantAccess({
          materialId,
          targetType: "user",
          userId: selectedUser as Id<"users">,
        });
        onSuccess("Access granted to user.");
        setSelectedUser("");
      }
    } catch (err) {
      onError(err);
    } finally {
      setGranting(false);
    }
  };

  const handleRevoke = async (
    accessId: Id<"resourceAccess">,
    name: string,
  ) => {
    try {
      await revokeAccess({ accessId });
      onSuccess(`Access revoked from "${name}".`);
    } catch (err) {
      onError(err);
    }
  };

  const cohortOptions = (cohorts ?? []).map((c) => ({
    label: c.name,
    value: c._id,
  }));

  const userOptions = (allUsers ?? []).map((u) => ({
    label: `${u.name} (${u.email})`,
    value: u._id,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="mx-4 w-full max-w-lg rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#171717]">
            Manage Access
          </h2>
          <button
            onClick={onClose}
            className="text-[#737373] hover:text-[#171717]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M4 4l10 10M14 4L4 14" />
            </svg>
          </button>
        </div>

        {/* Current Grants */}
        <div className="mt-4">
          <p className="text-xs font-medium text-[#737373]">Current Access</p>
          {accessList === undefined ? (
            <div className="mt-2 flex justify-center py-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
            </div>
          ) : accessList.length === 0 ? (
            <p className="mt-2 text-xs text-[#A3A3A3]">
              No access grants yet.
            </p>
          ) : (
            <div className="mt-2 max-h-40 space-y-1.5 overflow-y-auto">
              {accessList.map((g) => (
                <div
                  key={g._id}
                  className="flex items-center justify-between rounded-lg bg-[#FAFAFA] px-3 py-2"
                >
                  <div>
                    <span className="text-xs font-medium text-[#171717]">
                      {g.targetName}
                    </span>
                    <span
                      className={`ml-2 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                        g.targetType === "cohort"
                          ? "bg-[#EDE9FE] text-[#7C3AED]"
                          : "bg-[#E0F2FE] text-[#0284C7]"
                      }`}
                    >
                      {g.targetType}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRevoke(g._id, g.targetName)}
                    className="text-[10px] text-[#DC2626] hover:underline"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Grant Access */}
        <div className="mt-4 border-t border-[#E5E5E5] pt-4">
          <p className="text-xs font-medium text-[#737373]">Grant Access</p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setTargetType("cohort")}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                targetType === "cohort"
                  ? "bg-[#171717] text-white"
                  : "bg-[#F0F0F0] text-[#525252]"
              }`}
            >
              Cohort
            </button>
            <button
              onClick={() => setTargetType("user")}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                targetType === "user"
                  ? "bg-[#171717] text-white"
                  : "bg-[#F0F0F0] text-[#525252]"
              }`}
            >
              Individual
            </button>
          </div>

          <div className="mt-3 flex items-end gap-2">
            <div className="flex-1">
              {targetType === "cohort" ? (
                <Select
                  value={selectedCohort}
                  onChange={setSelectedCohort}
                  options={cohortOptions}
                  placeholder="Select cohort..."
                  searchable
                />
              ) : (
                <Select
                  value={selectedUser}
                  onChange={setSelectedUser}
                  options={userOptions}
                  placeholder="Search users..."
                  searchable
                  searchPlaceholder="Type to search..."
                />
              )}
            </div>
            <button
              onClick={handleGrant}
              disabled={
                granting ||
                (targetType === "cohort" && !selectedCohort) ||
                (targetType === "user" && !selectedUser)
              }
              className="h-11 rounded-md bg-[#00D632] px-4 text-sm font-medium text-white disabled:opacity-50"
            >
              {granting ? "..." : "Grant"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Categories Tab ───

function CategoriesTab({
  onSuccess,
  onError,
}: {
  onSuccess: (msg: string) => void;
  onError: (err: unknown) => void;
}) {
  const categories = useQuery(api.libraryCategories.list, {});
  const createCategory = useMutation(api.libraryCategories.create);
  const updateCategory = useMutation(api.libraryCategories.update);
  const removeCategory = useMutation(api.libraryCategories.remove);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", slug: "" });
  const [editingId, setEditingId] = useState<Id<"libraryCategories"> | null>(
    null,
  );

  if (categories === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  const autoSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const slug = form.slug.trim() || autoSlug(form.name);
      await createCategory({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        slug,
      });
      onSuccess(`Category "${form.name}" created.`);
      setForm({ name: "", description: "", slug: "" });
      setShowForm(false);
    } catch (err) {
      onError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !form.name.trim()) return;
    setSaving(true);
    try {
      await updateCategory({
        categoryId: editingId,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        slug: form.slug.trim() || undefined,
      });
      onSuccess(`Category updated.`);
      setEditingId(null);
      setForm({ name: "", description: "", slug: "" });
      setShowForm(false);
    } catch (err) {
      onError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    categoryId: Id<"libraryCategories">,
    name: string,
  ) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      await removeCategory({ categoryId });
      onSuccess(`Category "${name}" deleted.`);
    } catch (err) {
      onError(err);
    }
  };

  const startEdit = (cat: (typeof categories)[0]) => {
    setEditingId(cat._id);
    setForm({
      name: cat.name,
      description: cat.description ?? "",
      slug: cat.slug,
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", description: "", slug: "" });
    setShowForm(false);
  };

  return (
    <>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-[#737373]">
          {categories.length} categor{categories.length === 1 ? "y" : "ies"}
        </p>
        <button
          onClick={() => (showForm ? cancelEdit() : setShowForm(true))}
          className="rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white hover:bg-[#262626]"
        >
          {showForm ? "Cancel" : "+ New Category"}
        </button>
      </div>

      {showForm && (
        <div className="mt-4 rounded-xl border border-[#E5E5E5] bg-white p-6">
          <h3 className="text-sm font-semibold text-[#171717]">
            {editingId ? "Edit Category" : "New Category"}
          </h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm text-[#262626]">
                Name *
              </label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                    slug: editingId ? form.slug : autoSlug(e.target.value),
                  })
                }
                className="h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm outline-none focus:border-[#171717]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#262626]">
                Slug
              </label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm text-[#737373] outline-none focus:border-[#171717]"
                placeholder="auto-generated"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#262626]">
                Description
              </label>
              <input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm outline-none focus:border-[#171717]"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={editingId ? handleUpdate : handleCreate}
              disabled={saving || !form.name.trim()}
              className="rounded-md bg-[#00D632] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-white py-16">
          <h2 className="text-base font-semibold text-[#171717]">
            No categories
          </h2>
          <p className="mt-1 text-sm text-[#737373]">
            Create categories to organize your resources.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="rounded-xl border border-[#E5E5E5] bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#171717]">
                  {cat.name}
                </h3>
                <span className="rounded-full bg-[#F0F0F0] px-2 py-0.5 text-[10px] text-[#737373]">
                  {cat.slug}
                </span>
              </div>
              {cat.description && (
                <p className="mt-1 text-xs text-[#737373]">
                  {cat.description}
                </p>
              )}
              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => startEdit(cat)}
                  className="text-xs text-[#3B82F6] hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cat._id, cat.name)}
                  className="text-xs text-[#DC2626] hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
