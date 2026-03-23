"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { Select, type SelectOption } from "@/components/ui/select";
import {
  getNigeriaLgaOptions,
  NIGERIAN_STATE_OPTIONS,
  NIGERIA_STATE_TO_LGAS,
} from "@/lib/nigeria-locations";

export default function ProfilePage() {
  const user = useQuery(api.users.currentUser);
  const profile = useQuery(api.beneficiaries.getMyProfile);
  const createProfile = useMutation(api.beneficiaries.createProfile);
  const updatePersonal = useMutation(api.beneficiaries.updatePersonalInfo);
  const updateFamily = useMutation(api.beneficiaries.updateFamilyContext);

  const [activeTab, setActiveTab] = useState<"personal" | "family">(
    "personal",
  );
  const [saving, setSaving] = useState(false);

  // Personal info form state
  const [personal, setPersonal] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    address: "",
    stateOfOrigin: "",
    lga: "",
  });

  // Family context form state
  const [family, setFamily] = useState({
    guardianName: "",
    guardianPhone: "",
    guardianRelationship: "",
    familySize: "",
    householdIncome: "",
  });

  useEffect(() => {
    if (profile) {
      setPersonal({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        dateOfBirth: profile.dateOfBirth || "",
        gender: profile.gender || "",
        phone: profile.phone || "",
        address: profile.address || "",
        stateOfOrigin: profile.stateOfOrigin || "",
        lga: profile.lga || "",
      });
      setFamily({
        guardianName: profile.guardianName || "",
        guardianPhone: profile.guardianPhone || "",
        guardianRelationship: profile.guardianRelationship || "",
        familySize: profile.familySize?.toString() || "",
        householdIncome: profile.householdIncome || "",
      });
    }
  }, [profile]);

  const hasKnownState = Boolean(NIGERIA_STATE_TO_LGAS[personal.stateOfOrigin]);
  const lgaOptions = hasKnownState
    ? getNigeriaLgaOptions(personal.stateOfOrigin)
    : [];

  if (user === undefined || profile === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  if (!user) return null;

  const canManageBeneficiaryProfile =
    user.role === "beneficiary" || user.role === "mentor";

  const handleCreateProfile = async () => {
    await createProfile({ userId: user._id });
  };

  const handleSavePersonal = async () => {
    setSaving(true);
    try {
      await updatePersonal({
        userId: user._id,
        ...personal,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFamily = async () => {
    setSaving(true);
    try {
      await updateFamily({
        userId: user._id,
        guardianName: family.guardianName,
        guardianPhone: family.guardianPhone,
        guardianRelationship: family.guardianRelationship,
        familySize: family.familySize ? parseInt(family.familySize) : undefined,
        householdIncome: family.householdIncome,
      });
    } finally {
      setSaving(false);
    }
  };

  if (!canManageBeneficiaryProfile) {
    return (
      <div className="p-6 lg:p-10">
        <h1 className="text-xl font-semibold text-[#171717]">Profile</h1>
        <div className="mt-6 rounded-xl border border-[#E5E5E5] bg-white p-6">
          <h2 className="text-base font-semibold text-[#171717]">{user.name}</h2>
          <p className="mt-1 text-sm text-[#737373]">{user.email}</p>
          <div className="mt-4 inline-flex items-center rounded-full border border-[#E5E5E5] px-2.5 py-0.5 text-xs text-[#525252]">
            {user.role}
          </div>
          <p className="mt-4 text-sm text-[#737373]">
            Detailed profile forms are only available for beneficiary accounts.
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 lg:p-10">
        <h1 className="text-xl font-semibold text-[#171717]">Profile</h1>
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-white py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E6FBF0]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D632" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
          <h2 className="mt-4 text-base font-semibold text-[#171717]">No profile yet</h2>
          <p className="mt-1 text-sm text-[#737373]">Create your profile to get started.</p>
          <button
            onClick={handleCreateProfile}
            className="mt-4 rounded-md bg-[#00D632] px-4 py-2 text-sm font-medium text-white hover:bg-[#00C02D]"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-[#171717]">Profile</h1>
          <p className="mt-1 text-sm text-[#737373]">
            {profile.profileCompletionPercent}% complete
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-[#E5E5E5]">
            <div
              className="h-full rounded-full bg-[#00D632] transition-all"
              style={{ width: `${profile.profileCompletionPercent}%` }}
            />
          </div>
          <span className="inline-flex items-center rounded-full border border-[#E5E5E5] px-2.5 py-0.5 text-xs text-[#525252]">
            {profile.lifecycleStatus}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 border-b border-[#E5E5E5]">
        <button
          onClick={() => setActiveTab("personal")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "personal"
              ? "border-b-2 border-[#171717] text-[#171717]"
              : "text-[#737373] hover:text-[#171717]"
          }`}
        >
          Personal Information
        </button>
        <button
          onClick={() => setActiveTab("family")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "family"
              ? "border-b-2 border-[#171717] text-[#171717]"
              : "text-[#737373] hover:text-[#171717]"
          }`}
        >
          Family Context
        </button>
      </div>

      {/* Forms */}
      <div className="mt-6 rounded-xl border border-[#E5E5E5] bg-white p-6">
        {activeTab === "personal" && (
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="First Name" value={personal.firstName} onChange={(v) => setPersonal({ ...personal, firstName: v })} />
              <FormField label="Last Name" value={personal.lastName} onChange={(v) => setPersonal({ ...personal, lastName: v })} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Date of Birth" type="date" value={personal.dateOfBirth} onChange={(v) => setPersonal({ ...personal, dateOfBirth: v })} />
              <FormField label="Gender" value={personal.gender} onChange={(v) => setPersonal({ ...personal, gender: v })} />
            </div>
            <FormField label="Phone" value={personal.phone} onChange={(v) => setPersonal({ ...personal, phone: v })} />
            <FormField label="Address" value={personal.address} onChange={(v) => setPersonal({ ...personal, address: v })} />
            <div className="grid gap-5 sm:grid-cols-2">
              <FormSelectField
                label="State of Origin"
                value={personal.stateOfOrigin}
                onChange={(stateOfOrigin) =>
                  setPersonal({
                    ...personal,
                    stateOfOrigin,
                    lga: stateOfOrigin === personal.stateOfOrigin ? personal.lga : "",
                  })
                }
                options={NIGERIAN_STATE_OPTIONS}
                placeholder="Search and select a state"
                searchPlaceholder="Search Nigerian states"
                emptyMessage="No state matches your search."
                searchable
              />
              <FormSelectField
                label="LGA"
                value={personal.lga}
                onChange={(lga) => setPersonal({ ...personal, lga })}
                options={lgaOptions}
                placeholder={
                  hasKnownState
                    ? "Search and select an LGA"
                    : "Select a state first"
                }
                searchPlaceholder="Search local governments"
                emptyMessage="No local government matches your search."
                disabled={!hasKnownState}
                searchable
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSavePersonal}
                disabled={saving}
                className="rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white hover:bg-[#262626] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "family" && (
          <div className="space-y-5">
            <FormField label="Guardian Name" value={family.guardianName} onChange={(v) => setFamily({ ...family, guardianName: v })} />
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Guardian Phone" value={family.guardianPhone} onChange={(v) => setFamily({ ...family, guardianPhone: v })} />
              <FormField label="Guardian Relationship" value={family.guardianRelationship} onChange={(v) => setFamily({ ...family, guardianRelationship: v })} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Family Size" type="number" value={family.familySize} onChange={(v) => setFamily({ ...family, familySize: v })} />
              <FormField label="Household Income" value={family.householdIncome} onChange={(v) => setFamily({ ...family, householdIncome: v })} />
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveFamily}
                disabled={saving}
                className="rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white hover:bg-[#262626] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-[#262626]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm text-[#171717] outline-none transition-colors focus:border-[#171717] placeholder:text-[#D4D4D4]"
      />
    </div>
  );
}

function FormSelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  disabled = false,
  searchable = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  disabled?: boolean;
  searchable?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-[#262626]">{label}</label>
      <Select
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        emptyMessage={emptyMessage}
        disabled={disabled}
        searchable={searchable}
      />
    </div>
  );
}
