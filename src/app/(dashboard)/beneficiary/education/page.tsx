"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { EducationStepper } from "@/components/education/education-stepper";
import { useState } from "react";

type Stage = "primary" | "jss" | "sss" | "jamb" | "university" | "polytechnic" | "coe" | "nysc" | "post_nysc";

const STAGE_FIELDS: Record<string, string[]> = {
  primary: ["institutionName", "startYear", "endYear"],
  jss: ["institutionName", "startYear", "endYear", "grade"],
  sss: ["institutionName", "startYear", "endYear", "grade"],
  jamb: ["jambScore", "startYear"],
  university: ["institutionName", "courseOfStudy", "startYear", "endYear", "qualification", "grade"],
  polytechnic: ["institutionName", "courseOfStudy", "startYear", "endYear", "qualification", "grade"],
  coe: ["institutionName", "courseOfStudy", "startYear", "endYear", "qualification", "grade"],
  nysc: ["nyscState", "nyscPpa", "startYear", "endYear"],
  post_nysc: ["institutionName", "qualification", "startYear", "endYear", "notes"],
};

const FIELD_LABELS: Record<string, string> = {
  institutionName: "Institution Name",
  startYear: "Start Year",
  endYear: "End Year",
  qualification: "Qualification",
  grade: "Grade",
  jambScore: "JAMB Score",
  courseOfStudy: "Course of Study",
  nyscState: "NYSC State",
  nyscPpa: "NYSC PPA",
  notes: "Notes",
};

export default function EducationPage() {
  const user = useQuery(api.users.currentUser);
  const records = useQuery(api.education.getMyRecords);
  const createRecord = useMutation(api.education.create);
  const updateRecord = useMutation(api.education.update);
  const deleteRecord = useMutation(api.education.remove);

  const [selectedStage, setSelectedStage] = useState<string | undefined>();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  if (user === undefined || records === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  if (!user) return null;

  const selectedRecord = records.find((r) => r.stage === selectedStage);
  const fields = selectedStage ? STAGE_FIELDS[selectedStage] || [] : [];

  const handleStageSelect = (stage: string) => {
    setSelectedStage(stage);
    setEditing(false);
    const record = records.find((r) => r.stage === stage);
    if (record) {
      const formData: Record<string, string> = {};
      for (const field of STAGE_FIELDS[stage] || []) {
        const val = record[field as keyof typeof record];
        formData[field] = val !== undefined && val !== null ? String(val) : "";
      }
      setForm(formData);
    } else {
      setForm({});
      setEditing(true);
    }
  };

  const handleSave = async () => {
    if (!selectedStage || !user) return;
    setSaving(true);
    try {
      const args: Record<string, unknown> = {
        userId: user._id,
        stage: selectedStage as Stage,
        isCurrent: true,
      };
      for (const [key, value] of Object.entries(form)) {
        if (value === "") continue;
        if (key === "startYear" || key === "endYear" || key === "jambScore") {
          args[key] = parseInt(value);
        } else {
          args[key] = value;
        }
      }

      if (selectedRecord) {
        await updateRecord({
          recordId: selectedRecord._id,
          ...args,
          userId: undefined,
        } as Parameters<typeof updateRecord>[0]);
      } else {
        await createRecord(args as Parameters<typeof createRecord>[0]);
      }
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRecord) return;
    setSaving(true);
    try {
      await deleteRecord({ recordId: selectedRecord._id });
      setSelectedStage(undefined);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-xl font-semibold text-[#171717]">Education Journey</h1>
      <p className="mt-1 text-sm text-[#737373]">
        Track your education from primary school through post-NYSC.
      </p>

      <div className="mt-6">
        <EducationStepper
          records={records}
          onSelect={handleStageSelect}
          selectedStage={selectedStage}
        />
      </div>

      {selectedStage && (
        <div className="mt-6 rounded-xl border border-[#E5E5E5] bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#171717] capitalize">
              {selectedStage.replace("_", " ")}
            </h2>
            <div className="flex gap-2">
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="rounded-md bg-[#F0F0F0] px-3 py-1.5 text-xs font-medium text-[#525252] hover:bg-[#E5E5E5]"
                >
                  Edit
                </button>
              )}
              {selectedRecord && (
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-[#EF4444] hover:bg-red-50 disabled:opacity-50"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {editing ? (
            <div className="mt-4 space-y-4">
              {fields.map((field) => (
                <div key={field}>
                  <label className="mb-1.5 block text-sm text-[#262626]">
                    {FIELD_LABELS[field] || field}
                  </label>
                  <input
                    type={
                      field.includes("Year") || field === "jambScore"
                        ? "number"
                        : "text"
                    }
                    value={form[field] || ""}
                    onChange={(e) =>
                      setForm({ ...form, [field]: e.target.value })
                    }
                    className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm text-[#171717] outline-none focus:border-[#171717]"
                  />
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-md px-4 py-2 text-sm text-[#737373] hover:text-[#171717]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white hover:bg-[#262626] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : selectedRecord ? (
            <div className="mt-4 space-y-3">
              {fields.map((field) => {
                const val = selectedRecord[field as keyof typeof selectedRecord];
                return (
                  <div key={field} className="flex items-center justify-between border-b border-[#F0F0F0] pb-2 last:border-0">
                    <span className="text-sm text-[#737373]">{FIELD_LABELS[field]}</span>
                    <span className="text-sm text-[#171717]">
                      {val !== undefined && val !== null ? String(val) : <span className="text-[#D4D4D4]">—</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-center py-8">
              <p className="text-sm text-[#737373]">No record for this stage yet.</p>
              <button
                onClick={() => setEditing(true)}
                className="mt-2 rounded-md bg-[#00D632] px-4 py-2 text-sm font-medium text-white hover:bg-[#00C02D]"
              >
                Add Record
              </button>
            </div>
          )}
        </div>
      )}

      {!selectedStage && (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-white py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E6FBF0]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D632" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 2 4 3 6 3s6-1 6-3v-5" />
            </svg>
          </div>
          <h2 className="mt-4 text-base font-semibold text-[#171717]">Select a stage</h2>
          <p className="mt-1 text-sm text-[#737373]">
            Choose an education stage above to view or add records.
          </p>
        </div>
      )}
    </div>
  );
}
