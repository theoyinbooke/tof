"use client";

import { useState } from "react";
import { OverviewTab } from "@/components/analytics/OverviewTab";
import { BeneficiariesTab } from "@/components/analytics/BeneficiariesTab";
import { ProgramTab } from "@/components/analytics/ProgramTab";
import { AssessmentsTab } from "@/components/analytics/AssessmentsTab";
import { FinancialTab } from "@/components/analytics/FinancialTab";
import { ExportsTab } from "@/components/analytics/ExportsTab";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "beneficiaries", label: "Beneficiaries" },
  { key: "program", label: "Program" },
  { key: "assessments", label: "Assessments" },
  { key: "financial", label: "Financial" },
  { key: "exports", label: "Exports" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-xl font-semibold text-[#171717]">
        Reports & Analytics
      </h1>
      <p className="mt-1 text-sm text-[#737373]">
        Program performance, beneficiary insights, and data exports.
      </p>

      {/* Tab Navigation */}
      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-[#E5E5E5]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-[#171717] text-[#171717]"
                : "text-[#737373] hover:text-[#171717]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "beneficiaries" && <BeneficiariesTab />}
        {activeTab === "program" && <ProgramTab />}
        {activeTab === "assessments" && <AssessmentsTab />}
        {activeTab === "financial" && <FinancialTab />}
        {activeTab === "exports" && <ExportsTab />}
      </div>
    </div>
  );
}
