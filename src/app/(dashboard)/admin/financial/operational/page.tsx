"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import Link from "next/link";
import { useState } from "react";
import { Select } from "@/components/ui/select";
import {
  ErrorToast,
  SuccessToast,
  useMutationWithError,
} from "@/components/ui/mutation-error-toast";
import { Doc, Id } from "../../../../../../convex/_generated/dataModel";

const CATEGORY_OPTIONS = [
  { label: "School Fees", value: "school_fees" },
  { label: "Supplies", value: "supplies" },
  { label: "Transport", value: "transport" },
  { label: "Utilities", value: "utilities" },
  { label: "Salaries", value: "salaries" },
  { label: "Events", value: "events" },
  { label: "Equipment", value: "equipment" },
  { label: "Rent", value: "rent" },
  { label: "Other", value: "other" },
] as const;

const CATEGORY_FILTERS = [
  { label: "All", value: "all" },
  ...CATEGORY_OPTIONS,
];

type Category = Doc<"operationalExpenses">["category"];

type FormState = {
  category: Category;
  amount: string;
  description: string;
  expenseDate: string;
  payee: string;
  beneficiaryName: string;
  bankReference: string;
};

const INITIAL_FORM: FormState = {
  category: "school_fees",
  amount: "",
  description: "",
  expenseDate: new Date().toISOString().slice(0, 10),
  payee: "",
  beneficiaryName: "",
  bankReference: "",
};

export default function AdminOperationalExpensesPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<Id<"operationalExpenses"> | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const expenses = useQuery(api.operationalExpenses.list, {
    category: categoryFilter === "all" ? undefined : (categoryFilter as Category),
  });
  const summary = useQuery(api.operationalExpenses.summary);
  const createExpense = useMutation(api.operationalExpenses.create);
  const updateExpense = useMutation(api.operationalExpenses.update);
  const removeExpense = useMutation(api.operationalExpenses.remove);
  const { error, clearError, handleError } = useMutationWithError();

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (e: NonNullable<typeof expenses>[number]) => {
    setEditingId(e._id);
    setForm({
      category: e.category,
      amount: String(e.amount),
      description: e.description,
      expenseDate: new Date(e.expenseDate).toISOString().slice(0, 10),
      payee: e.payee ?? "",
      beneficiaryName: e.beneficiaryName ?? "",
      bankReference: e.bankReference ?? "",
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    clearError();
    try {
      const amount = parseFloat(form.amount);
      if (!amount || amount <= 0) throw new Error("Amount must be a positive number.");
      if (!form.description.trim()) throw new Error("Description is required.");
      const expenseDate = form.expenseDate
        ? new Date(form.expenseDate).getTime()
        : undefined;

      if (editingId) {
        await updateExpense({
          expenseId: editingId,
          category: form.category,
          amount,
          description: form.description,
          expenseDate,
          payee: form.payee || undefined,
          beneficiaryName: form.beneficiaryName || undefined,
          bankReference: form.bankReference || undefined,
        });
        setSuccessMessage("Operational expense updated.");
      } else {
        await createExpense({
          category: form.category,
          amount,
          description: form.description,
          expenseDate,
          payee: form.payee || undefined,
          beneficiaryName: form.beneficiaryName || undefined,
          bankReference: form.bankReference || undefined,
        });
        setSuccessMessage("Operational expense recorded.");
      }
      resetForm();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: Id<"operationalExpenses">) => {
    if (!confirm("Delete this operational expense? This cannot be undone.")) return;
    clearError();
    try {
      await removeExpense({ expenseId: id });
      setSuccessMessage("Operational expense deleted.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      handleError(err);
    }
  };

  if (expenses === undefined || summary === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      {successMessage && (
        <SuccessToast message={successMessage} onClose={() => setSuccessMessage(null)} />
      )}
      {error && <ErrorToast message={error} onClose={clearError} />}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/admin/financial"
            className="text-xs text-[#737373] hover:text-[#171717]"
          >
            ← Financial
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-[#171717]">
            Operational Expenses
          </h1>
          <p className="mt-0.5 text-sm text-[#737373]">
            Record general program costs (e.g. school fees for kids without an account, supplies, utilities). These count toward total platform expenses.
          </p>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
          className="rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white hover:bg-[#262626]"
        >
          {showForm ? "Cancel" : "+ Record Expense"}
        </button>
      </div>

      {/* Summary */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">Total Operational</p>
          <p className="mt-2 text-2xl font-semibold text-[#171717]">
            ₦{summary.totalAmount.toLocaleString()}
          </p>
          <p className="mt-0.5 text-xs text-[#737373]">{summary.count} entries</p>
        </div>
        {Object.entries(summary.byCategory)
          .sort((a, b) => b[1].total - a[1].total)
          .slice(0, 2)
          .map(([cat, agg]) => (
            <div key={cat} className="rounded-xl border border-[#E5E5E5] bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-[#737373] capitalize">
                {cat.replace(/_/g, " ")}
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#171717]">
                ₦{agg.total.toLocaleString()}
              </p>
              <p className="mt-0.5 text-xs text-[#737373]">
                {agg.count} {agg.count === 1 ? "entry" : "entries"}
              </p>
            </div>
          ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="mt-4 rounded-xl border border-[#E5E5E5] bg-white p-6">
          <p className="text-sm font-semibold text-[#171717]">
            {editingId ? "Edit Operational Expense" : "Record New Operational Expense"}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-[#262626]">Category</label>
              <Select
                value={form.category}
                onChange={(val) => setForm({ ...form, category: val as Category })}
                options={[...CATEGORY_OPTIONS]}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#262626]">Amount (₦)</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm outline-none focus:border-[#171717]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm text-[#262626]">
                Description / Note
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="What is this expense for? Add any details that help future reference."
                className="w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:border-[#171717]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#262626]">Expense Date</label>
              <input
                type="date"
                value={form.expenseDate}
                onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
                className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm outline-none focus:border-[#171717]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#262626]">
                Payee <span className="text-[#A3A3A3]">(optional)</span>
              </label>
              <input
                type="text"
                value={form.payee}
                onChange={(e) => setForm({ ...form, payee: e.target.value })}
                placeholder="School name, vendor, person paid"
                className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm outline-none focus:border-[#171717]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#262626]">
                Beneficiary Name <span className="text-[#A3A3A3]">(optional)</span>
              </label>
              <input
                type="text"
                value={form.beneficiaryName}
                onChange={(e) => setForm({ ...form, beneficiaryName: e.target.value })}
                placeholder="e.g. child whose school fees were paid"
                className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm outline-none focus:border-[#171717]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#262626]">
                Bank Reference <span className="text-[#A3A3A3]">(optional)</span>
              </label>
              <input
                type="text"
                value={form.bankReference}
                onChange={(e) => setForm({ ...form, bankReference: e.target.value })}
                className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm outline-none focus:border-[#171717]"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={resetForm}
              className="rounded-md border border-[#E5E5E5] bg-white px-4 py-2 text-sm font-medium text-[#262626] hover:bg-[#F7F7F7]"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || !form.amount || !form.description.trim()}
              className="rounded-md bg-[#00D632] px-4 py-2 text-sm font-medium text-white hover:bg-[#00C02D] disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId ? "Save Changes" : "Record Expense"}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        {CATEGORY_FILTERS.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategoryFilter(c.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              categoryFilter === c.value
                ? "bg-[#171717] text-white"
                : "bg-[#F0F0F0] text-[#525252] hover:bg-[#E5E5E5]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* List */}
      {expenses.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-white py-16">
          <h2 className="text-base font-semibold text-[#171717]">No expenses recorded</h2>
          <p className="mt-1 text-sm text-[#737373]">
            No operational expenses match this filter.
          </p>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
          {expenses.map((e, i) => (
            <div
              key={e._id}
              className={`flex items-start justify-between gap-4 px-4 py-3 text-sm ${
                i > 0 ? "border-t border-[#F0F0F0]" : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-[#171717] truncate">
                    ₦{e.amount.toLocaleString()}
                  </p>
                  <span className="rounded-full bg-[#F0F0F0] px-2 py-0.5 text-[10px] font-medium text-[#525252] capitalize">
                    {e.category.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-[#262626] line-clamp-2">{e.description}</p>
                <p className="mt-1 text-xs text-[#737373] truncate">
                  {new Date(e.expenseDate).toLocaleDateString()}
                  {e.payee ? ` · ${e.payee}` : ""}
                  {e.beneficiaryName ? ` · for ${e.beneficiaryName}` : ""}
                  {e.bankReference ? ` · ref ${e.bankReference}` : ""}
                  {` · recorded by ${e.recorderName}`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => startEdit(e)}
                  className="rounded-md border border-[#E5E5E5] bg-white px-2.5 py-1 text-xs font-medium text-[#262626] hover:bg-[#F7F7F7]"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(e._id)}
                  className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
